# Falimy Web Application -- Implementation Plan

## Overview

Build the web app in the existing `web/` directory (TanStack Start + Tailwind v4 + shadcn/ui) as a dual-purpose site:

1. **Public section** -- Clean, minimal landing page + feature showcase + full documentation site
2. **Authenticated section** -- Full feature parity with the mobile app (family management, lists, location map, geofences, settings) using client-side PocketBase SDK with SSE realtime

---

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | TanStack Start (already scaffolded) | SSR for public pages, client-side for app |
| Styling | Tailwind v4 + shadcn/ui | Already configured, matches modern web standards |
| Design | Mobile palette (pastels) + Montserrat font | Exact visual match with mobile app |
| PocketBase | Client-side SDK in browser | Aligns with self-hosting -- no proxy server needed |
| Maps | Leaflet + OpenStreetMap (react-leaflet) | Free, open-source, no API key, privacy-first |
| Realtime | PocketBase SSE (native EventSource) | Full live updates like mobile, no WatermelonDB needed on web |
| State management | TanStack Query + React Context | Cache PB responses, manage auth state |
| Docs | Markdown-based pages within the app | Self-hosting guide, feature walkthroughs, FAQ, troubleshooting |

---

## Phase 1: Foundation & Design System

**Goal**: Set up the project infrastructure, design tokens, shared components, and routing structure.

### 1.1 Project Setup
- Add dependencies: `pocketbase`, `react-leaflet`, `leaflet`, `@tanstack/react-query`, `zod`, `react-hook-form`, `@hookform/resolvers`, Montserrat font (Google Fonts)
- Configure Tailwind CSS custom theme to match the mobile palette:
  - `primary: #b4dbfa`, `purple: #dad4fc`, `orange: #fadeaf`, `pink: #f8d5f4`, `green: #b2ecca`
  - `black: #2C2C2C`, greys, error/success/warning colors
  - Montserrat font family (400, 500, 600, 700 weights)
  - Border radii, spacing scale matching mobile
- Set up path aliases (`@/` already configured)

### 1.2 Route Structure
```
src/routes/
  __root.tsx              # Root layout (meta, fonts, global providers)
  index.tsx               # Landing/home page
  features.tsx            # Feature showcase page
  docs/
    index.tsx             # Docs landing
    getting-started.tsx   # Quick start guide
    self-hosting.tsx      # Docker, PocketBase setup
    reverse-proxy.tsx     # Nginx/Caddy HTTPS setup
    features/
      lists.tsx           # Lists feature guide
      location.tsx        # Location sharing guide
      geofences.tsx       # Geofences guide
    faq.tsx               # FAQ
    troubleshooting.tsx   # Common issues
  auth/
    login.tsx             # Login (server URL + credentials)
    server-url.tsx        # Set PocketBase server URL
    create-family.tsx     # Create family + admin account
    join-family.tsx       # Join family (invite code flow)
  app/
    route.tsx             # App layout (sidebar/nav, auth guard)
    index.tsx             # Dashboard/home
    lists/
      index.tsx           # All lists
      $listId.tsx         # List detail
    location/
      index.tsx           # Map view
      settings.tsx        # Location sharing settings
      geofences.tsx       # Geofence list
      create-geofence.tsx # Create geofence form
    settings/
      index.tsx           # Settings home
      family.tsx          # Family management, invites, QR code
```

### 1.3 Shared UI Components (via shadcn/ui)
Generate shadcn components: Button, Card, Input, Label, Select, Switch, Dialog, Sheet, Dropdown Menu, Avatar, Badge, Separator, Tabs, Toast/Sonner, Skeleton, Sidebar

---

## Phase 2: Public Pages

**Goal**: Build the landing page, features page, and documentation site.

### 2.1 Landing Page (`/`)
- Hero section: App name "falimy", tagline about privacy-first family hub
- Brief feature highlights (3-4 cards: Lists, Location, Self-hosted, Privacy)
- "Get the App" + "Self-Host" call-to-action buttons
- "Admin Login" button in the header/nav

### 2.2 Features Page (`/features`)
- Detailed feature sections with descriptions
- Shopping/todo lists, location sharing, geofences, family management
- Emphasis on privacy and self-hosting

