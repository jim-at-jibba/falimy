# Falimy Mobile

Falimy is a private family hub app built with Expo + React Native.
It combines shared lists, recipes, location sharing, and geofences in one mobile experience.

## What the app does

- **Family onboarding**: create or join a family and log in.
- **Home snapshot**: quick overview cards for lists, completed tasks, recipes, location sharing, and geofences.
- **Shared lists**: shopping/todo/packing/custom lists with checkable items.
- **Recipes**: create, import-from-URL, edit, and browse saved recipes.
- **Map & location**: view family member locations, timeline history, and sharing status.
- **Geofences**: define places and trigger rules for notifications/monitoring.
- **Settings**: family settings, server URL management, and logout.

## Tech stack

- **Framework**: Expo (React Native + Expo Router)
- **State/data**: React hooks + WatermelonDB (local cache/offline-first)
- **Backend**: PocketBase (auth + API + realtime)
- **Sync model**: periodic sync + realtime subscription upserts
- **Styling**: react-native-unistyles
- **Testing**: Jest + Testing Library
- **Lint/format**: Biome

## Project structure

- `src/app/` - route-based screens (auth flow, tabs, recipe screens)
- `src/components/` - reusable UI components
- `src/hooks/` - app/domain hooks (lists, recipes, sync, location, geofences)
- `src/db/` - WatermelonDB schema, models, migrations, sync helpers
- `src/api/` - PocketBase and realtime integration
- `src/services/` - background services (for example location task)
- `src/utils/` - shared utilities/config helpers
- `docs/` - internal engineering docs

## Prerequisites

- Node.js 20+ recommended
- npm
- Xcode (for iOS simulator) and/or Android Studio (for Android emulator)
- A running PocketBase backend compatible with this app

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run start
```

3. Run on a platform:

```bash
npm run ios
# or
npm run android
```

4. In the app, set your backend endpoint:
   - Open **Set Server URL** from the auth screen.
   - Enter your PocketBase server URL.

## Available scripts

- `npm run start` - start Expo dev server
- `npm run ios` - run on iOS simulator/device
- `npm run android` - run on Android emulator/device
- `npm run web` - run Expo web build
- `npm run lint` - run Biome lint
- `npm run format` - auto-format with Biome
- `npm run check` - run Biome checks (lint + formatting checks)
- `npm run test` - run Jest tests
- `npm run test:watch` - run Jest in watch mode
- `npm run test:coverage` - run tests with coverage
- `npm run typegen` - regenerate PocketBase TS types

## Data model (high level)

WatermelonDB schema includes:

- `families`
- `members`
- `lists`
- `list_items`
- `recipes`
- `location_history`
- `geofences`

These mirror backend entities and are kept in sync via pull/realtime upserts.

## Development notes

- Server URL is persisted in SecureStore (`src/utils/config.ts`).
- Tabs trigger sync/realtime hooks in `src/app/(tabs)/_layout.tsx`.
- Error handling and logging conventions are documented in `docs/ERROR_HANDLING.md`.

## Troubleshooting

- If auth appears stale after login, return to tabs and let the auth context refresh.
- If local data looks out of date, pull to refresh on list/map/recipe screens.
- If backend calls fail, verify the configured server URL and backend availability.
