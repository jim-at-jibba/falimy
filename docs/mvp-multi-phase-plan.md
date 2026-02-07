# Falimy MVP Multi-Phase Plan

This plan breaks the MVP into small, restartable chunks. Each chunk lists clear outcomes and concrete deliverables so you can pause and resume without losing context.

## Phase 0: Project Scaffolding and Ground Rules

Goal: establish a stable baseline and shared conventions before feature work.

### 0.1 Repository setup
- Outcome: working Expo app shell with TypeScript and basic navigation.
- Deliverables:
  - Expo project initialized with TypeScript.
  - App launches on iOS and Android simulators.
  - Basic Expo Router layout present.

### 0.2 Coding conventions
- Outcome: consistent project structure and quality gates.
- Deliverables:
  - Linting and formatting configured.
  - Basic folder structure aligned to `docs/mvp.md`.
  - Minimal README updates for local dev setup.

### 0.3 Secrets and config
- Outcome: safe handling of server URLs and tokens.
- Deliverables:
  - Config helpers to store the PocketBase URL.
  - Secure storage strategy outlined (Expo SecureStore).

## Phase 1: Auth and Family Onboarding

Goal: allow a family admin to create a family, and a member to join via QR.

### 1.1 PocketBase connectivity
- Outcome: app can connect to a self-hosted PocketBase instance.
- Deliverables:
  - Server URL input screen.
  - Connection validation with success and error states.

### 1.2 Auth flows
- Outcome: users can create accounts and sign in.
- Deliverables:
  - Create account screen (name, email, password).
  - Login screen.
  - Token storage with auto-refresh on launch.
  - Auth context for global state.

### 1.3 Create family
- Outcome: admin can create a family and become admin.
- Deliverables:
  - Create family screen.
  - Family record creation in PocketBase.
  - Admin role assignment.

### 1.4 Invite member via QR
- Outcome: members can join with a scanned invite.
- Deliverables:
  - Invite QR code generation (JSON payload).
  - QR scan screen and parsing.
  - Invite validation against PocketBase.
  - Join flow to create a member account.

### 1.5 Family management basics
- Outcome: admin can see members and manage invite code.
- Deliverables:
  - Family settings screen listing members.
  - Regenerate invite code action.
  - Role assignment for member vs child.

## Phase 2: Local Data and Sync Foundation

Goal: implement WatermelonDB with a basic sync loop before any feature data.

### 2.1 WatermelonDB setup
- Outcome: local database initialized and usable.
- Deliverables:
  - Schema and models for core entities.
  - Database initialization and provider.

### 2.2 Sync engine baseline
- Outcome: client-side sync adapter to PocketBase.
- Deliverables:
  - Pull changes with last timestamp.
  - Push changes for create/update/delete.
  - Last-write-wins conflict resolution.
  - Manual sync trigger and background hook.

### 2.3 Realtime subscription skeleton
- Outcome: baseline SSE wiring for future collections.
- Deliverables:
  - PocketBase SSE subscription wrapper.
  - Test harness to confirm updates are received.

## Phase 3: Shopping Lists MVP

Goal: fully usable shopping lists with offline support and sync.

### 3.1 Shopping list screens
- Outcome: lists overview and list detail screens.
- Deliverables:
  - Lists overview UI with active/completed statuses.
  - List detail screen showing items.

### 3.2 List CRUD
- Outcome: create, rename, archive, delete lists.
- Deliverables:
  - Create list flow.
  - Edit list name.
  - Archive list behavior.
  - Delete list action.

### 3.3 Item CRUD and behavior
- Outcome: add, check, delete, reorder items.
- Deliverables:
  - Add item form (name, quantity, note).
  - Toggle checked state and track `checked_by`.
  - Checked items sink to bottom.
  - Swipe to delete.
  - Long-press drag reorder.

### 3.4 Offline-first behavior
- Outcome: full usage without network.
- Deliverables:
  - All list and item changes stored locally.
  - Sync on reconnect with conflict resolution.
  - Pull-to-refresh to trigger sync.

### 3.5 Realtime updates
- Outcome: live updates across family members.
- Deliverables:
  - SSE subscription for `shopping_items`.
  - Local DB updated on incoming events.
  - UI updates instantly without manual refresh.

## Phase 4: Location Sharing MVP

Goal: basic location sharing with opt-in controls and map view.

### 4.1 Permissions and background tracking
- Outcome: reliable permission flow and tracking.
- Deliverables:
  - Permission request screen with rationale.
  - Background location task setup.
  - Posting location updates to PocketBase.

### 4.2 Map view
- Outcome: display family members on a map.
- Deliverables:
  - Map screen with markers.
  - Marker details (name, last updated, battery).
  - Quick access to last-known positions.

### 4.3 Sharing controls
- Outcome: user-controlled sharing modes.
- Deliverables:
  - Sharing mode toggle (off, always, timed, on-request).
  - Timed sharing with auto-expiry.

### 4.4 On-request ping
- Outcome: location request workflow.
- Deliverables:
  - Send location request to another user.
  - Accept/ignore response handling.
  - Single location response stored.

### 4.5 Geofences
- Outcome: device-side geofence monitoring.
- Deliverables:
  - Geofence CRUD screens.
  - Local monitoring and trigger logic.
  - Notify via ntfy on enter/exit.

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
