# Task-051: PWA — Migrar a vite-plugin-pwa

## Objetivo
Reemplazar el Service Worker manual (`public/sw.js` + registro en `main.tsx`) por `vite-plugin-pwa` con generación automática de SW, precache de todos los chunks compilados, y toast de "Nueva versión disponible" con `registerType: 'prompt'`.

## Contexto técnico
- SW actual: `public/sw.js` manual con caché rígida `kanarii-v1` que solo cachea `/` y `/index.html`. No precachea chunks de Vite.
- `main.tsx` registra el SW manualmente sin lógica de refresh ni skipWaiting.
- Resultado: la PWA no se actualiza en móviles instalados.
- Firebase Hosting sirve la app con rewrite `**` → `/index.html`.
- `vite.config.ts` tiene `manualChunks` (vendor splitting) — compatible con el plugin.
- Research completo en `docs/sprints/sprint-12-research.md`: configuración `prompt` vs `autoUpdate`, headers Firebase, gotchas iOS.

## Caja de archivos
Archivos autorizados para modificación:
- `vite.config.ts` → añadir plugin VitePWA
- `public/sw.js` → eliminar
- `src/main.tsx` → eliminar registro manual del SW
- `firebase.json` → añadir headers Cache-Control para sw.js y workbox-*.js
- `src/components/PwaUpdatePrompt.tsx` → crear (toast nueva versión)
- `src/App.tsx` → importar PwaUpdatePrompt
- `public/manifest.json` → eliminar (el plugin lo genera)
- `package.json` → nuevas devDependencies
- `src/vite-env.d.ts` → tipos para virtual:pwa-register/react (si necesario)

## Criterios de done
- [x] `vite-plugin-pwa` y `workbox-window` instalados como devDependencies
- [x] `vite.config.ts` configurado con VitePWA: registerType prompt, navigateFallback, runtimeCaching
- [x] `public/sw.js` eliminado
- [x] Registro manual del SW en `main.tsx` eliminado
- [x] `firebase.json` tiene headers no-cache para sw.js y workbox-*.js
- [x] Componente `PwaUpdatePrompt.tsx` creado con toast "Nueva versión disponible"
- [x] `PwaUpdatePrompt` montado en `App.tsx`
- [x] `manifest.json` gestionado por el plugin (no duplicado en public/)
- [x] `npm run build` compila sin errores
- [x] `npm run dev` arranca sin errores

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-06-05T16:18:20+01:00
- [x] Rama creada: feat/T-051-pwa-vite-plugin
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente (pendiente de cierre de sesión)
