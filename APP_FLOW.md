# Application Flow Document
## Cohort PCCOE — User Journeys & Navigation Architecture

**Version:** 1.0  
**Date:** 2026-08-17  

---

## 1. Top-Level Navigation Architecture

```mermaid
graph TB
    Landing["🏠 Landing Page\n(Public)"] --> Login["🔐 Login\n/login"]
    Login --> OAuth["Google OAuth 2.0"]
    OAuth --> Check{"Account\nStatus?"}
    Check -- "New User" --> Onboarding["📝 Onboarding Wizard\n/onboarding"]
    Check -- "Existing User" --> Dashboard
    Check -- "Rejected/Pending" --> Pending["⏳ Pending Approval\nScreen"]
    Onboarding --> Dashboard["📊 Dashboard / Feed\n/dashboard"]
    
    Dashboard --> Communities["👥 Communities\n/communities"]
    Dashboard --> Connect["💬 Connect\n/connect"]
    Dashboard --> XD["🎭 XD Board\n/xd"]
    Dashboard --> Map["🗺️ Campus Map\n/map"]
    Dashboard --> Calendar["📅 Calendar\n/calendar"]
    Dashboard --> Profile["👤 Profile\n/profile"]
    Dashboard --> Settings["⚙️ Settings\n/settings"]
    
    Communities --> CommunityDetail["📌 Community Detail\n/communities/:id"]
    Connect --> Chat["💭 Chat Window\n/connect/:chatId"]
    XD --> XDDetail["📋 XD Post Detail\n/xd/:postId"]
    Profile --> OtherProfile["👁️ Other Profile\n/profile/:userId"]
```

---

## 2. Authentication Flow

```mermaid
flowchart TD
    A([User visits site]) --> B{Session cookie\nvalid?}
    B -- Yes --> C{Profile\ncomplete?}
    C -- Yes --> DASH[/dashboard]
    C -- No --> ONB[/onboarding]
    B -- No --> LAND[Landing Page]
    LAND --> BTN["Click 'Sign in with Google'"]
    BTN --> GAUTH[Google OAuth Popup]
    GAUTH --> GDONE{Auth\nsuccessful?}
    GDONE -- No --> ERR["❌ Show error toast\n'Authentication failed'"]
    ERR --> LAND
    GDONE -- Yes --> DOMAIN{Email domain\n= pccoe.org?}
    DOMAIN -- No --> DENY["❌ Access Denied\n'Platform is for PCCOE only'"]
    DOMAIN -- Yes --> NEWUSER{First\ntime?}
    NEWUSER -- Yes --> CREATEPROFILE["Create user record\nin Supabase"]
    CREATEPROFILE --> ONB[/onboarding]
    NEWUSER -- No --> C
    ONB --> STEP1["Step 1: Basic Info\n(Name, Year, Branch, Division)"]
    STEP1 --> STEP2["Step 2: Profile Picture\n(Upload or use Google photo)"]
    STEP2 --> STEP3["Step 3: Interests & Skills"]
    STEP3 --> STEP4["Step 4: Subscribe to Communities\n(Pick ≥1)"]
    STEP4 --> DONE["✅ Profile Complete\nMark is_onboarded = true"]
    DONE --> DASH
```

---

## 3. Home Feed Flow

```mermaid
flowchart TD
    A([User opens /dashboard]) --> B["Show skeleton loading\nstate"]
    B --> C["Fetch paginated feed posts\nfrom subscribed communities\n+ connections"]
    C --> D{Posts\nloaded?}
    D -- Yes --> E["Render post cards\nin chronological order"]
    D -- No --> F["Show empty state\n'Subscribe to communities'"]
    E --> G["User scrolls to bottom\n(Intersection Observer)"]
    G --> H["Fetch next page\n(cursor-based pagination)"]
    H --> E
    
    E --> REACT["User clicks ❤️ Like"]
    REACT --> OPT["Optimistic UI update\n(instant visual feedback)"]
    OPT --> DB["UPSERT post_reactions\nto Supabase"]
    DB -- Error --> REVERT["Revert optimistic update\n+ toast error"]
    
    E --> COMMENT["User clicks 💬 Comment"]
    COMMENT --> CBOX["Open comment input\nbelow post"]
    CBOX --> SUBMIT["Submit comment"]
    SUBMIT --> INSERT["INSERT comment\nto Supabase"]
    INSERT --> NOTIF["Trigger notification\nfor post author"]
    
    RT["🔄 Supabase Realtime\nnew post broadcast"] --> BANNER["Show 'X new posts'\nbanner at top"]
    BANNER --> REFRESH["User taps banner\n→ scroll to top + refresh"]
```

