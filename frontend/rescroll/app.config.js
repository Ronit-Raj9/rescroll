export default {
  name: 'rescroll',
  slug: 'rescroll',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'rescroll',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    statusBar: {
      barStyle: 'light-content',
      backgroundColor: '#000000',
      translucent: true
    }
  },
  web: {
    favicon: './assets/favicon.png'
  }
}; 