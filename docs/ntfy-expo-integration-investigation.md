# ntfy.sh + Expo Notifications Integration Investigation

**Date**: February 15, 2026  
**Purpose**: Understand how to integrate ntfy.sh with Expo for Phase 5 notifications

---

## Overview

ntfy.sh is a simple HTTP-based pub/sub notification service. Unlike traditional push notification services (FCM, APNs), ntfy.sh is self-hostable and privacy-focused. However, it has **different architectures for Android vs iOS** that we need to understand.

---

## Key Findings

### 1. ntfy.sh Architecture

**Publishing (sending notifications)**: Simple HTTP POST
```bash
curl -d "Message text" https://ntfy.example.com/mytopic
```

**Subscribing (receiving notifications)**: Three options
- **JSON stream**: Long-lived HTTP connection returning newline-delimited JSON
- **SSE (Server-Sent Events)**: EventSource-compatible stream
- **WebSockets**: `wss://ntfy.example.com/mytopic/ws`

---

### 2. Platform Differences

#### Android
- **Native app approach**: The ntfy Android app maintains persistent connection to server
- **React Native approach**: Can use HTTP stream/WebSocket to listen for messages
- **Works great for self-hosted**: No third-party dependencies
- **Background**: Can maintain connection even when app is backgrounded (with proper background service)

#### iOS
- **Problem**: iOS restricts background processing - can't maintain long-lived connections
- **Solution**: ntfy has a clever workaround using poll requests + upstream server
- **How it works**:
  1. Self-hosted ntfy server forwards "poll requests" to upstream server (ntfy.sh or custom)
  2. Upstream server uses Apple APNs to wake the device
  3. Device polls self-hosted server for actual message
  4. Message displayed to user

**Requirements for iOS instant notifications**:
- Must configure `upstream-base-url: "https://ntfy.sh"` on self-hosted server
- Self-hosted server sends poll requests to ntfy.sh
- ntfy.sh forwards to APNs
- APNs wakes iOS device
- iOS app polls your self-hosted server

**Without upstream server**:
- Notifications still arrive, but with significant delay (20-30 minutes if phone active, hours if not)

---

### 3. Integration with Expo/React Native

There are **two approaches** we can take:

#### ✅ Option A: Hybrid Approach (Recommended)

**For publishing**: Simple HTTP POST from server or app
```typescript
// From mobile app or PocketBase hook
await fetch('https://ntfy.family.example.com/fam_abc123/shopping', {
  method: 'POST',
  body: 'New item added to Groceries list',
  headers: {
    'Title': 'Shopping List Update',
    'Priority': 'default',
    'Tags': 'shopping,list',
  }
});
```

**For receiving**:
- **Android**: Use SSE/WebSocket to listen directly to ntfy server
  - Can use `react-native-sse` (already in dependencies!) or EventSource
  - Display notifications using `expo-notifications`
  - Works fully self-hosted

- **iOS**: Configure upstream forwarding + use Expo Push Notifications
  - Self-hosted ntfy forwards poll requests to ntfy.sh
  - ntfy.sh uses APNs to wake device
  - iOS app fetches actual message from self-hosted server
  - Display using `expo-notifications`

**Pros**:
- Works on both platforms
- Maintains self-hosted privacy (only poll requests go through ntfy.sh, not actual message content)
- Uses existing ntfy infrastructure
- No need to build custom iOS notification extension

**Cons**:
- iOS requires ntfy.sh as upstream (minor privacy compromise - they see topic hashes and timing, not content)
- More complex setup (need to configure upstream)

---

#### Option B: Pure Expo Push Notifications

**Architecture**: Skip ntfy.sh entirely, use Expo's push service

**For publishing**: Send to Expo Push API from PocketBase
```typescript
// From PocketBase hook
await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: expoPushToken,
    title: 'Shopping List Update',
    body: 'New item added to Groceries',
    data: { listId: '123', action: 'item_added' },
  })
});
```

