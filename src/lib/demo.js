import { currentUser } from './constants.js';

export const DEMO_SESSION_STORAGE = 'cohort_demo_session';

export const demoUsers = [
  currentUser,
  {
    ...currentUser,
    id: 'fixture-user-isha',
    full_name: 'Isha Thakur',
    username: 'isha',
    email: 'isha@pccoepune.org',
    branch: 'Information Technology',
    year: 2,
    division: 'B',
    bio: 'Exploring communities, design, and student collaboration at PCCOE.',
    role: 'student',
    skills: ['Design', 'React', 'Community'],
    interests: ['ACM', 'Art Circle', 'Hackathons'],
  },
];

export function getStoredDemoUser() {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return demoUsers.find((user) => user.id === parsed.userId) ?? demoUsers[0];
  } catch {
    return null;
  }
}

export function startDemoSession(userId = demoUsers[0].id) {
  const user = demoUsers.find((item) => item.id === userId) ?? demoUsers[0];
  localStorage.setItem(DEMO_SESSION_STORAGE, JSON.stringify({ userId: user.id, startedAt: new Date().toISOString() }));
  return user;
}

export function clearDemoSession() {
  localStorage.removeItem(DEMO_SESSION_STORAGE);
}

export function isDemoSessionActive() {
  return Boolean(getStoredDemoUser());
}