### 2.3 Documentation Site (`/docs/*`)
- Sidebar navigation for docs sections
- **Getting Started**: Overview, what you need, quick start
- **Self-Hosting Guide**: Docker Compose setup, PocketBase configuration, initial admin setup, running migrations
- **Reverse Proxy / HTTPS**: Nginx and Caddy examples for SSL termination
- **Feature Guides**: How to use lists, location sharing, geofences
- **FAQ**: Common questions
- **Troubleshooting**: Connection issues, sync problems, etc.

### 2.4 Site Navigation
- Top navbar: Logo, Features, Docs, Admin Login
- Mobile-responsive hamburger menu
- Footer with links

---

## Phase 3: Auth & PocketBase Integration

**Goal**: Build the authentication flow and PocketBase client infrastructure.

### 3.1 PocketBase Client
- Create `src/lib/pocketbase.ts` -- singleton PocketBase client
- Server URL stored in `localStorage`
- Auth token persistence via PocketBase's built-in `LocalAuthStore`
- Health check endpoint validation (`/api/health`)
- Auto-cancellation disabled (same as mobile)

### 3.2 Auth Context
- `src/contexts/AuthContext.tsx` -- React context providing:
  - Current user, auth state (loading/authenticated/unauthenticated)
  - Login, logout, refresh functions
  - Server URL management (set, validate, clear)
- Auth guard component for `/app/*` routes (redirect to login if unauthenticated)

### 3.3 Auth Screens
- **Server URL** (`/auth/server-url`): Input field, validate against PB health endpoint, store in localStorage
- **Login** (`/auth/login`): Email + password, Zod validation (matching mobile schemas)
- **Create Family** (`/auth/create-family`): Family name + admin account creation (name, email, password)
- **Join Family** (`/auth/join-family`): Server URL, invite code, family ID, user details -- calls `/api/falimy/join`

### 3.4 TanStack Query Setup
- `src/lib/queryClient.ts` -- configure React Query with sensible defaults
- Query key factories for each collection
- Mutation helpers that invalidate relevant queries on success

---

## Phase 4: App Shell & Family Management

**Goal**: Build the authenticated app layout and family/settings features.

### 4.1 App Layout (`/app/route.tsx`)
- Responsive sidebar (collapsible on mobile) or top nav with:
  - Home, Lists, Location, Settings sections
  - User avatar/name, logout
- Auth guard: redirect to `/auth/login` if not authenticated
- Initialize realtime subscriptions here

### 4.2 Dashboard (`/app/`)
- Welcome message with user name (matching mobile home tab)
- Quick access cards to lists, location, settings
- Family member summary

### 4.3 Settings (`/app/settings/*`)
- **Settings Home**: Links to Family settings, Change Server URL, account management
- **Family Management**: Family name, ID, invite code display, QR code generation (using `qrcode.react`), regenerate invite button, member list with role management (admin can change roles)
- **Account**: Delete account modal (matching mobile)

---

## Phase 5: Lists Feature

**Goal**: Full lists CRUD with realtime sync.

### 5.1 Lists Overview (`/app/lists/`)
- Display all lists for the family (fetched from PocketBase `lists` collection)
- Color-coded cards by type (shopping=blue, todo=purple, packing=orange, custom=pink)
- Live item counts (total items, checked items)
- Create new list dialog: name + type selector
- Filter by status (active/completed/archived)

### 5.2 List Detail (`/app/lists/$listId`)
- Add items: name + quantity input
- Toggle checked state (click/checkbox)
- Delete items (button or swipe gesture if feasible)
- Rename list inline
- Archive/delete list actions
- Checked items sink to bottom (greyed out)
- Realtime updates via SSE -- items added/checked by other family members appear live

### 5.3 Data Layer
- Custom hooks mirroring mobile: `useLists()`, `useListItems(listId)`
- PocketBase SDK calls for CRUD (create, update, delete lists and items)
- TanStack Query for caching and cache invalidation
- SSE subscriptions for `lists` and `list_items` collections that update the query cache

---

## Phase 6: Location Features

**Goal**: Location map, sharing settings, and geofences.

### 6.1 Map View (`/app/location/`)
- Full-page Leaflet map with OpenStreetMap tiles
- Family member markers with:
  - Color coding by recency (teal=recent, amber=stale, grey=old) -- matching mobile
  - Name labels
  - Click for detail popup (last updated, battery level)