**For receiving**: Use `expo-notifications` directly

**Pros**:
- Simpler implementation
- Native Expo approach (well-documented)
- Works great on both iOS and Android
- No upstream server needed

**Cons**:
- **Notifications go through Expo's servers** (privacy concern)
- Requires Expo Push Token management
- Defeats the "self-hosted privacy" principle
- Expo's servers could theoretically read notification content

---

## Recommendation

### For Falimy's Privacy-First Mission: Option A (Hybrid with ntfy)

**Reasoning**:
1. **Privacy alignment**: Message content never leaves your infrastructure
   - Only encrypted poll requests go to ntfy.sh on iOS
   - Poll requests contain message ID hash, not actual content
   - Actual messages fetched directly from self-hosted server

2. **Self-hosting benefits**: 
   - No dependency on Expo's push servers
   - No third-party sees notification content
   - Works even if Expo discontinues push service

3. **Technical feasibility**:
   - `react-native-sse` already in dependencies
   - `expo-notifications` for local display
   - ntfy.sh upstream is free and reliable

---

## Implementation Plan for Option A

### Phase 5.0: Infrastructure Setup

**Deliverables**:
- [ ] Add ntfy to docker-compose.yml (if not already present)
- [ ] Configure `upstream-base-url: "https://ntfy.sh"` for iOS support
- [ ] Set up authentication if needed
- [ ] Test basic publishing: `curl -d "test" https://ntfy.example.com/test_topic`

### Phase 5.1: Publishing from PocketBase

**Deliverables**:
- [ ] Create `server/pb_hooks/notify_*.pb.js` hooks for events:
  - Shopping list item added → notify assigned user
  - Geofence triggered → notify watch user
  - Location request → notify target user
- [ ] Use family's `ntfy_topic_prefix` to namespace topics
- [ ] Include structured data (priority, tags, action buttons)

**Example PocketBase hook**:
```javascript
// server/pb_hooks/notify_shopping.pb.js
onRecordCreate("list_items", (e) => {
  const item = e.record;
  const list = $app.findRecordById("lists", item.get("list_id"));
  const family = $app.findRecordById("families", list.get("family_id"));
  const assignedUser = list.get("assigned_to");
  
  if (!assignedUser) return;
  
  const topicPrefix = family.get("ntfy_topic_prefix");
  const topic = `${topicPrefix}/shopping/${list.id}`;
  
  // Publish to ntfy
  $http.send({
    url: `${ntfyBaseUrl}/${topic}`,
    method: "POST",
    body: `New item added: ${item.get("name")}`,
    headers: {
      "Title": `Shopping: ${list.get("name")}`,
      "Tags": "shopping,cart",
      "Priority": "default",
      "Actions": JSON.stringify([{
        action: "view",
        label: "Open List",
        url: `falimy://lists/${list.id}`
      }])
    }
  });
});
```

### Phase 5.2: Mobile App - Receiving Notifications

**Platform-specific approach**:

**Android** (SSE subscription):
```typescript
// src/services/ntfyService.ts
import { EventSource } from 'react-native-sse';
import * as Notifications from 'expo-notifications';

export const subscribeToFamilyNotifications = (topicPrefix: string) => {
  const url = `${ntfyBaseUrl}/${topicPrefix}/+/sse`; // Subscribe to all subtopics
  
  const eventSource = new EventSource(url, {
    headers: {
      // Add auth if needed
    }
  });
  
  eventSource.addEventListener('message', async (event) => {
    const message = JSON.parse(event.data);
    
    // Display local notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title || 'Falimy',
        body: message.message,
        data: message.actions, // For action buttons
      },
      trigger: null, // Show immediately
    });
  });
  
  return eventSource;
};
```

**iOS** (Expo Push Notifications with ntfy poll request handling):
```typescript
// iOS gets woken by APNs via ntfy.sh upstream
// Then needs to poll for actual message
// This happens automatically if using ntfy iOS app

