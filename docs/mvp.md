# Falimy — MVP Project Plan

This app is called *falimy*

## Vision

A privacy-first family app where all data stays on a self-hosted backend. Families run their own PocketBase instance and connect the app to it. No third-party servers, no data harvesting — just a private family hub.

---

## Tech Stack

|Layer|Technology|Why|
|---|---|---|
|Mobile App|React Native (Expo)|Cross-platform, fast iteration|
|Local DB / Offline|WatermelonDB|Offline-first with built-in sync protocol|
|Backend|PocketBase (self-hosted)|Single binary, built-in auth, realtime, file storage|
|Push Notifications|ntfy.sh (self-hosted)|Open source pub/sub, no Firebase dependency, self-hostable alongside PocketBase|
|QR Code Generation|`react-native-qrcode-svg`|For generating invite QR codes in-app|
|QR Code Scanning|`expo-camera` or `expo-barcode-scanner`|For scanning invite QR codes|
|Maps|`react-native-maps`|For location sharing map view|
|Background Location|`expo-location`|Background location tracking with permissions|

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│          React Native App           │
│  ┌───────────┐  ┌────────────────┐  │
│  │    UI      │  │  WatermelonDB  │  │
│  │ (Screens)  │  │  (Local Store) │  │
│  └─────┬─────┘  └───────┬────────┘  │
│        │                │            │
│        │         ┌──────┴──────┐     │
│        │         │ Sync Engine │     │
│        │         └──────┬──────┘     │
└────────┼────────────────┼────────────┘
         │                │
         │    ┌───────────▼───────────┐
         │    │   PocketBase Server    │
         │    │  (Family Self-Hosted)  │
         │    │                        │
         │    │  • Auth & Users        │
         │    │  • Collections (DB)    │
         │    │  • Realtime SSE        │
         │    │  • File Storage        │
         │    └───────────┬───────────┘
         │                │
         │    ┌───────────▼───────────┐
         │    │   ntfy.sh Instance     │
         │    │  (Push Notifications)  │
         │    └───────────────────────┘
         │
