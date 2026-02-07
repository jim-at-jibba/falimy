# Falimy Mobile

## Quickstart

1. Install dependencies:

```bash
npm install
```

2. Run the app:

```bash
npm run ios
```

## Scripts

- `npm run start` - start Expo dev server
- `npm run ios` - run on iOS simulator
- `npm run android` - run on Android emulator
- `npm run web` - run on web
- `npm run lint` - lint the project
- `npm run format` - format the project
- `npm run check` - lint and format checks

## Config

- PocketBase server URL is stored in SecureStore via `src/utils/config.ts`.

## Structure

- `app/` - future Expo Router screens
- `src/` - app modules and shared code