---

## 4. Communities Flow

```mermaid
flowchart TD
    A([User opens /communities]) --> B["Fetch all active communities\nwith member_count"]
    B --> C["Display community grid\n(logo, name, member count,\ndescription preview)"]
    C --> FILTER["User applies filter\n(category / search)"]
    FILTER --> C
    
    C --> CLICK["User clicks community card"]
    CLICK --> D["/communities/:communityId"]
    D --> E["Fetch community details +\nrecent posts + member count"]
    E --> F["Show community page:\n• Header (logo, name, about)\n• Subscribe button\n• Posts feed\n• Members tab\n• Events tab"]
    
    F --> SUB{Already\nsubscribed?}
    SUB -- No --> SUBCLICK["Click 'Subscribe'"]
    SUBCLICK --> INSERT["INSERT community_members"]
    INSERT --> TOAST["✅ 'Subscribed to [Community]'"]
    TOAST --> UPDATECOUNT["member_count++"]
    
    SUB -- Yes --> UNSUB["Click 'Unsubscribe'"]
    UNSUB --> DELETE["DELETE community_members"]
    
    F --> POST["User creates post in community"]
    POST --> EDITOR["Rich text post editor\n(text + image upload)"]
    EDITOR --> SUBMIT["Submit post"]
    SUBMIT --> INSERT2["INSERT to posts\n(community_id set)"]
    INSERT2 --> BROADCAST["Supabase Realtime\nbroadcasts to subscribers"]
```

---

## 5. Connect (Messaging) Flow

```mermaid
flowchart TD
    A([User opens /connect]) --> B["Fetch user's conversations\nordered by last_message_at"]
    B --> C["Display conversation list\n(avatar, name, last message,\nunread badge)"]
    
    C --> NEW["User starts new chat"]
    NEW --> SEARCH["Search users by name\nor @username"]
    SEARCH --> SELECT["Select user to message"]
    SELECT --> CHECK{DM conversation\nalready exists?}
    CHECK -- Yes --> OPEN_EXISTING["Open existing conversation"]
    CHECK -- No --> CREATE["CREATE conversation\n(type: 'direct')\n+ INSERT both users\ninto conversation_members"]
    CREATE --> OPEN_EXISTING
    
    C --> CLICK["User clicks conversation"]
    CLICK --> CHAT["/connect/:chatId"]
    CHAT --> LOAD["Load last 50 messages\n(paginated, reverse chron)"]
    LOAD --> DECRYPT["Client-side decrypt\nusing private key + NaCl"]
    DECRYPT --> RENDER["Render chat bubbles\n(own = right, theirs = left)"]
    
    RENDER --> TYPE["User types message"]
    TYPE --> ENCRYPT["Encrypt with recipient's\npublic key (NaCl box)"]
    ENCRYPT --> INSERT_MSG["INSERT encrypted message\nto Supabase"]
    INSERT_MSG --> RT["Supabase Realtime\nbroadcasts INSERT event"]
    RT --> RECIPIENT["Recipient's client\nreceives event"]
    RECIPIENT --> DECRYPT2["Decrypt with own\nprivate key"]
    DECRYPT2 --> APPEND["Append to chat thread"]
    
    RENDER --> SCROLL["Auto-scroll to bottom\non new messages"]
    
    TYPE2["Recipient typing"] --> PRESENCE["Supabase Presence\n'is_typing' broadcast"]
    PRESENCE --> INDICATOR["Show 'typing...' indicator"]
```

---

## 6. XD (Exchange) Board Flow