```

### Offline-First Strategy

- **WatermelonDB** is the source of truth on the device. All reads and writes go through it.
- A **sync engine** reconciles local changes with PocketBase when connectivity is available.
- WatermelonDB has a built-in sync protocol (`synchronize()`) that expects a pull/push API. We need a **custom PocketBase sync endpoint** (or a translation layer in the app) that maps between WatermelonDB's sync format and PocketBase's REST/realtime API.
- **Conflict resolution**: Last-write-wins per record, using timestamps. For shopping list items, this is sufficient. More complex CRDT-based resolution can come later if needed.
- **Location data** is an exception — it's ephemeral and writes directly to PocketBase when online. Local caching of location is minimal (just last-known positions for offline map display).

---

## PocketBase Schema

### Collection: `users` (built-in, extended)

|Field|Type|Notes|
|---|---|---|
|`email`|email|Built-in auth field|
|`password`|password|Built-in auth field|
|`name`|text|Display name|
|`avatar`|file|Profile picture|
|`role`|select|`admin`, `member`, `child`|
|`family_id`|relation → families|Which family this user belongs to|
|`location_sharing_mode`|select|`off`, `always`, `timed`, `on_request`|
|`location_sharing_until`|datetime|Expiry for timed sharing|
|`last_lat`|number|Last known latitude|
|`last_lng`|number|Last known longitude|
|`last_location_at`|datetime|Timestamp of last location update|

### Collection: `families`

|Field|Type|Notes|
|---|---|---|
|`name`|text|Family name|
|`invite_code`|text|Random code for invites, regeneratable|
|`ntfy_topic_prefix`|text|Unique prefix for ntfy topics (e.g., `fam_a8x9k2`)|
|`created_by`|relation → users|The admin who created the family|

### Collection: `shopping_lists`

|Field|Type|Notes|
|---|---|---|
|`name`|text|e.g., "Costco", "Weekly Groceries"|
|`family_id`|relation → families||
|`assigned_to`|relation → users|Optional — who's doing this shop|
|`status`|select|`active`, `completed`, `archived`|
|`sort_order`|number|For ordering lists|
|`created_by`|relation → users||

### Collection: `shopping_items`

|Field|Type|Notes|
|---|---|---|
|`list_id`|relation → shopping_lists||
|`name`|text|Item name|
|`quantity`|text|e.g., "2", "1 lb", "a bunch" — text for flexibility|
|`note`|text|Optional notes|
|`checked`|boolean|Whether it's been picked up|
|`checked_by`|relation → users|Who checked it off|
|`sort_order`|number|For drag-to-reorder|
|`created_by`|relation → users||

### Collection: `location_history`

|Field|Type|Notes|
|---|---|---|
|`user_id`|relation → users||
|`lat`|number|Latitude|
|`lng`|number|Longitude|
|`accuracy`|number|Accuracy in meters|
|`battery_level`|number|Optional, useful context|
|`timestamp`|datetime|When this location was recorded|

### Collection: `geofences`

|Field|Type|Notes|
|---|---|---|
|`family_id`|relation → families||
|`name`|text|e.g., "School", "Home", "Grandma's"|
|`lat`|number|Center latitude|
|`lng`|number|Center longitude|
|`radius`|number|Radius in meters|
|`notify_user_id`|relation → users|Who gets notified|
|`watch_user_id`|relation → users|Whose location triggers the geofence|
|`trigger_on`|select|`enter`, `exit`, `both`|
|`enabled`|boolean||

---

## Feature Specs

### 1. Onboarding & Auth

#### Admin Flow (First-Time Setup)

1. Admin downloads app, taps "Create Family"
2. App prompts for PocketBase server URL (with helper text: "Enter the URL where you've set up your PocketBase server")
3. App validates the connection to PocketBase
4. Admin creates their account (name, email, password)
5. App creates the `family` record, sets the admin as `role: admin`
6. Admin lands on the home screen

#### Invite Flow (Adding Family Members)

1. Admin goes to Settings → Family → Invite Member
2. App generates a QR code containing a JSON payload:
    
    ```json
    {  "server": "https://family.example.com",  "invite": "a8x9k2m4",  "family_id": "abc123"}
    ```
    
3. Admin shows QR code to family member (in person) or shares it via screenshot
4. New member opens app, taps "Join Family", scans QR code
5. App auto-fills the server URL, validates the invite code
6. New member creates their account
7. Admin can optionally set the new member's role (`member` vs `child` — children may have restricted features)

#### Auth Details

- Use PocketBase's built-in auth system
- Store auth token securely on device (Expo SecureStore)
- Auto-refresh tokens on app launch
- Support logging out and switching families (future: multi-family support)

### 2. Shopping Lists

#### Screens

- **Lists Overview**: Shows all shopping lists for the family, with status indicators (active items count, assigned person)
- **List Detail**: Shows items in a list, with add/check/delete/reorder functionality
- **Add/Edit Item**: Inline or modal for item name, quantity, notes

#### Behavior

- Tapping an item toggles `checked` status and records `checked_by`
- Checked items sink to the bottom of the list (but remain visible, greyed out)
- Swipe to delete an item
- Long-press to drag and reorder
- Pull-to-refresh triggers sync (but sync also happens automatically)
- "Complete Shopping" button archives the list and unchecks all items (so it can be reused next week)
- Items persist offline and sync when connection is restored

#### Realtime

- PocketBase SSE (Server-Sent Events) subscription on the `shopping_items` collection
- When another family member adds/checks an item, it appears/updates in realtime
- If offline, changes queue locally and sync on reconnect

#### Notifications (via ntfy.sh)

- Notify assigned person when items are added to their list
- Optional: notify when a list is "completed"
- ntfy topic format: `{family_ntfy_prefix}/shopping/{list_id}`

### 3. Location Sharing

#### Screens

- **Map View**: Full-screen map showing family members who have sharing enabled. Each person shown with their avatar and name. Tap a person for details (last updated time, battery level).
- **Sharing Settings**: Per-user controls for location sharing mode (off / always / timed / on-request)
- **Geofences**: List of saved places with radius. Add/edit/delete geofences.
- **Request Location**: "Ping" a family member to request their current location (sends a notification, they can approve or ignore)

#### Behavior

- Location updates are sent to PocketBase at configurable intervals (e.g., every 5 minutes when sharing is on)
- Use `expo-location` background location task for always-on sharing
- Battery-conscious: reduce frequency when stationary, increase when moving
- `last_lat`, `last_lng`, `last_location_at` on the user record provide quick access to current positions without querying history
- `location_history` collection stores a trail for optional review (could be pruned after X days)

#### Privacy Controls

- **Sharing is opt-in** — off by default for all users
- Admin (parent) can see who has sharing on/off but cannot force it on (except potentially for `child` role — configurable)
- Timed sharing: user sets a duration, sharing auto-disables after expiry
- On-request: family member sends a ping, user gets a notification, can share current location once or ignore
- All location data stays on the family's PocketBase server

#### Geofences

- Defined by a center point + radius + which user to watch + who to notify
- Evaluated on the device of the watched user (not server-side) to reduce battery drain from constant server communication
- When a geofence triggers, the device sends a notification via ntfy.sh

---

## Project Structure

```
family-hub/
├── app/                          # Expo Router app directory
│   ├── (auth)/                   # Auth screens (login, join, create family)
│   │   ├── login.tsx
│   │   ├── create-family.tsx
│   │   ├── join-family.tsx
│   │   └── scan-qr.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── shopping/
│   │   │   ├── index.tsx         # Lists overview
│   │   │   └── [listId].tsx      # List detail
│   │   ├── location/
│   │   │   ├── index.tsx         # Map view
│   │   │   └── geofences.tsx     # Manage geofences
│   │   └── settings/
│   │       ├── index.tsx         # Settings home
│   │       ├── family.tsx        # Family management & invites
│   │       ├── location.tsx      # Location sharing preferences
│   │       └── account.tsx       # Account settings
│   └── _layout.tsx               # Root layout
├── src/
│   ├── db/                       # WatermelonDB setup
│   │   ├── schema.ts             # Database schema
│   │   ├── models/               # WatermelonDB models
│   │   │   ├── ShoppingList.ts
│   │   │   ├── ShoppingItem.ts
│   │   │   ├── Family.ts
│   │   │   └── index.ts
│   │   ├── sync.ts               # Sync engine (WatermelonDB ↔ PocketBase)
│   │   └── index.ts              # Database initialization
│   ├── api/                      # PocketBase client
│   │   ├── client.ts             # PocketBase SDK initialization
│   │   ├── auth.ts               # Auth helpers
│   │   ├── shopping.ts           # Shopping list API calls
│   │   ├── location.ts           # Location API calls
│   │   └── notifications.ts      # ntfy.sh integration
│   ├── hooks/                    # Custom React hooks
│   │   ├── useSync.ts            # Sync management
│   │   ├── useShoppingList.ts    # Shopping list data & operations
│   │   ├── useLocation.ts        # Location tracking & sharing
│   │   ├── useGeofence.ts        # Geofence monitoring
│   │   ├── useAuth.ts            # Auth state
│   │   └── useFamily.ts          # Family data
│   ├── components/               # Shared UI components
│   │   ├── QRCodeGenerator.tsx
│   │   ├── QRCodeScanner.tsx
│   │   ├── FamilyMemberAvatar.tsx
│   │   ├── ShoppingItemRow.tsx
│   │   ├── MapMarker.tsx
│   │   └── ... 
│   ├── services/                 # Background services
│   │   ├── locationTask.ts       # Background location tracking
│   │   ├── geofenceTask.ts       # Geofence monitoring
│   │   └── syncTask.ts           # Background sync
│   ├── utils/                    # Helpers
│   │   ├── invite.ts             # Invite code generation/validation
│   │   ├── permissions.ts        # Permission request helpers
│   │   └── config.ts             # App configuration
│   └── contexts/                 # React contexts
│       ├── AuthContext.tsx
│       ├── DatabaseContext.tsx
│       └── FamilyContext.tsx
├── server/                       # PocketBase configuration & docs
│   ├── README.md                 # Self-hosting guide
│   ├── pb_migrations/            # PocketBase migration files for schema setup
│   │   └── 001_initial_schema.js
│   ├── pb_hooks/                 # PocketBase server-side hooks (optional)
│   │   └── sync.pb.js            # Custom sync endpoint for WatermelonDB
│   └── docker-compose.yml        # Docker setup for PocketBase + ntfy.sh
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
└── README.md
```

---

## Implementation Phases

### Phase 1: Foundation & Shopping Lists (Weeks 1–3)

**Week 1: Project Setup & Auth**

- Initialize Expo project with TypeScript
- Set up WatermelonDB with schema and models
- Initialize PocketBase client with dynamic URL configuration
- Build auth screens: server URL input, login, create account
- Implement secure token storage with Expo SecureStore
- Create AuthContext for app-wide auth state

**Week 2: Family & Invites**

- Build "Create Family" flow
- Implement QR code generation with invite payload
- Build QR scanner screen for joining
- Invite code validation against PocketBase
- Family management screen (view members, regenerate invite code)
- Role assignment (admin/member/child)

**Week 3: Shopping Lists**

- Build shopping list CRUD (create, rename, archive, delete lists)
- Build shopping item CRUD (add, check, delete, reorder items)
- Implement WatermelonDB ↔ PocketBase sync engine
- Set up PocketBase realtime subscriptions for live updates
- Offline functionality: full CRUD works without connectivity
- Sync on reconnect with conflict resolution

### Phase 2: Location Sharing (Weeks 4–5)

**Week 4: Basic Location**

- Location permissions flow (request, explain, handle denial gracefully)
- Background location tracking with `expo-location`
- Location update posting to PocketBase
- Map view with family member markers
- Sharing mode toggle (off/always/timed)
- Last-known location display for quick loading

**Week 5: Advanced Location**

- Timed sharing with auto-expiry
- On-request "ping" flow (request → notification → respond)
- Geofence CRUD (create saved places with radius)
- Geofence monitoring and trigger logic
- Battery optimization (adaptive update frequency)

### Phase 3: Notifications & Polish (Week 6)

- ntfy.sh integration for push notifications
- Notification triggers: new shopping items, geofence alerts, location requests
- App polish: loading states, error handling, empty states
- Pull-to-refresh, optimistic UI updates
- Settings screens for notification preferences
- Basic theming and consistent UI

### Phase 4: Hardening & Documentation (Week 7)

- Self-hosting documentation (plain PocketBase, Docker, Raspberry Pi)
- Docker Compose file for PocketBase + ntfy.sh
- PocketBase migration files for automated schema setup
- Error recovery: handle server unreachable, expired tokens, sync failures
- Data pruning: auto-delete old location history
- Testing on both iOS and Android

---

## Key Technical Decisions

### WatermelonDB Sync with PocketBase

WatermelonDB's `synchronize()` function expects an API that returns:

- **Pull**: `{ changes: { [table]: { created: [], updated: [], deleted: [] } }, timestamp }`
- **Push**: Accepts `{ changes: { [table]: { created: [], updated: [], deleted: [] } } }`

PocketBase doesn't natively speak this format, so we need one of:

1. **Custom PocketBase hook** (`pb_hooks/sync.pb.js`): A server-side JS hook that translates between WatermelonDB sync format and PocketBase collections. This is the cleanest approach.
2. **Client-side adapter**: The app translates between WatermelonDB's sync calls and individual PocketBase REST API calls. Simpler to start but more network requests.

**Recommendation**: Start with option 2 (client-side adapter) for speed, migrate to option 1 when performance matters.

### ntfy.sh Integration

ntfy.sh works via simple HTTP:

```bash
# Publish (from PocketBase hook or app)
curl -d "Mom added Milk to the grocery list" https://ntfy.family.example.com/fam_a8x9k2/shopping