// For custom integration:
// 1. Configure Expo notifications for iOS
// 2. ntfy.sh forwards poll request via APNs
// 3. Expo notification background handler polls ntfy server
// 4. Display notification with actual content
```

**Unified approach** (works on both):
```typescript
// src/hooks/useNotifications.ts
export const useNotifications = () => {
  const { user } = useAuth();
  const topicPrefix = user?.family?.ntfy_topic_prefix;
  
  useEffect(() => {
    if (!topicPrefix) return;
    
    // Request permissions
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      
      // Platform-specific subscription
      if (Platform.OS === 'android') {
        // Subscribe via SSE
        const eventSource = subscribeToFamilyNotifications(topicPrefix);
        return () => eventSource.close();
      } else {
        // iOS: Configure expo notifications
        // ntfy upstream handles the wake-up
        // We just need to handle incoming notifications
        const subscription = Notifications.addNotificationReceivedListener(
          handleNotification
        );
        return () => subscription.remove();
      }
    };
    
    setupNotifications();
  }, [topicPrefix]);
};
```

### Phase 5.3: Deep Linking & Action Buttons

**Deliverables**:
- [ ] Configure deep linking scheme (`falimy://`)
- [ ] Handle notification taps (navigate to list/map/etc.)
- [ ] Support action buttons (ntfy's `Actions` header)

---

## Alternative: Could We Skip ntfy.sh on iOS?

### Option C: Android-only ntfy + iOS uses local notifications

**Approach**:
- Android: Full ntfy integration with SSE
- iOS: Rely on app foreground polling + local notifications when app is active
- Trade-off: iOS users don't get notifications when app is closed

**Pros**: Truly self-hosted, no upstream server
**Cons**: Poor iOS UX (major limitation)

**Verdict**: Not recommended - iOS users are 50%+ of family app market

---

## Privacy Analysis

### What ntfy.sh sees with upstream forwarding:

**They DON'T see**:
- Actual message content ✅
- User names or emails ✅
- Family information ✅
- List contents ✅

**They DO see**:
- SHA256 hash of topic URL (e.g. `6de73be8dfb7d69e...`)
- Timestamp of poll request
- Your server's IP address
- Frequency of notifications

**Assessment**: Acceptable privacy trade-off for iOS support. Topic hashes are meaningless without knowing the family's topic prefix, which ntfy.sh doesn't have.

---

## Technical Requirements

### Dependencies Needed:
- ✅ `react-native-sse` - Already installed!
- ✅ `expo-notifications` - Need to install
- Server: ntfy running in Docker with upstream config

### Server Configuration:
```yaml
# docker-compose.yml
services:
  ntfy:
    image: binwiederhier/ntfy
    environment:
      NTFY_BASE_URL: https://ntfy.family.example.com
      NTFY_UPSTREAM_BASE_URL: https://ntfy.sh  # For iOS instant notifications
      NTFY_CACHE_FILE: /var/lib/ntfy/cache.db
      NTFY_AUTH_DEFAULT_ACCESS: deny-all  # Private instance
      NTFY_BEHIND_PROXY: true
    volumes:
      - ./ntfy:/var/lib/ntfy
    ports:
      - 8093:80
```

### Mobile App Configuration:
```json
// app.json
{
  "expo": {
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#2BCCBD"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ]
  }
}
```

---

## Recommended Approach

**Use Option A (Hybrid)** with this architecture:

```
┌─────────────────────────────────────────────┐
│           Mobile App (iOS/Android)           │
│                                              │
│  Publishing:                                 │
│    - Direct HTTP POST to self-hosted ntfy ──┼──┐
│                                              │  │
│  Receiving:                                  │  │
│    Android: SSE stream ←────────────────────┼──┤
│    iOS: Expo notifications (via upstream) ←─┼──┤
└─────────────────────────────────────────────┘  │
                                                 │
                ┌────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│     Self-Hosted ntfy.sh Server       │
│  - Receives all published messages   │
│  - Forwards poll requests to ntfy.sh │◄──┐
│  - Serves actual message content     │   │
└──────────────────┬───────────────────┘   │
                   │                        │
         ┌─────────┴──────────┐             │
         │                    │             │
         ▼                    ▼             │
┌─────────────────┐  ┌─────────────────┐   │
│  Android Device │  │   iOS Device    │   │
│                 │  │                 │   │
│  SSE Stream ────┤  │  1. Poll req ───┼───┤
│  Shows notif    │  │     via ntfy.sh │   │
│                 │  │  2. Woken by    │   │
│                 │  │     APNs        │   │
│                 │  │  3. Fetches     │   │
│                 │  │     message ────┼───┘
│                 │  │  4. Shows notif │
└─────────────────┘  └─────────────────┘
                              │
                              │
                              ▼
                     ┌─────────────────┐
                     │   ntfy.sh       │
                     │  (Upstream)     │
                     │                 │
                     │  Forwards to    │
                     │  APNs/FCM       │
                     └─────────────────┘
```

**Privacy preserved**:
- Message content stays on self-hosted server ✅
- Only poll request metadata goes to ntfy.sh ✅
- ntfy.sh sees topic hash, not actual family data ✅

---

## Implementation Complexity

### Easy Parts:
- Publishing from PocketBase hooks (simple HTTP)
- Android SSE subscription
- Basic notification display with expo-notifications

### Medium Complexity:
- iOS upstream configuration
- Deep linking / action buttons
- Background notification handling on Android

### Hard Parts (deferred):
- Building custom iOS app with native ntfy integration (not needed if using upstream)
- Self-hosting upstream server instead of using ntfy.sh (only needed if paranoid about topic hashes)

---

## Next Steps

1. **Install expo-notifications**: `npm install expo-notifications`
2. **Configure ntfy Docker container** with upstream for iOS
3. **Create PocketBase hooks** for notification triggers
4. **Build notification service** in mobile app:
   - Android: SSE subscription
   - iOS: Expo notification handler
5. **Test end-to-end** on both platforms

---

## Questions & Decisions

### Q: Do we need the ntfy mobile app?
**A**: No! We can handle notifications entirely within Falimy app using:
- SSE stream for listening (Android)
- Expo notifications for display (both platforms)
- ntfy.sh upstream for iOS wake-up (transparent to user)

### Q: Does using ntfy.sh upstream violate privacy goals?
**A**: Acceptable trade-off because:
- Message content never goes to ntfy.sh
- Only SHA256 hashes of topic URLs
- Required for iOS instant notifications
- Alternative is 20min-2hour delays on iOS

### Q: Could we use Expo Push Notifications exclusively?
**A**: Yes, but it defeats the privacy goal. All notifications would go through Expo's servers, which can read the content.

### Q: What if ntfy.sh goes down?
**A**: 
- Android unaffected (direct connection to self-hosted)
- iOS falls back to polling (20-30min delay if phone active)
- Could self-host upstream server (advanced)

---

## Conclusion

**Recommendation**: Proceed with **Option A (Hybrid ntfy + Expo)**

This gives us:
- ✅ Self-hosted privacy (message content never leaves family server)
- ✅ iOS instant notifications (via ntfy.sh upstream for poll requests)
- ✅ Android instant notifications (direct SSE)
- ✅ Unified codebase using expo-notifications for display
- ✅ No need to build custom iOS notification extension
- ✅ Acceptable privacy trade-off (only topic hashes to ntfy.sh)

**Effort estimate**: 1-2 weeks
- Infrastructure: 2-4 hours
- PocketBase hooks: 4-8 hours
- Mobile notification service: 8-16 hours
- Testing & polish: 4-8 hours
