import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // appId/appName are overridden per tenant at build time:
  //   VITE_APP_ID=com.pisairtel.mail VITE_BRAND_NAME="Pis Airtel Mail" npx cap sync android
  appId: process.env.VITE_APP_ID || 'com.kreatixtech.mail',
  appName: process.env.VITE_BRAND_NAME || 'Kreatix Mail',
  webDir: 'dist',
  backgroundColor: '#ffffff',
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
