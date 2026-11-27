// Expo Go has no native module for react-native-get-random-values (its ExpoRandom
// fallback is gone from the SDK), so crypto.getRandomValues and randomUUID come from
// expo-crypto, which Expo Go ships. The idempotency key and the PKCE verifier use them.
// Only what is missing is added: a browser's crypto sits behind a getter on window and
// keeps its own methods, subtle included.
import { getRandomValues, randomUUID } from 'expo-crypto';

const g = globalThis as unknown as { crypto?: { getRandomValues?: unknown; randomUUID?: unknown } };
const c = g.crypto ?? (g.crypto = {});
c.getRandomValues ??= getRandomValues;
c.randomUUID ??= randomUUID;
