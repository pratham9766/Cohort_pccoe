# Product Requirements Document (PRD)
## Cohort PCCOE — Campus Social Platform Clone

**Version:** 1.0  
**Date:** 2026-08-17  
**Status:** Draft  

---

## 1. Executive Summary

Cohort PCCOE is the **official student-led social platform** designed exclusively for the Pimpri Chinchwad College of Engineering (PCCOE), Pune. It serves as a centralized digital campus hub — replacing fragmented WhatsApp groups, Instagram pages, and email chains — with a unified platform where students discover communities, connect with peers, collaborate, and stay updated on campus opportunities.

> [!IMPORTANT]
> This document outlines all functional and non-functional requirements for building a full-featured clone of the Cohort PCCOE platform from scratch.

---

## 2. Product Vision

| Attribute | Detail |
|---|---|
| **Mission** | Unify the PCCOE campus community on a single secure, student-built platform |
| **Target Users** | Current students, alumni, and faculty of PCCOE |
| **Platform** | Web (React SPA), with future mobile app potential |
| **Authentication** | Google OAuth (restricted to PCCOE accounts) |
| **Tagline** | "Discover. Connect. Collaborate." |

---

## 3. User Personas

### 3.1 Active Student
- **Age**: 18–22
- **Needs**: Discover events, join clubs, chat with classmates, find internship tips
- **Pain Points**: Misses club announcements, unaware of campus opportunities

### 3.2 Club/Community Admin
- **Age**: 19–23
- **Needs**: Post announcements, manage member subscriptions, share event details
- **Pain Points**: Low engagement on Instagram/WhatsApp, no single platform for updates

### 3.3 Faculty Member
- **Age**: 28–55
- **Needs**: Share academic notices, view student achievements, monitor calendars
- **Pain Points**: Difficulty reaching all students with updates

### 3.4 Alumni
- **Age**: 22+
- **Needs**: Stay connected to campus, mentor juniors, view their alma mater's activities
- **Pain Points**: No official alumni network for PCCOE

---

## 4. Core Features & Requirements

### 4.1 Authentication & Onboarding

| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | Users must authenticate via Google OAuth | P0 |
| AUTH-02 | Only verified PCCOE Google accounts can register (domain restriction) | P0 |
| AUTH-03 | New users complete a profile setup wizard (name, bio, year, branch, interests) | P0 |
| AUTH-04 | Returning users are redirected to dashboard on login | P0 |
| AUTH-05 | Session persistence across browser tabs | P1 |
| AUTH-06 | Secure logout with session invalidation | P1 |

---

### 4.2 Home Feed

| ID | Requirement | Priority |
|---|---|---|
| FEED-01 | Personalized content feed based on subscribed communities and connections | P0 |
| FEED-02 | Display posts, announcements, and discussion threads from friends & communities | P0 |
| FEED-03 | Like, comment, and share reactions on posts | P1 |
| FEED-04 | Create text, image, and link posts | P1 |
| FEED-05 | Infinite scroll with lazy loading | P1 |
| FEED-06 | Pin featured/admin announcements at the top | P2 |
| FEED-07 | Trending tags sidebar | P2 |

---

### 4.3 Communities (Clubs & Organizations)

| ID | Requirement | Priority |
|---|---|---|
| COMM-01 | List of 30+ campus clubs and organizations | P0 |
| COMM-02 | Students can browse and subscribe to communities | P0 |
| COMM-03 | Each community has a dedicated page with posts, members, and about section | P0 |
| COMM-04 | Community admins can post announcements, events, and media | P0 |
| COMM-05 | Subscription notifications for community updates | P1 |
| COMM-06 | Community search and category filters (Technical, Cultural, Sports, Social) | P1 |
| COMM-07 | Member count and active post metrics displayed on community cards | P2 |
| COMM-08 | Community creation request flow for new clubs | P2 |

**Supported Communities Include:**
- GDGC (Google Developer Groups on Campus)
- ACM Chapter
- Art Circle
- NSS (National Service Scheme)
- IEEE
- Robotics Club
- Entrepreneurship Cell (E-Cell)
- And 22+ more

---

### 4.4 Connect (Encrypted Messaging)

| ID | Requirement | Priority |
|---|---|---|
| MSG-01 | One-on-one private messaging between users | P0 |
| MSG-02 | Group chat creation and management | P0 |
| MSG-03 | End-to-end encryption for all messages | P0 |
| MSG-04 | Real-time message delivery via WebSocket/Supabase Realtime | P0 |
| MSG-05 | Message read receipts (single tick / double tick) | P1 |
| MSG-06 | Image and file sharing in chats | P1 |
| MSG-07 | Message search within a conversation | P2 |
| MSG-08 | Message reactions (emoji) | P2 |
| MSG-09 | Typing indicators | P2 |

