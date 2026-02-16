# Phase 5: Notifications Implementation Plan

**Status**: Ready to start  
**Estimated Effort**: 1-2 weeks  
**Dependencies**: Completed Phases 0-4, ntfy.sh investigation complete

---

## Overview

Implement push notifications for Falimy using ntfy.sh (self-hosted) + expo-notifications. This maintains our privacy-first principles while providing instant notifications on both iOS and Android.

**See also**: `docs/ntfy-expo-integration-investigation.md` for detailed technical investigation and architecture decisions.

---

## Architecture Decision

**Selected Approach**: Hybrid ntfy + Expo (Option A from investigation)

**Why**:
- ✅ Privacy preserved (message content stays on family server)
- ✅ iOS instant notifications (via ntfy.sh upstream poll requests)
- ✅ Android instant notifications (direct SSE connection)
- ✅ Unified codebase using expo-notifications
- ✅ No dependency on Expo's push servers for content

**Privacy trade-off**:
- iOS poll requests go through ntfy.sh (only SHA256 topic hash, no content)
- Acceptable for instant iOS notifications vs 20min-2hr delays

---

## Phase 5.0: ntfy Infrastructure Setup

**Goal**: Get ntfy.sh server running and tested

### Deliverables:

- [ ] **Add ntfy to server infrastructure**
  - File: `server/docker-compose.yml`
  - Add ntfy service with upstream config for iOS
  - Configure volumes for persistence
  - Set up authentication (deny-all default)

- [ ] **Configure ntfy for iOS support**
  ```yaml
  environment:
    NTFY_BASE_URL: https://ntfy.family.example.com
    NTFY_UPSTREAM_BASE_URL: https://ntfy.sh  # Critical for iOS
    NTFY_CACHE_FILE: /var/lib/ntfy/cache.db
    NTFY_AUTH_DEFAULT_ACCESS: deny-all
    NTFY_BEHIND_PROXY: true
  ```

- [ ] **Set up topics and access control**
  - Create user/token for PocketBase to publish
  - Configure ACL for family topic patterns: `fam_*/shopping/*`, `fam_*/location/*`, etc.
  - Test publishing: `curl -d "test" https://ntfy.example.com/test_topic`

- [ ] **Update deployment documentation**
  - Add ntfy to self-hosting guide
  - Document iOS upstream requirement
  - Add troubleshooting section

**Estimated Time**: 2-4 hours

**Success Criteria**:
- ntfy accessible at configured URL
- Can publish message via curl
- Can subscribe via ntfy web app
- Auth working (tokens/users)

---

## Phase 5.1: Publishing from PocketBase

**Goal**: Trigger notifications from server-side events

### Deliverables:

- [ ] **Create notification helper module**
  - File: `server/pb_hooks/lib/ntfy.js`
  - Reusable function to publish to ntfy
  - Handle auth tokens
  - Support priority, tags, actions, icons

- [ ] **Shopping list notifications**
  - File: `server/pb_hooks/notify_shopping.pb.js`
  - Trigger: New item added to list
  - Recipient: User assigned to list
  - Topic: `{family_prefix}/shopping/{list_id}`
  - Content: "New item: {item_name}" on "{list_name}"
  - Action button: "Open List" → deep link

- [ ] **Geofence notifications**
  - File: `server/pb_hooks/notify_geofence.pb.js`
  - Trigger: Geofence entered/exited (posted from mobile app)
  - Recipient: `notify_user_id` from geofence
  - Topic: `{family_prefix}/location/geofence/{geofence_id}`
  - Content: "{user_name} entered/exited {geofence_name}"
  - Priority: High
  - Action: "View Map" → deep link

- [ ] **Location request notifications**
  - File: `server/pb_hooks/notify_location_request.pb.js`
  - Trigger: Location request created
  - Recipient: Target user
  - Topic: `{family_prefix}/location/request/{request_id}`
  - Content: "{requester_name} requests your location"
  - Actions: "Share Location", "Ignore"

- [ ] **Write tests for hooks**
  - Verify ntfy endpoint called with correct payload
  - Verify topic formatting
  - Verify auth headers included

**Estimated Time**: 4-8 hours

**Success Criteria**:
- PocketBase events trigger ntfy publications
- Correct users receive notifications
- Messages include proper metadata (title, priority, tags)
- Action buttons configured correctly

---

## Phase 5.2: Mobile App - Receiving Notifications

**Goal**: Display notifications in mobile app on both platforms

### Deliverables:

- [ ] **Install dependencies**
  ```bash
  cd mobile
  npm install expo-notifications
  npx expo install expo-device
  ```

- [ ] **Configure Expo app**
  - File: `mobile/app.json`
  - Add notification icon and color
  - Configure notification sounds
  - Add expo-notifications plugin

- [ ] **Request notification permissions**
  - File: `src/hooks/useNotificationPermissions.ts`
  - Request permissions on first launch
  - Handle permission denied gracefully
  - Show rationale before requesting

- [ ] **Create notification service**
  - File: `src/services/notificationService.ts`
  - Platform-specific subscription:
    - Android: SSE stream to self-hosted ntfy
    - iOS: Register for Expo push notifications
  - Unified notification display using expo-notifications
  - Background notification handler
  - Notification tap handler (deep linking)

- [ ] **Create useNotifications hook**
  - File: `src/hooks/useNotifications.ts`
  - Subscribe to family topics on auth
  - Unsubscribe on logout
  - Handle notification received
  - Handle notification tapped
  - Track notification state

- [ ] **Integrate with app**
  - File: `src/app/_layout.tsx`
  - Initialize notification service in root layout
  - Set up notification handlers
  - Configure notification channels (Android)

