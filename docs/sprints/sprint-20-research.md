# Research Sprint 20
> Fuente: Perplexity / Investigación del Usuario — 30/07/2026
> Tarea principal: Servidor Unificado Node.js (`src/server.ts`) & Dockerización en Coolify

## Hallazgos clave
- **Servidor Express SPA & API**: Secuencia estricta requerida:
  1. Middleware `express.static('dist')` para servir assets compilados (`/assets/*.js`, CSS, imágenes).
  2. Router `/api/v1` importado desde `src/adapters/http/router.ts`.
  3. Endpoint `GET /health` para salud en Traefik/Coolify.
  4. Fallback `app.get('*', ...)` que sirve `dist/index.html` para enrutamiento cliente React Router 7 sin dar 404.
- **Docker Multi-Stage (Node 22 Alpine)**:
  - Base: `node:22-alpine` con `tini` como init process para manejo de señales UNIX.
  - Stage `deps`: instalación congelada con `npm ci`.
  - Stage `build`: compila Vite frontend (`dist/`) y bundling del servidor TS.
  - Stage `runner`: copia `node_modules`, `dist/`, expone `PORT=3000` y define `HEALTHCHECK`.
- **Variables de Entorno en Coolify**:
  - `VITE_*` (como `VITE_API_BASE=/api/v1`): pasadas como `ARG` en tiempo de build porque Vite las embebe en el bundle estático.
  - `TELEGRAM_BOT_TOKEN`, `PORT=3000`, `HOST=0.0.0.0`, `NODE_ENV=production`: runtime env variables inyectadas por Coolify.

## Decisiones tomadas
- **Decisión:** Monolito Adaptativo Express + Vite Static + Fallback SPA.
- **Por qué:** Mantiene un único contenedor en Coolify, bajísimo consumo de recursos (<200MB RAM) y soporta tanto la SPA cliente como los adaptadores de Telegram/API.
- **Constraint clave:** Servir `express.static` ANTES del wildcard `app.get('*')` para evitar interceptar assets estáticos.

## Descartado
- Nginx estático puro (no permite ejecutar bot de Telegram ni endpoints REST en la misma instancia).
- Arquitectura distribuida multicontenedor (sobreingeniería prematura para fase MVP).
