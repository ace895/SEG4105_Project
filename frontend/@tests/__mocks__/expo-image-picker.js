// Minimal mock for expo-image-picker used in tests
module.exports = {
    requestCameraPermissionsAsync: async () => ({ status: 'granted' }),
    requestMediaLibraryPermissionsAsync: async () => ({ status: 'granted' }),
    launchCameraAsync: async () => ({ canceled: false, assets: [{ uri: 'file://new.jpg' }] }),
    launchImageLibraryAsync: async () => ({ canceled: false, assets: [{ uri: 'file://new.jpg' }] }),
}
