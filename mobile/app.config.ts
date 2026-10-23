import type { ConfigContext, ExpoConfig } from 'expo/config';

// NFC and Google Sign-In are native modules: this app runs in a development build, not Expo Go.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'LinenTag',
  slug: 'linentag',
  scheme: 'linentag',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.linentag.app',
    supportsTablet: true,
  },
  android: {
    package: 'com.linentag.app',
    adaptiveIcon: {
      backgroundColor: '#FAF8F5',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: { favicon: './assets/favicon.png' },
  experiments: { typedRoutes: true },
  plugins: [
    'expo-router',
    'expo-status-bar',
    'expo-secure-store',
    'expo-dev-client',
    ['react-native-nfc-manager', { nfcPermission: 'LinenTag uses NFC to identify your tagged bedding.' }],
    // Camera is only for the QR stand-in tags used while testing without NFC hardware.
    [
      'expo-camera',
      {
        cameraPermission: 'LinenTag uses the camera to scan QR test tags.',
        microphonePermission: false,
        recordAudioAndroid: false,
      },
    ],
    [
      '@react-native-google-signin/google-signin',
      // Placeholder keeps prebuild working before Google OAuth is configured.
      { iosUrlScheme: process.env.GOOGLE_IOS_URL_SCHEME || 'com.googleusercontent.apps.unconfigured' },
    ],
  ],
});
