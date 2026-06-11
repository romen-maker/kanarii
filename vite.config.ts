import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: 'auto',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-192.svg', 'icon-512.svg'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,woff2}'], // Quitamos svg del patrón
          globIgnores: ['**/*.svg'], // Medida explícita para ignorar SVGs
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // Aumentar a 5MB para seguridad
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//, /^\/__\//, /^\/firestore\//],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'firestore-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
        manifest: {
          name: 'Kanarii',
          short_name: 'Kanarii',
          start_url: '/',
          display: 'standalone',
          background_color: '#FDFBF7',
          theme_color: '#6B705C',
          icons: [
            { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
            { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
          ]
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    cacheDir: '.vite_cache', // Forzamos el cache fuera de node_modules para mejor visibilidad y persistencia
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        usePolling: false, // Desactivamos polling para ahorrar CPU a menos que sea necesario
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**']
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'vendor-gemini':   ['@google/genai'],
            'vendor-ui':       ['lucide-react', 'clsx', 'tailwind-merge', 'motion'],
            'vendor-forms':    ['react-hook-form', '@hookform/resolvers', 'zod'],
            'vendor-dates':    ['date-fns', 'react-big-calendar'],
          },
        },
      },
    },
  };
});
