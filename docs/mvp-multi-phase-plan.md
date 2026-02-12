# Falimy MVP Multi-Phase Plan

This plan breaks the MVP into small, restartable chunks. Each chunk lists clear outcomes and concrete deliverables so you can pause and resume without losing context.

## Phase 0: Project Scaffolding and Ground Rules ✅

Goal: establish a stable baseline and shared conventions before feature work.

### 0.1 Repository setup ✅
- Outcome: working Expo app shell with TypeScript and basic navigation.
- Deliverables:
  - ✅ Expo project initialized with TypeScript.
  - ✅ App launches on iOS and Android simulators.
  - ✅ Basic Expo Router layout present.

### 0.2 Coding conventions ✅
- Outcome: consistent project structure and quality gates.
- Deliverables:
  - ✅ Linting and formatting configured (Biome 2.3).
  - ✅ Basic folder structure aligned to `docs/mvp.md`.
  - ✅ Minimal README updates for local dev setup.

### 0.3 Secrets and config ✅
- Outcome: safe handling of server URLs and tokens.
- Deliverables:
  - ✅ Config helpers to store the PocketBase URL.
  - ✅ Secure storage strategy outlined (Expo SecureStore).

## Phase 1: Auth and Family Onboarding ✅

Goal: allow a family admin to create a family, and a member to join via QR.

> **Note:** Two minor gaps carried forward to Phase 2: no formal React AuthContext (auth state managed via PocketBase authStore singleton), and no UI for changing member roles after creation.

### 1.1 PocketBase connectivity ✅
- Outcome: app can connect to a self-hosted PocketBase instance.
- Deliverables:
  - ✅ Server URL input screen.
  - ✅ Connection validation with success and error states.

### 1.2 Auth flows ✅
- Outcome: users can create accounts and sign in.
- Deliverables:
  - ✅ Create account screen (name, email, password).
  - ✅ Login screen.
  - ✅ Token storage with auto-refresh on launch.
  - ⚠️ Auth context for global state — functional via PocketBase authStore, but no dedicated React context. Carried to Phase 2.

### 1.3 Create family ✅
- Outcome: admin can create a family and become admin.
- Deliverables:
  - ✅ Create family screen.
  - ✅ Family record creation in PocketBase.
  - ✅ Admin role assignment.

### 1.4 Invite member via QR ✅
- Outcome: members can join with a scanned invite.
- Deliverables:
  - ✅ Invite QR code generation (JSON payload).
  - ✅ QR scan screen and parsing.
  - ✅ Invite validation against PocketBase.
  - ✅ Join flow to create a member account.

### 1.5 Family management basics ✅
- Outcome: admin can see members and manage invite code.
- Deliverables:
  - ✅ Family settings screen listing members.
  - ✅ Regenerate invite code action.
  - ⚠️ Role assignment for member vs child — roles set at creation only, no post-creation UI. Carried to Phase 2.

## Phase 2: Local Data and Sync Foundation ✅

Goal: implement WatermelonDB with a basic sync loop before any feature data. Also close out Phase 1 gaps.

### 2.0 Phase 1 carryovers ✅
- Outcome: proper React-idiomatic auth state and complete family management.
- Deliverables:
  - ✅ AuthContext provider wrapping PocketBase authStore for React consumption.
  - ✅ Role change UI on family settings screen (admin can set member vs child).

### 2.1 WatermelonDB setup ✅
- Outcome: local database initialized and usable.
- Deliverables:
  - ✅ Schema and models for core entities (6 tables, 6 models with associations and writer methods).
  - ✅ Database initialization and provider (SQLiteAdapter with JSI).

### 2.2 Sync engine baseline ✅
- Outcome: client-side sync adapter to PocketBase.
- Deliverables:
  - ✅ Pull changes with last timestamp.
  - ✅ Push changes for create/update/delete.
  - ✅ Last-write-wins conflict resolution.
  - ✅ Manual sync trigger and background hook (useSync: mount, foreground, 5-min interval).

### 2.3 Realtime subscription skeleton ✅
- Outcome: baseline SSE wiring for future collections.
- Deliverables:
  - ✅ PocketBase SSE subscription wrapper (RealtimeManager class).
  - ✅ useRealtime hook (debounced SSE → sync trigger).
  - ✅ useRealtimeDebug hook for testing/development.

## Phase 3: Shopping Lists MVP ✅

Goal: fully usable shopping lists with offline support and sync.

### 3.1 Shopping list screens ✅
- Outcome: lists overview and list detail screens.
- Deliverables:
  - ✅ Shopping tab added to tab navigator with icon.
  - ✅ Lists overview UI with item counts and status badges.
  - ✅ List detail screen showing unchecked items above, checked items below.

### 3.2 List CRUD ✅
- Outcome: create, rename, archive, delete lists.
- Deliverables:
  - ✅ Create list flow (inline input on overview screen).
  - ✅ Edit list name (inline rename on detail screen).
  - ✅ Archive list behavior ("Complete Shopping" action).
  - ✅ Delete list action with confirmation.

