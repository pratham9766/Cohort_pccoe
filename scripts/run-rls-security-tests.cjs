const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const root = path.resolve(__dirname, '..');

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

function normalizeConnectionString(value) {
  return value?.replace(/^postgresql\+psycopg:\/\//, 'postgresql://');
}

const env = { ...readEnv(path.join(root, '.env')), ...process.env };
const connectionString = normalizeConnectionString(env.DATABASE_URL);

const ids = {
  userA: '10000000-0000-4000-8000-000000000001',
  userB: '10000000-0000-4000-8000-000000000002',
  moderator: '10000000-0000-4000-8000-000000000003',
  admin: '10000000-0000-4000-8000-000000000004',
  outsider: '10000000-0000-4000-8000-000000000005',
  postA: '20000000-0000-4000-8000-000000000001',
  postB: '20000000-0000-4000-8000-000000000002',
  commentA: '30000000-0000-4000-8000-000000000001',
  commentB: '30000000-0000-4000-8000-000000000002',
  communityA: '40000000-0000-4000-8000-000000000001',
  conversationB: '50000000-0000-4000-8000-000000000001',
  messageB: '60000000-0000-4000-8000-000000000001',
  xdPostA: '70000000-0000-4000-8000-000000000001',
  eventA: '80000000-0000-4000-8000-000000000001',
};

async function asUser(client, userId, fn) {
  await client.query('BEGIN');
  try {
    await client.query('SET LOCAL ROLE authenticated');
    await client.query(`SELECT set_config('request.jwt.claim.sub', $1, true)`, [userId ?? '']);
    const result = await fn();
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function expectDenied(name, operation) {
  try {
    const result = await operation();
    if (typeof result?.rowCount === 'number' && result.rowCount === 0) {
      console.log(`PASS ${name}`);
      return;
    }
    throw new Error(`Expected denial, got ${JSON.stringify(result?.rows ?? result ?? null)}`);
  } catch (error) {
    if (/permission denied|violates row-level security|new row violates row-level security|not allowed|Expected denial/i.test(error.message)) {
      console.log(`PASS ${name}`);
      return;
    }
    throw new Error(`${name}: ${error.message}`);
  }
}

async function expectAllowed(name, operation, verifier = (result) => result.rowCount > 0) {
  const result = await operation();
  if (!verifier(result)) throw new Error(`${name}: operation did not affect/return expected rows`);
  console.log(`PASS ${name}`);
}

async function seed(client) {
  await client.query(`
    INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
      ($1, 'usera@pccoepune.org', '{"full_name":"Security User A"}'),
      ($2, 'userb@pccoepune.org', '{"full_name":"Security User B"}'),
      ($3, 'mod@pccoepune.org', '{"full_name":"Security Moderator"}'),
      ($4, 'admin@pccoepune.org', '{"full_name":"Security Admin"}'),
      ($5, 'outsider@pccoepune.org', '{"full_name":"Security Outsider"}')
    ON CONFLICT (id) DO NOTHING;
  `, [ids.userA, ids.userB, ids.moderator, ids.admin, ids.outsider]);

  await client.query('ALTER TABLE public.users DISABLE TRIGGER trg_validate_user_profile');
  try {
    await client.query(`
      INSERT INTO public.users (id, email, full_name, role, is_verified, is_onboarded) VALUES
        ($1, 'usera@pccoepune.org', 'Security User A', 'student', true, true),
        ($2, 'userb@pccoepune.org', 'Security User B', 'student', true, true),
        ($3, 'mod@pccoepune.org', 'Security Moderator', 'moderator', true, true),
        ($4, 'admin@pccoepune.org', 'Security Admin', 'platform_admin', true, true),
        ($5, 'outsider@pccoepune.org', 'Security Outsider', 'student', true, true)
      ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        is_verified = true,
        is_onboarded = true;
    `, [ids.userA, ids.userB, ids.moderator, ids.admin, ids.outsider]);
  } finally {
    await client.query('ALTER TABLE public.users ENABLE TRIGGER trg_validate_user_profile');
  }

  await client.query(`
    INSERT INTO public.communities (id, slug, name, description, category, admin_id, is_active)
    VALUES ($1, 'security-community-a', 'Security Community A', 'Security test community', 'Technical', $2, true)
    ON CONFLICT (id) DO UPDATE SET admin_id = EXCLUDED.admin_id, is_active = true;
  `, [ids.communityA, ids.admin]);

  await client.query(`
    INSERT INTO public.posts (id, author_id, community_id, content) VALUES
      ($1, $2, $5, 'Security post A'),
      ($3, $4, $5, 'Security post B')
    ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, author_id = EXCLUDED.author_id;
  `, [ids.postA, ids.userA, ids.postB, ids.userB, ids.communityA]);

  await client.query(`
    INSERT INTO public.comments (id, post_id, author_id, content) VALUES
      ($1, $2, $3, 'Security comment A'),
      ($4, $5, $6, 'Security comment B')
    ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, author_id = EXCLUDED.author_id;
  `, [ids.commentA, ids.postA, ids.userA, ids.commentB, ids.postB, ids.userB]);

  await client.query(`
    INSERT INTO public.conversations (id, type, created_by, last_message)
    VALUES ($1, 'direct', $2, 'private')
    ON CONFLICT (id) DO UPDATE SET created_by = EXCLUDED.created_by;
  `, [ids.conversationB, ids.userB]);

  await client.query(`
    INSERT INTO public.conversation_members (conversation_id, user_id, role) VALUES
      ($1, $2, 'admin'),
      ($1, $3, 'member')
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  `, [ids.conversationB, ids.userB, ids.admin]);

  await client.query(`
    INSERT INTO public.messages (id, conversation_id, sender_id, content, message_type)
    VALUES ($1, $2, $3, 'private B message', 'text')
    ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;
  `, [ids.messageB, ids.conversationB, ids.userB]);

  await client.query(`
    INSERT INTO public.xd_posts (id, author_id, content, category)
    VALUES ($1, $2, 'Anonymous security post', 'Tips')
    ON CONFLICT (id) DO UPDATE SET author_id = EXCLUDED.author_id, content = EXCLUDED.content;
  `, [ids.xdPostA, ids.userA]);

  await client.query(`
    INSERT INTO public.calendar_events (id, title, event_type, start_date, community_id, created_by)
    VALUES ($1, 'Security Event', 'workshop', NOW() + interval '1 day', $2, $3)
    ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
  `, [ids.eventA, ids.communityA, ids.admin]);
}

async function main() {
  if (!connectionString) throw new Error('DATABASE_URL is missing');
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await seed(client);

    await expectDenied('cannot_update_other_profile', () =>
      asUser(client, ids.userA, () => client.query('UPDATE public.users SET full_name = $1 WHERE id = $2', ['Hacked B', ids.userB])),
    );

    await expectDenied('cannot_delete_other_post', () =>
      asUser(client, ids.userA, () => client.query('DELETE FROM public.posts WHERE id = $1', [ids.postB])),
    );

    await expectDenied('cannot_edit_other_post', () =>
      asUser(client, ids.userA, () => client.query('UPDATE public.posts SET content = $1 WHERE id = $2', ['Hacked post', ids.postB])),
    );

    await expectDenied('cannot_delete_other_comment', () =>
      asUser(client, ids.userA, () => client.query('DELETE FROM public.comments WHERE id = $1', [ids.commentB])),
    );

    await expectDenied('cannot_forge_likes', () =>
      asUser(client, ids.userA, () => client.query('INSERT INTO public.post_reactions (post_id, user_id) VALUES ($1, $2)', [ids.postB, ids.userB])),
    );

    await expectDenied('cannot_read_other_conversation', () =>
      asUser(client, ids.userA, () => client.query('SELECT * FROM public.messages WHERE conversation_id = $1', [ids.conversationB])),
    );

    await expectDenied('cannot_send_to_unjoined_conversation', () =>
      asUser(client, ids.userA, () => client.query('INSERT INTO public.messages (conversation_id, sender_id, content) VALUES ($1, $2, $3)', [ids.conversationB, ids.userA, 'intrusion'])),
    );

    await expectAllowed(
      'cannot_read_xd_author',
      () => asUser(client, ids.userB, () => client.query('SELECT * FROM public.xd_posts WHERE id = $1', [ids.xdPostA])),
      (result) => result.rowCount === 0,
    );

    await expectAllowed(
      'can_read_xd_public_view_without_author',
      () => asUser(client, ids.userB, () => client.query('SELECT * FROM public.xd_public_posts WHERE id = $1', [ids.xdPostA])),
      (result) => result.rowCount === 1 && !Object.prototype.hasOwnProperty.call(result.rows[0], 'author_id'),
    );

    await expectDenied('cannot_escalate_role', () =>
      asUser(client, ids.userA, () => client.query('UPDATE public.users SET role = $1 WHERE id = $2', ['platform_admin', ids.userA])),
    );

    await expectDenied('cannot_write_audit_logs', () =>
      asUser(client, ids.userA, () => client.query('INSERT INTO public.audit_logs (actor_id, action, entity_type) VALUES ($1, $2, $3)', [ids.userA, 'fake', 'users'])),
    );

    await expectDenied('cannot_create_official_event_without_permission', () =>
      asUser(client, ids.userA, () => client.query('INSERT INTO public.calendar_events (title, event_type, start_date, created_by) VALUES ($1, $2, NOW(), $3)', ['Fake Event', 'academic', ids.userA])),
    );

    await expectDenied('cannot_manage_other_community', () =>
      asUser(client, ids.userA, () => client.query('UPDATE public.communities SET name = $1 WHERE id = $2', ['Hacked Community', ids.communityA])),
    );

    await expectDenied('cannot_upload_into_other_user_path', () =>
      asUser(client, ids.userA, () => client.query('INSERT INTO storage.objects (bucket_id, name, owner) VALUES ($1, $2, $3)', ['avatars', `${ids.userB}/avatar.webp`, ids.userA])),
    );

    await expectAllowed('own_profile_update_allowed', () =>
      asUser(client, ids.userA, () => client.query('UPDATE public.users SET bio = $1 WHERE id = $2', ['Allowed own update', ids.userA])),
    );

    await expectAllowed('own_post_delete_allowed', () =>
      asUser(client, ids.userA, () => client.query('DELETE FROM public.posts WHERE id = $1', [ids.postA])),
    );

    await expectAllowed('moderator_can_view_raw_xd_author', () =>
      asUser(client, ids.moderator, () => client.query('SELECT author_id FROM public.xd_posts WHERE id = $1', [ids.xdPostA])),
      (result) => result.rowCount === 1 && result.rows[0].author_id === ids.userA,
    );

    await expectAllowed('admin_can_write_audit_log', () =>
      asUser(client, ids.admin, () => client.query('INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)', [ids.admin, 'security_test', 'xd_post', ids.xdPostA])),
    );

    console.log('RLS security tests passed');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
