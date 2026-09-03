import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kreatixtech.mail',
  appName: 'Kreatix Mail',
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
