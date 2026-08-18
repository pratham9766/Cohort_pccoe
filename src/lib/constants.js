export const allowedEmailDomains = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS ?? 'pccoe.org,pccoepune.org')
  .split(',')
  .map((domain) => domain.trim().toLowerCase())
  .filter(Boolean);

export const currentUser = {
  id: 'fixture-user',
  full_name: 'Pratham Bokefode',
  username: 'pratham',
  email: 'pratham@pccoepune.org',
  avatar_url: '',
  year: 3,
  branch: 'Computer Engineering',
  division: 'A',
  bio: 'Building the campus operating layer for PCCOE.',
  role: 'student',
  skills: ['React', 'Supabase', 'Security', 'Product'],
  interests: ['GDGC', 'ACM', 'Startups'],
  is_onboarded: true,
};

export const communities = [
  { id: 'gdgc-pccoe', slug: 'gdgc-pccoe', name: 'GDGC PCCOE', category: 'Technical', member_count: 936, post_count: 38, subscribed: true, description: 'Google Developer Groups on Campus for builders and learners.' },
  { id: 'acm-pccoe', slug: 'acm-pccoe', name: 'ACM Chapter', category: 'Technical', member_count: 701, post_count: 31, subscribed: false, description: 'Competitive programming, research, and computing workshops.' },
  { id: 'art-circle', slug: 'art-circle', name: 'Art Circle', category: 'Cultural', member_count: 414, post_count: 19, subscribed: false, description: 'Design, theatre, painting, music, and campus performances.' },
  { id: 'nss-pccoe', slug: 'nss-pccoe', name: 'NSS PCCOE', category: 'Social', member_count: 629, post_count: 24, subscribed: true, description: 'Social impact drives, volunteering, awareness and outreach.' },
  { id: 'ieee-pccoe', slug: 'ieee-pccoe', name: 'IEEE PCCOE', category: 'Technical', member_count: 532, post_count: 28, subscribed: false, description: 'Engineering talks, standards, electronics, and innovation.' },
  { id: 'robotics-club', slug: 'robotics-club', name: 'Robotics Club', category: 'Technical', member_count: 390, post_count: 17, subscribed: false, description: 'Robotics, embedded systems, automation, and competitions.' },
  { id: 'ecell-pccoe', slug: 'ecell-pccoe', name: 'E-Cell PCCOE', category: 'Academic', member_count: 488, post_count: 22, subscribed: false, description: 'Entrepreneurship, pitches, founder talks, and startup practice.' },
  { id: 'sports-council', slug: 'sports-council', name: 'Sports Council', category: 'Sports', member_count: 574, post_count: 15, subscribed: false, description: 'Trials, tournaments, fixtures, and team announcements.' },
];

export const posts = [
  {
    id: 'p1',
    author: currentUser,
    community: communities[0],
    content: 'GDGC study jam registrations are open. We will cover product ideation, frontend basics, and a mini prototype sprint for first years.',
    like_count: 128,
    comment_count: 16,
    is_pinned: true,
    created_at: '14m ago',
  },
  {
    id: 'p2',
    author: { full_name: 'Isha Thakur', branch: 'IT', year: 2 },
    community: communities[1],
    content: 'GDGC study jam starts this Friday. Bring your laptop, curiosity, and one app idea you want to prototype.',
    like_count: 94,
    comment_count: 11,
    is_pinned: false,
    created_at: '1h ago',
  },
  {
    id: 'p3',
    author: { full_name: 'Prof. Meera Joshi', branch: 'Faculty', year: null },
    community: communities[4],
    content: 'Blood donation camp volunteers should report near the admin block at 9:00 AM. Certificates will be issued by NSS.',
    like_count: 61,
    comment_count: 8,
    is_pinned: false,
    created_at: '3h ago',
  },
];

export const conversations = [
  { id: 'c1', name: 'GDGC Core Team', unread: 3, last_message: 'Push the registration post by tonight.', time: '2:34 PM', online: true },
  { id: 'c2', name: 'Isha Thakur', unread: 0, last_message: 'Can you review the GDGC poster?', time: '1:02 PM', online: true },
  { id: 'c3', name: 'E-Cell Pitch Prep', unread: 5, last_message: 'Deck reviews begin after lectures.', time: 'Yesterday', online: false },
];

export const messages = [
  { id: 'm1', mine: false, body: 'Hey, are you joining the GDGC study jam?', time: '2:31 PM' },
  { id: 'm2', mine: true, body: 'Yes. I am bringing the prototype checklist too.', time: '2:32 PM' },
  { id: 'm3', mine: false, body: 'Perfect. We will announce it after the intro.', time: '2:34 PM' },
];

export const xdPosts = [
  { id: 'x1', category: 'Tips', content: 'If you are new to hackathons, join a team for learning first. Winning comes later.', vote_count: 82, comment_count: 14, created_at: '22m ago' },
  { id: 'x2', category: 'Opportunities', content: 'The internship referral spreadsheet is useful, but please verify deadlines before applying.', vote_count: 54, comment_count: 9, created_at: '1h ago' },
  { id: 'x3', category: 'Ideas', content: 'A campus lost-and-found board with item photos and pickup location would save everyone time.', vote_count: 41, comment_count: 6, created_at: '4h ago' },
];

export const calendarEvents = [
  { id: 'e1', title: 'GDGC Product Jam', event_type: 'workshop', start_date: '2026-08-21T10:00:00+05:30', location: 'Seminar Hall B' },
  { id: 'e2', title: 'Mid-Semester Exam Form Deadline', event_type: 'deadline', start_date: '2026-08-24T17:00:00+05:30', location: 'ERP Portal' },
  { id: 'e3', title: 'Induction Cultural Evening', event_type: 'event', start_date: '2026-08-29T18:00:00+05:30', location: 'Open Amphitheatre' },
];

export const campusLocations = [
  { id: 'l1', name: 'Admin Block', category: 'admin', building: 'Main Building', floor: 'Ground', latitude: 18.6286, longitude: 73.8394, description: 'Administrative offices and reception.' },
  { id: 'l2', name: 'Central Canteen', category: 'canteen', building: 'Student Area', floor: 'Ground', latitude: 18.6289, longitude: 73.839, description: 'Food court and student hangout.' },
  { id: 'l3', name: 'Computer Lab 3', category: 'lab', building: 'Comp Department', floor: 'Second', latitude: 18.6283, longitude: 73.8398, description: 'Programming lab and workshop room.' },
  { id: 'l4', name: 'Seminar Hall B', category: 'classroom', building: 'Academic Block', floor: 'First', latitude: 18.6287, longitude: 73.8401, description: 'Talks, workshops, and club events.' },
];
