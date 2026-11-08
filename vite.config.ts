import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg'],
    manifest: {
      name: 'Lezioni AI', short_name: 'Lezioni AI', description: 'Archivio locale per registrazioni di lezioni',
      theme_color: '#101611', background_color: '#101611', display: 'standalone', start_url: '/', scope: '/',
      icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
    },
    workbox: { navigateFallback: '/index.html', globPatterns: ['**/*.{js,css,html,svg,webmanifest}'] }
  })],
  server: { host: '0.0.0.0' }
});
