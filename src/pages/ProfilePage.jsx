import { Flag, Puzzle, UserPlus, Users } from 'lucide-react';
import { ProfileSummary } from '@/components/features/profile/ProfileSummary.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useAuthStore } from '@/stores/authStore.js';

const profileStats = [
  { icon: Users, value: 5, label: 'Communities', artwork: '/stickers/spider-dive.jpeg' },
  { icon: UserPlus, value: 0, label: 'Followers', artwork: '/stickers/spider-sit.jpeg' },
  { icon: Puzzle, value: 3, label: 'Following', artwork: '/stickers/spider-crouch.jpeg' },
  { icon: Flag, value: 0, label: 'Flex', artwork: '/stickers/spider-hang.jpeg' },
];

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return (
      <section className="page stack">
        <Card><p className="muted">Profile is unavailable until you sign in with Supabase.</p></Card>
      </section>
    );
  }

  return (
    <section className="page profile-page">
      <ProfileSummary user={user} />

      <div className="profile-stat-grid" aria-label="Profile stats">
        {profileStats.map((stat) => (
          <Card key={stat.label} className="profile-stat-card">
            <img src={stat.artwork} alt="" aria-hidden="true" />
            <stat.icon size={22} aria-hidden="true" />
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </Card>
        ))}
      </div>

      <section className="profile-activity" aria-labelledby="profile-activity-heading">
        <div className="profile-section-title">
          <h2 id="profile-activity-heading">Activity</h2>
          <span />
        </div>

        <div className="profile-tabs" role="tablist" aria-label="Profile activity">
          <button type="button" className="active" role="tab" aria-selected="true">
            Posts <span>0</span>
          </button>
          <button type="button" role="tab" aria-selected="false">
            Replies <span>0</span>
          </button>
        </div>

        <div className="profile-empty-state">
          <img src="/stickers/spider-hang.jpeg" alt="" aria-hidden="true" />
          <p>No posts yet.</p>
        </div>
        <button type="button" className="profile-help-button" aria-label="Open assistant">
          <span />
          <span />
        </button>
      </section>
    </section>
  );
}
