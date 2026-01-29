import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/

export default defineConfig({

    build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
        },
      },
    },
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'pwa-64x64.png', 'pwa-192x192.png', 'pwa-512x512.png', 'maskable-icon-512x512.png'],
      manifest: {
        name: 'Rezept App',
        short_name: 'Rezept',
        description: 'A Progressive Web App for managing recipes',
        lang: 'de',
        scope: '/',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        prefer_related_applications: false,
        categories: ['productivity', 'utilities'],
        icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'apple-touch-icon-180x180.png',
          sizes: '180x180',
          type: 'image/png'
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,vue}'],
        // Fallback für SPA Navigation (wichtig für Offline-Navigation)
        navigateFallback: '/index.html',
        // Vermeide, dass API-Aufrufe zur Seite umgeleitet werden
        navigateFallbackDenylist: [/^\/api\//],
        // Caching für verschiedene Ressourcen
        runtimeCaching: [
          // Firebase Storage Bilder (bereits vorhanden)
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'recipe-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // API-Anfragen -> NetworkFirst (frische Daten, Fallback auf Cache)
          {
            urlPattern: /^https?:\/\/(?:localhost|127\.0\.0\.1|api\.|.*your-api-domain\.com)\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 Tag
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // JS/CSS -> StaleWhileRevalidate
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          // Fonts -> CacheFirst mit langer Lebensdauer
          {
            urlPattern: /\.(?:woff2?|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
      }
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
