import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
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
