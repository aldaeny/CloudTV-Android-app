import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cloudtv.client',
  appName: 'CloudTV',
webDir: "dist/public",
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
