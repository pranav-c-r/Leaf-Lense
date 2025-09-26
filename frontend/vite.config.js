import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',  // Automatically updates SW
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'], // optional
      manifest: {
        name: 'LeafLense',
        short_name: 'LeafLense',
        description: 'AI-Powered Agricultural Assistant',
        theme_color: '#2563eb',
        background_color: '#2563eb',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
