import { EventSourcePolyfill } from "event-source-polyfill";

// React Native (Hermes) lacks a native EventSource implementation.
// PocketBase SSE subscriptions require it on the global scope.
if (typeof globalThis.EventSource === "undefined") {
  // @ts-expect-error — assigning polyfill to global for PocketBase SSE
  globalThis.EventSource = EventSourcePolyfill;
}

import "expo-router/entry";
import "./src/styles";
