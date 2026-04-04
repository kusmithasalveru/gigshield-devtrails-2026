import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'GigShield - Income Protection',
        short_name: 'GigShield',
        description: 'AI-Powered Parametric Income Insurance for Gig Workers',
        theme_color: '#1E40AF',
        background_color: '#F9FAFB',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 300 } }
          },
          {
            urlPattern: /\.(js|css|png|svg|woff2?)$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'static-cache', expiration: { maxEntries: 100, maxAgeSeconds: 604800 } }
          }
        ]
      }
    })
  ],
  server: { port: 5173 }
});
