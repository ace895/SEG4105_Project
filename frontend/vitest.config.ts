import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        include: ['**/__tests__/**/*.test.{ts,tsx,js,jsx}', '**/__tests__/*.test.{ts,tsx,js,jsx}'],
        watch: false,
        reporters: 'default',
    },
    resolve: {
        alias: {
            // Map react-native imports to react-native-web where possible
            'react-native': 'react-native-web',
            // Provide a simple mock for expo-router to avoid bringing real expo internals into tests
            'expo-router': '/@tests/__mocks__/expo-router.js',
            // Stub expo vector icons so tests don't try to load font assets
            '@expo/vector-icons': '/@tests/__mocks__/@expo-vector-icons.js',
            '@expo/vector-icons/*': '/@tests/__mocks__/@expo-vector-icons.js',
            'expo-modules-core': '/@tests/__mocks__/expo-modules-core.js',
            'expo-image-picker': '/@tests/__mocks__/expo-image-picker.js',
        },
    },
});
