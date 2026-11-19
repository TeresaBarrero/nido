import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // El registro se hace en main.tsx para recargar la app en cuanto haya versión nueva.
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png', 'img/*.jpg'],
      manifest: {
        name: 'Nido',
        short_name: 'Nido',
        description: 'Cosas de bebé de familias de tu barrio',
        lang: 'es-ES',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#DCEBF8',
        theme_color: '#FAF7F4',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2}'],
        // La imagen de vista previa solo la usan LinkedIn y otras redes al compartir el enlace.
        globIgnores: ['**/og-image.jpg'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
});