```mermaid
flowchart TD
    A([User opens /xd]) --> B["Fetch XD posts\nordered by vote_count DESC\nor created_at DESC"]
    B --> C["Display anonymous post feed\n(no author name shown)"]
    
    C --> CREATE["Click 'Post Anonymously'"]
    CREATE --> EDITOR["Compose post\n(text + optional media)"]
    EDITOR --> CAT["Select category\n(Tips / Ideas / Rants /\nOpportunities / Memes)"]
    CAT --> SUBMIT["Submit post"]
    SUBMIT --> INSERT["INSERT to xd_posts\nauthor_id stored (hidden)\nbut not exposed in UI"]
    INSERT --> TOAST["✅ 'Posted anonymously'"]
    
    C --> VOTE["User clicks ▲ Upvote"]
    VOTE --> CHECK{Already\nvoted?}
    CHECK -- No --> INSERT_VOTE["INSERT xd_votes\n+ vote_count++"]
    CHECK -- Yes --> DELETE_VOTE["DELETE xd_vote\n(toggle off)\n+ vote_count--"]
    
    C --> DETAIL["Click post card"]
    DETAIL --> D["/xd/:postId"]
    D --> COMMENTS["Show comments thread\n(also anonymous)"]
    COMMENTS --> REPLY["User types reply"]
    REPLY --> SUBMIT2["INSERT xd_comment\nauthor hidden"]
    
    C --> FLAG["User reports post"]
    FLAG --> REASON["Select report reason"]
    REASON --> SUBMIT3["Mark xd_posts.is_flagged = true\nTrigger admin notification"]
```

---

## 7. Campus Map Flow

```mermaid
flowchart TD
    A([User opens /map]) --> B["Lazy-load TomTom SDK\n(dynamic import)"]
    B --> C["Initialize TomTom map\ncentered on PCCOE\ncoordinates"]
    C --> D["Fetch campus_locations\nfrom Supabase"]
    D --> E["Render custom markers\nfor each location\n(color-coded by category)"]
    
    E --> CLICK["User clicks marker"]
    CLICK --> POPUP["Show location popup:\n• Name\n• Category (Lab/Classroom)\n• Building & Floor\n• Brief description"]
    
    E --> SEARCH["User types in search bar"]
    SEARCH --> FILTER["Filter campus_locations\nby name"]
    FILTER --> HIGHLIGHT["Highlight matching marker\nPan map to location"]
    
    E --> EVENT["Community event\nhas location set"]
    EVENT --> PIN["Show event pin on map\nwith event name + date"]
    
    E --> ZOOM["User zooms/pans map\n(TomTom native controls)"]
```

---

## 8. Academic Calendar Flow

```mermaid
flowchart TD
    A([User opens /calendar]) --> B["Fetch calendar_events\nfor current month"]
    B --> C["Render monthly calendar view\nwith event dots"]
    
    C --> SWITCH["Toggle view:\nMonth / Week / List"]
    
    C --> CLICK_DATE["User clicks a date"]
    CLICK_DATE --> EVENTS["Show events for that day\nin side panel"]
    
    C --> CLICK_EVENT["User clicks an event"]
    CLICK_EVENT --> DETAIL["Show event modal:\n• Title & description\n• Date/time\n• Location (with Map link)\n• Category badge\n• Community tag (if any)"]
    
    DETAIL --> MAP_LINK["Click 'View on Map'\n→ Navigate to /map\nwith location highlighted"]
    
    DETAIL --> ADDCAL["Click 'Add to Google Calendar'\n→ Opens Google Calendar\nwith pre-filled event"]
    
    ADMIN["Admin user"] --> CREATE["Click '+' Add Event"]
    CREATE --> FORM["Event form:\n• Title, description\n• Date/time picker\n• Type selector\n• Location picker (TomTom)\n• Community selector"]
    FORM --> SUBMIT["INSERT calendar_events"]
    SUBMIT --> NOTIF["Push notifications to\nall subscribers"]
```

---

## 9. Profile Flow

