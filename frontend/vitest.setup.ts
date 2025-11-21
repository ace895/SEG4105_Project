// Vitest setup: polyfills and DOM matchers
import 'whatwg-fetch';
import '@testing-library/jest-dom';

// If tests import expo-router or other RN-only packages, provide minimal mocks here
try {
    // Prefer importing the aliased 'expo-router' (will resolve to our test mock via vitest config)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mockExpoRouter = require('expo-router');
    if (mockExpoRouter) {
        // noop; module exists to satisfy imports
    }
} catch (e) { }

// Define RN-native globals used by some Expo packages
// eslint-disable-next-line no-undef
(globalThis as any).__DEV__ = true;
