import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.HERMES_CHAT_URL ?? 'http://localhost:3000';
const isHttp = serverUrl.startsWith('http:');

const config: CapacitorConfig = {
  appId: 'com.hermes.chat',
  appName: 'Hermes Chat',

  // Fallback web assets (shown while the remote server is unreachable)
  webDir: 'capacitor-web',

  server: {
    // Load the full Next.js app from the running hermes-chat server.
    // API routes and auth cookies work unchanged this way.
    url: serverUrl,
    cleartext: isHttp,
    androidScheme: isHttp ? 'http' : 'https',
    allowNavigation: ['*'],
  },

  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