```mermaid
flowchart TD
    A([User opens /profile]) --> B["Fetch own user data\nfrom Supabase"]
    B --> C["Render profile page:\n• Avatar + Name + Year/Branch\n• Bio\n• Skills tags\n• Communities list\n• Achievements section\n• Social links"]
    
    C --> EDIT["Click 'Edit Profile'"]
    EDIT --> FORM["Editable form:\n• Bio, skills, interests\n• Social links\n• Avatar upload"]
    FORM --> SAVE["PATCH users table"]
    SAVE --> TOAST["✅ 'Profile updated'"]
    
    C --> ADD_ACH["Click 'Add Achievement'"]
    ADD_ACH --> ACH_FORM["Achievement form:\n• Type (cert/hackathon/award)\n• Title, description\n• Date, URL"]
    ACH_FORM --> SAVE2["UPDATE users.achievements\n(JSONB append)"]
    
    OTHER["User visits /profile/:userId"] --> FETCH["Fetch public profile data"]
    FETCH --> VIEW["View-only profile\n(edit buttons hidden)"]
    VIEW --> MSG["Click 'Message'\n→ Navigate to /connect\nwith DM to this user"]
    VIEW --> FOLLOW["Click 'Follow'\n→ INSERT user_follows"]
```

---

## 10. Notification Flow

```mermaid
flowchart TD
    TRIGGER["Event occurs:\n• Post liked\n• Comment received\n• New community post\n• New message\n• Calendar reminder"] 
    --> DB_TRIGGER["PostgreSQL trigger\nfires on relevant table"]
    DB_TRIGGER --> INSERT_NOTIF["INSERT into notifications\nfor recipient_id"]
    INSERT_NOTIF --> RT["Supabase Realtime\nbroadcasts on\npublic:notifications:{userId}"]
    RT --> CLIENT["Client receives\nWebSocket event"]
    CLIENT --> BADGE["Increment notification\nbadge count on bell icon"]
    CLIENT --> TOAST_NOTIF["Show toast notification\n(3s auto-dismiss)"]
    
    BELL["User clicks 🔔 bell"] --> PANEL["Notification panel slides in\nshowing unread items"]
    PANEL --> READ["Mark notifications as read\nUPDATE notifications SET is_read=true"]
    PANEL --> CLICK_NOTIF["Click notification"]
    CLICK_NOTIF --> NAV["Navigate to relevant content\n(post, message, profile)"]
```

---

## 11. Search Flow

```mermaid
flowchart TD
    A["User clicks Search / presses Ctrl+K"] --> B["Open search modal overlay"]
    B --> C["User types query"]
    C --> DEBOUNCE["Debounce 300ms"]
    DEBOUNCE --> PARALLEL["Run parallel queries:"]
    PARALLEL --> U["Search users\n(FTS on full_name, username)"]
    PARALLEL --> CM["Search communities\n(FTS on name, description)"]
    PARALLEL --> P["Search posts\n(FTS on content)"]
    U & CM & P --> RESULTS["Display grouped results:\n👤 People\n👥 Communities\n📝 Posts"]
    RESULTS --> SELECT["User selects result"]
    SELECT --> NAV["Navigate to:\n/profile/:id\n/communities/:id\nor /dashboard with post highlighted"]
```

---

## 12. Error States & Fallbacks

| Scenario | Handling |
|---|---|
| Network offline | Show offline banner, queue actions locally |
| Supabase unreachable | Show service unavailable screen, retry button |
| Unauthorized access (RLS violation) | Redirect to /login |
| 404 route | Show friendly 404 page with home link |
| OAuth failure | Toast error + stay on login page |
| Message send failure | Show retry button on failed message bubble |
| Image upload failure | Show error, keep draft content intact |

---

## 13. Session & Auth State Machine

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> Authenticating : Click Google Sign In
    Authenticating --> Authenticated : OAuth Success
    Authenticating --> Unauthenticated : OAuth Failure / Cancel
    Authenticated --> Onboarding : First login (new user)
    Authenticated --> Active : Returning user
    Onboarding --> Active : Complete wizard
    Active --> Unauthenticated : Sign Out
    Active --> Unauthenticated : Session expired (JWT)
    Active --> Active : Token refresh (auto)
```