# Subscribe (in React Native)
const eventSource = new EventSource('https://ntfy.family.example.com/fam_a8x9k2/shopping/sse');
eventSource.onmessage = (event) => {
  // Show local notification
};
```

For background notifications on iOS, ntfy.sh can bridge to APNs. On Android, ntfy.sh uses its own persistent connection (UnifiedPush).

### Security Considerations

- PocketBase API rules should restrict all collections to authenticated users within the same family
- Invite codes should be single-use or time-limited
- Location data is sensitive — enforce strict collection rules (only family members can read, only the user themselves can write their own location)
- HTTPS is mandatory for the PocketBase instance (Let's Encrypt via reverse proxy)
- Consider adding an optional PIN/biometric lock on the app for extra privacy

---

## Docker Compose for Self-Hosting

```yaml
version: '3.8'
services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    ports:
      - "8090:8090"
    volumes:
      - pb_data:/pb/pb_data
      - ./pb_migrations:/pb/pb_migrations
      - ./pb_hooks:/pb/pb_hooks
    restart: unless-stopped

  ntfy:
    image: binwiederhier/ntfy
    command: serve
    ports:
      - "8080:80"
    volumes:
      - ntfy_cache:/var/cache/ntfy
    environment:
      - NTFY_BASE_URL=https://ntfy.family.example.com
    restart: unless-stopped

volumes:
  pb_data:
  ntfy_cache:
```

---

## Future Features (Post-MVP)

- **Photo/video sharing** — private family feed with PocketBase file storage (S3-compatible for scaling)
- **Family calendar** — shared events, birthdays, school schedules
- **Family chat/messaging** — simple realtime messaging via PocketBase SSE
- **Chore/task board** — assign tasks, track completion, optional reward points for kids
- **Shared notes** — recipes, medical info, school documents
- **Budget tracking** — shared expenses, allowances
- **Managed hosting option** — for non-tech-savvy families who want privacy without self-hosting
- **Multi-family support** — one app instance connected to multiple family servers
- **End-to-end encryption** — encrypt data client-side before it hits PocketBase for maximum privacy
