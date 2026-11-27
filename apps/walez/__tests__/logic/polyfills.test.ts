jest.mock('expo-crypto', () => ({
  getRandomValues: jest.fn((a: Uint8Array) => a),
  randomUUID: jest.fn(() => 'uuid-from-expo-crypto'),
}));

const g = globalThis as unknown as { crypto?: Record<string, unknown> };
let saved: PropertyDescriptor | undefined;

beforeEach(() => {
  saved = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
});
afterEach(() => {
  if (saved) Object.defineProperty(globalThis, 'crypto', saved);
  else delete g.crypto;
});

function load() {
  jest.isolateModules(() => {
    require('../../src/custom/polyfills');
  });
}

test('Expo Go without crypto gets getRandomValues and randomUUID from expo-crypto', () => {
  Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true, writable: true });
  load();
  expect(typeof g.crypto?.getRandomValues).toBe('function');
  expect((g.crypto?.randomUUID as () => string)()).toBe('uuid-from-expo-crypto');
});

test('a browser crypto behind a getter keeps its own methods and subtle', () => {
  const own = { getRandomValues: () => 'own', randomUUID: () => 'own-uuid', subtle: {} };
  // a browser's window.crypto has no setter, so assigning it throws in strict code
  const assign = jest.fn();
  Object.defineProperty(globalThis, 'crypto', { get: () => own, set: assign, configurable: true });
  load();
  expect(assign).not.toHaveBeenCalled();
  expect(g.crypto).toBe(own);
  expect((g.crypto?.randomUUID as () => string)()).toBe('own-uuid');
  expect(g.crypto?.subtle).toBe(own.subtle);
});