### 3.3 Item CRUD and behavior ✅
- Outcome: add, check, delete items.
- Deliverables:
  - ✅ Add item form (name, quantity) on detail screen.
  - ✅ Toggle checked state with `checked_by` tracking.
  - ✅ Checked items sink to bottom (separate section).
  - ✅ Swipe to delete (react-native-gesture-handler Swipeable).

### 3.4 Offline-first behavior ✅
- Outcome: full usage without network.
- Deliverables:
  - ✅ All list and item changes stored locally via WatermelonDB.
  - ✅ Sync on reconnect with conflict resolution (via useSync).
  - ✅ Pull-to-refresh to trigger sync on both screens.

### 3.5 Realtime updates ✅
- Outcome: live updates across family members.
- Deliverables:
  - ✅ useSync and useRealtime wired in tabs layout.
  - ✅ SSE events trigger debounced sync (via RealtimeManager).
  - ✅ WatermelonDB observables auto-update UI on data changes.

> **Note:** Long-press drag reorder is deferred — can be added in Phase 6 polish. Notification integration (ntfy) deferred to Phase 5.

## Phase 4: Location Sharing MVP ✅

Goal: basic location sharing with opt-in controls and map view.

### 4.1 Permissions and background tracking ✅
- Outcome: reliable permission flow and tracking.
- Deliverables:
  - ✅ Permission request screen with rationale.
  - ✅ Background location task setup.
  - ✅ Posting location updates to PocketBase.

### 4.2 Map view ✅
- Outcome: display family members on a map.
- Deliverables:
  - ✅ Map screen with markers.
  - ✅ Marker details (name, last updated, battery).
  - ✅ Quick access to last-known positions.

### 4.3 Sharing controls ✅
- Outcome: user-controlled sharing modes.
- Deliverables:
  - ✅ Sharing mode toggle (off, always, timed, on-request).
  - ✅ Timed sharing with auto-expiry.

### 4.4 On-request ping ✅
- Outcome: location request workflow.
- Deliverables:
  - ✅ Send location request to another user.
  - ✅ Accept/ignore response handling.
  - ✅ Single location response stored.

### 4.5 Geofences ✅
- Outcome: device-side geofence monitoring.
- Deliverables:
  - ✅ Geofence CRUD screens.
  - ✅ Local monitoring and trigger logic.
  - ⚠️ Notify via ntfy on enter/exit — deferred to Phase 5 (notifications).

## Phase 5: Notifications

Goal: push-like notifications via self-hosted ntfy.

### 5.1 ntfy setup
- Outcome: app can publish and subscribe to ntfy topics.
- Deliverables:
  - ntfy client wrapper.
  - Topic format using family prefix.

### 5.2 Shopping notifications
- Outcome: notifications for shopping activity.
- Deliverables:
  - Notify assigned person on new items.
  - Optional notify on list completion.

### 5.3 Location notifications
- Outcome: notifications for geofence and pings.
- Deliverables:
  - Geofence enter/exit alerts.
  - Location request notifications.

## Phase 6: Hardening and UX Polish

Goal: improve reliability, resilience, and user experience.

### 6.1 Error handling and recovery
- Outcome: clear UX when offline or token expired.
- Deliverables:
  - Error states for network failures.
  - Auto-retry and safe fallbacks.
  - Graceful handling of expired tokens.

### 6.2 Data lifecycle
- Outcome: sensible data retention rules.
- Deliverables:
  - Location history pruning policy.
  - Archive behavior for old shopping lists.

### 6.3 UI consistency
- Outcome: consistent, polished interface.
- Deliverables:
  - Empty states and loading indicators.
  - Basic theming and typography.
  - Accessibility checks for key flows.

### 6.4 Cross-platform verification
- Outcome: stable behavior on iOS and Android.
- Deliverables:
  - Smoke test on both platforms.
  - Fix platform-specific UI or permissions issues.

## Phase 7: Self-Hosting Docs and Release Prep

Goal: enable families to self-host and try the MVP.

### 7.1 PocketBase migrations
- Outcome: schema can be reproduced automatically.
- Deliverables:
  - Initial migration files for collections and rules.
  - Seed steps if needed.

### 7.2 Docker and hosting docs
- Outcome: clear self-hosting steps.
- Deliverables:
  - Docker Compose for PocketBase and ntfy.
  - Setup guide for common environments.

### 7.3 MVP release checklist
- Outcome: defined checklist for a shippable build.
- Deliverables:
  - Build instructions.
  - Quick-start guide for testers.
  - Known limitations list.

## Phase 8: Optional Improvements (Post-MVP)

Goal: plan future upgrades without blocking MVP.

### 8.1 Sync optimization
- Outcome: reduced latency and fewer requests.
- Deliverables:
  - Server-side sync endpoint in PocketBase.
  - Performance profiling notes.

### 8.2 Security enhancements
- Outcome: higher privacy guarantees.
- Deliverables:
  - Optional PIN or biometric lock.
  - Invite code expiry or one-time use.

### 8.3 Feature expansion
- Outcome: roadmap for next releases.
- Deliverables:
  - Candidate features from `docs/mvp.md` future list.

---

## Suggested Work Rhythm

- Each chunk should be completed in a single focused session or short sprint.
- When resuming, pick the next incomplete chunk and verify the listed outcomes.
- Keep a simple log of decisions and trade-offs so future work is predictable.
