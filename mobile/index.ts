import EventSource from "react-native-sse";

// React Native (Hermes) lacks a native EventSource implementation.
// PocketBase SSE subscriptions require it on the global scope.
// react-native-sse is purpose-built for RN and handles network/lifecycle
// transitions better than browser-oriented polyfills.
// @ts-ignore — assigning RN-specific polyfill to global for PocketBase SSE
global.EventSource = EventSource;

import "expo-router/entry";
import "./src/styles";
