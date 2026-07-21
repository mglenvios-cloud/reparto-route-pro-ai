import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.routeproai.app',
  appName: 'Route Pro AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Geolocation: {
      permissions: {
        enableHighAccuracy: true,
      },
    },
    Preferences: {
      enabled: true,
    },
  },
};

export default config;