- [ ] **Add notification settings screen**
  - File: `src/app/(tabs)/settings/notifications.tsx`
  - Toggle notifications on/off
  - Select notification categories (shopping, location, geofences)
  - Test notification button

**Estimated Time**: 8-16 hours

**Key Implementation Details**:

**Android (SSE subscription)**:
```typescript
// src/services/notificationService.android.ts
import { EventSource } from 'react-native-sse';
import * as Notifications from 'expo-notifications';

export const subscribeToNotifications = (ntfyUrl: string, topicPrefix: string) => {
  // Subscribe to all family topics: fam_abc123/+/sse
  const url = `${ntfyUrl}/${topicPrefix}/+/sse`;
  
  const eventSource = new EventSource(url, {
    headers: {
      // Add auth if needed
      'Authorization': `Bearer ${ntfyToken}`,
    }
  });
  
  eventSource.addEventListener('message', async (event) => {
    const data = JSON.parse(event.data);
    
    if (data.event === 'message') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title || 'Falimy',
          body: data.message,
          data: {
            topic: data.topic,
            actions: data.actions,
          },
        },
        trigger: null,
      });
    }
  });
  
  return () => eventSource.close();
};
```

**iOS (Expo push with polling)**:
```typescript
// src/services/notificationService.ios.ts
import * as Notifications from 'expo-notifications';

export const setupNotifications = async () => {
  // Register for push notifications (for wake-up from APNs via ntfy.sh)
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;
  
  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  
  // Listen for notification received (when woken by poll request)
  const subscription = Notifications.addNotificationReceivedListener(
    async (notification) => {
      // ntfy.sh woke us up, now fetch actual message from self-hosted server
      const pollId = notification.request.content.data?.poll_id;
      if (pollId) {
        await fetchAndDisplayMessage(pollId);
      }
    }
  );
  
  return subscription;
};
```

**Success Criteria**:
- Notifications display on both platforms
- Tapping notification navigates to correct screen
- Background notifications work
- Foreground notifications work
- Action buttons functional

---

## Phase 5.3: Deep Linking & Action Buttons

**Goal**: Make notifications actionable

### Deliverables:

- [ ] **Configure deep linking**
  - File: `mobile/app.json`
  - Add URL scheme: `falimy://`
  - Configure associated domains (iOS)

- [ ] **Handle notification taps**
  - File: `src/hooks/useNotificationNavigation.ts`
  - Parse notification data
  - Navigate to correct screen:
    - `falimy://lists/{listId}` → List detail
    - `falimy://map` → Map view
    - `falimy://geofence/{id}` → Geofence detail
  - Handle app in different states (killed, background, foreground)

- [ ] **Implement action buttons**
  - "Open List" → Navigate to list
  - "View Map" → Navigate to map
  - "Share Location" → Trigger location share
  - "Ignore" → Dismiss notification

- [ ] **Add notification categories (Android)**
  - Shopping notifications
  - Location notifications  
  - Geofence notifications
  - Different sounds/vibration patterns

**Estimated Time**: 4-8 hours

**Success Criteria**:
- Tapping notification opens correct screen
- Action buttons work
- Deep links work from killed app state
- Notification categories configured

---

## Testing Plan

### Unit Tests:
- [ ] Test notification payload formatting
- [ ] Test topic generation from family prefix
- [ ] Test permission request logic

### Integration Tests:
- [ ] PocketBase hook triggers ntfy publish
- [ ] Android receives via SSE
- [ ] iOS receives via upstream (harder to test)
- [ ] Notification displays correctly
- [ ] Deep link navigation works

### Manual Testing:
- [ ] Android: Background, foreground, killed states
- [ ] iOS: Background, foreground, killed states
- [ ] Test on both platforms simultaneously
- [ ] Verify privacy (message content not in ntfy.sh logs)
- [ ] Test with network interruptions
- [ ] Test notification settings (enable/disable)

---

## Rollout Strategy

### Week 1:
- Days 1-2: Infrastructure + PocketBase hooks (5.0 + 5.1)
- Days 3-5: Mobile notification service (5.2)

### Week 2:
- Days 1-2: Deep linking + action buttons (5.3)
- Days 3-4: Testing and bug fixes
- Day 5: Documentation and polish

---

## Open Questions

1. **Do we need notification persistence?**
   - Should we store notification history in WatermelonDB?
   - Or rely on ntfy's message cache?

2. **Notification preferences granularity?**
   - Per-category (shopping, location, geofence)?
   - Per-user (mute specific family members)?
   - Per-list (mute specific shopping lists)?

3. **Rate limiting considerations?**
   - Should we throttle notifications (max per hour)?
   - Batch notifications (combine multiple items)?

4. **Offline behavior?**
   - Queue notifications to send when back online?
   - Or only send for events that happen while online?

---

## Dependencies

**Required**:
- `expo-notifications` - Display notifications
- `react-native-sse` - Already installed ✅
- ntfy.sh server - Docker container
- PocketBase hooks - JavaScript runtime

**Optional**:
- `expo-device` - Device info
- Custom notification sounds
- Notification icons/images

---

## Success Metrics

After Phase 5 completion:
- [ ] Users receive shopping notifications within 5 seconds
- [ ] iOS notifications are instant (not 20min delayed)
- [ ] Android notifications work without third-party servers
- [ ] Notification tap opens correct screen
- [ ] Action buttons execute correct actions
- [ ] Privacy maintained (no content leakage to third parties)
- [ ] Works reliably in background on both platforms

---

## References

- Investigation doc: `docs/ntfy-expo-integration-investigation.md`
- ntfy.sh docs: https://docs.ntfy.sh/
- Expo notifications: https://docs.expo.dev/versions/latest/sdk/notifications/
- react-native-sse: Already in package.json
