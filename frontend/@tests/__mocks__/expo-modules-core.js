// Minimal mock for expo-modules-core used in tests
module.exports = {
    ensureNativeModulesAreInstalled: () => { },
    requireOptionalNativeModule: () => ({}),
    requireNativeModule: () => ({}),
    // Simple EventEmitter placeholder
    EventEmitter: class {
        addListener() { }
        removeListener() { }
    },
    // Basic platform shape expected by some expo packages
    Platform: { OS: 'web' },
    // Provide a minimal global for Expo
    ExpoGlobals: {},
}