---

### 4.5 XD (Exchange) Board — Anonymous Discussion

| ID | Requirement | Priority |
|---|---|---|
| XD-01 | Anonymous post creation (no username shown) | P0 |
| XD-02 | Posts support text, images, and polls | P0 |
| XD-03 | Topic categories (Tips, Rants, Ideas, Opportunities, Memes) | P1 |
| XD-04 | Voting/upvote system on posts | P1 |
| XD-05 | Comment threads on posts | P1 |
| XD-06 | Moderation system to flag/report harmful content | P1 |
| XD-07 | Anonymous identity persistence within same session (same "anon" persona) | P2 |

---

### 4.6 Campus Map (Interactive 3D)

| ID | Requirement | Priority |
|---|---|---|
| MAP-01 | Interactive campus map powered by TomTom Maps SDK | P0 |
| MAP-02 | Mark and label key locations: labs, classrooms, canteen, admin block, etc. | P0 |
| MAP-03 | Search for locations within campus | P1 |
| MAP-04 | Display event venues on the map | P1 |
| MAP-05 | Directions/navigation between two points on campus | P2 |
| MAP-06 | Real-time occupancy indicators (optional future feature) | P3 |

---

### 4.7 Academic Calendar

| ID | Requirement | Priority |
|---|---|---|
| CAL-01 | Display academic events: exams, holidays, submission deadlines | P0 |
| CAL-02 | Admin can add/edit/delete calendar events | P0 |
| CAL-03 | Students can add personal reminders | P1 |
| CAL-04 | Sync with Google Calendar | P1 |
| CAL-05 | Push/browser notifications for upcoming events | P2 |
| CAL-06 | Filter events by category (Academic, Events, Holidays) | P2 |

---

### 4.8 Student Profiles

| ID | Requirement | Priority |
|---|---|---|
| PROF-01 | Profile photo, name, year, branch, and bio | P0 |
| PROF-02 | Showcase achievements, certifications, and hackathon wins | P0 |
| PROF-03 | Skills and interests tags | P1 |
| PROF-04 | View other students' public profiles | P1 |
| PROF-05 | Community memberships visible on profile | P1 |
| PROF-06 | Links to GitHub, LinkedIn, portfolio | P2 |
| PROF-07 | Activity feed on profile (posts, comments) | P2 |

---

### 4.9 Search & Discovery

| ID | Requirement | Priority |
|---|---|---|
| SRCH-01 | Global search across users, communities, and posts | P0 |
| SRCH-02 | Search suggestions/autocomplete | P1 |
| SRCH-03 | Filter results by type (people, communities, posts) | P1 |

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Page load time < 2 seconds on 4G
- Feed render < 1 second after auth
- Real-time message latency < 300ms

### 5.2 Security
- Google OAuth only (no password-based auth)
- Row-level security (RLS) via Supabase policies
- Context menu disabled (anti-scraping)
- DevTools key combinations blocked (F12, Ctrl+Shift+I)
- User content selection disabled on non-input elements
- Input sanitization on all user-generated content

### 5.3 Scalability
- Support for 5,000+ concurrent students (PCCOE enrollment ~5,000+)
- Supabase free tier initially; upgrade path to Pro defined

### 5.4 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility

### 5.5 Availability
- 99.5% uptime target
- Graceful degradation if Supabase services are unavailable

---

## 6. Design Requirements

| Attribute | Specification |
|---|---|
| **Primary Font** | Urbanist (headings, 500/700 weight) |
| **Secondary Font** | Inter Tight (body, 400/500/600 weight) |
| **Theme** | Dark mode default with light mode toggle |
| **Color Palette** | Deep blues, electric purples, and warm accent colors |
| **Design Language** | Glassmorphism + micro-animations |
| **Responsive** | Mobile-first, fully responsive |

---

## 7. Out of Scope (v1.0)

- Native mobile apps (iOS/Android)
- Video calling / voice chat
- AI-powered feed recommendations
- Paid features or subscriptions
- Non-PCCOE user access

---

## 8. Success Metrics

| Metric | Target |
|---|---|
| Monthly Active Users | 60% of enrolled students |
| Daily Active Users | 20% of enrolled students |
| Community Subscriptions per User | ≥ 3 |
| Messages Sent Daily | 500+ |
| Feature Adoption (XD Board) | 30% of users post/vote monthly |

---

## 9. Stakeholders

| Role | Name |
|---|---|
| Creator / Lead Developer | PCCOE Student Team |
| Institution | PCCOE, Pune |
| End Users | PCCOE Students, Faculty, Alumni |