- Geofence circles rendered on map
- Controls: center on user, zoom, toggle layers
- Note: Browser geolocation API for the current user's position (no background tracking -- web limitation)

### 6.2 Location Settings (`/app/location/settings`)
- Sharing mode selector (off/always/timed/on_request)
- Timed duration picker (15min to 8hrs)
- Current status indicator
- Privacy notice
- Note: "Always" mode on web will only work while the tab is open (no background tracking). This limitation is clearly communicated in the UI.

### 6.3 Geofences (`/app/location/geofences`)
- List of geofences with toggle switches, details, delete buttons
- Create geofence page: interactive Leaflet map for point selection, name, radius, trigger type, watch member picker

### 6.4 Location Data Layer
- Hooks: `useFamilyLocations()`, `useGeofences()`
- Browser Geolocation API for sharing current position
- SSE subscriptions on `users` (for location updates) and `geofences` collections
- Periodic position posting to PocketBase when sharing is enabled (via `setInterval`, only while tab is active)

---

## Phase 7: Realtime Infrastructure

**Goal**: Live updates across all features via PocketBase SSE.

### 7.1 Realtime Manager
- `src/lib/realtime.ts` -- manages SSE subscriptions to all relevant collections:
  - `lists`, `list_items`, `users`, `location_history`, `geofences`, `families`
- On create/update events: update TanStack Query cache directly
- On delete events: remove from cache
- Auto-reconnect on disconnect
- Subscribe/unsubscribe lifecycle tied to auth state

### 7.2 Integration
- Initialize in the app layout (when authenticated)
- Tear down on logout
- Handle page visibility API (pause/resume when tab is hidden/shown)

---

## Phase 8: Polish & Testing

### 8.1 Responsive Design
- All pages work on desktop, tablet, and mobile browser
- Sidebar collapses to hamburger on small screens
- Map is full-width on mobile

### 8.2 Dark Mode
- Support dark mode using the existing dark theme colors from mobile
- Toggle in settings or respect system preference

### 8.3 Error Handling
- Connection lost indicators
- Server unreachable states
- Token expiry handling (redirect to login)
- Form validation errors (Zod, matching mobile schemas)

### 8.4 Testing
- Vitest + Testing Library (already configured)
- Unit tests for hooks, utilities, PocketBase client
- Component tests for key UI components
- Integration tests for auth flow

---

## Dependencies to Add

| Package | Purpose |
|---|---|
| `pocketbase` | PocketBase JS SDK (same as mobile) |
| `@tanstack/react-query` | Data fetching & caching |
| `react-leaflet` + `leaflet` | Map component for location features |
| `@types/leaflet` | TypeScript types for Leaflet |
| `zod` | Form validation (matching mobile schemas) |
| `react-hook-form` + `@hookform/resolvers` | Form management |
| `qrcode.react` | QR code generation for invites |
| `sonner` | Toast notifications (web equivalent of sonner-native) |

---

## Implementation Order Summary

| Phase | Focus | Estimated Effort |
|---|---|---|
| 1 | Foundation, design system, routing | Medium |
| 2 | Public pages (landing, features, docs) | Medium |
| 3 | Auth & PocketBase integration | Medium |
| 4 | App shell & family management | Medium |
| 5 | Lists feature with realtime | Medium-High |
| 6 | Location features (map, geofences) | High |
| 7 | Realtime infrastructure | Medium |
| 8 | Polish, responsive, dark mode, testing | Medium |

---

## Key Differences from Mobile

| Concern | Mobile | Web |
|---|---|---|
| Local DB | WatermelonDB (offline cache) | No local DB -- TanStack Query cache only |
| Auth storage | Expo SecureStore | localStorage (PB's LocalAuthStore) |
| Background location | expo-location + task-manager | Browser Geolocation API (foreground only) |
| Maps | react-native-maps (Google) | Leaflet + OpenStreetMap |
| QR scanning | expo-camera | Not supported on web (manual entry only) |
| Notifications | ntfy.sh (planned) | Browser Notification API (future) |
| Offline support | Full offline CRUD via WatermelonDB | Limited -- requires connectivity |

The web app is "online-first" rather than "offline-first" since browsers don't have the same persistent local database capabilities as mobile. This is an acceptable tradeoff for a web companion app.
