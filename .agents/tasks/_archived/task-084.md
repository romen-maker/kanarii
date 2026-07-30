# Task-084: Servidor Unificado Node.js (src/server.ts)

## Objetivo
Crear el punto de entrada ejecutable del servidor Node.js en `src/server.ts` que unifique el serving de la SPA compilada (`dist/`), los endpoints HTTP API (`/api/v1`), la inicialización opcional del adaptador Telegram y el endpoint de comprobación de salud `/health`.

## Contexto técnico
- Integrado desde `docs/sprints/sprint-20-research.md`.
- `src/server.ts` debe:
  - Inicializar Express y escuchar en `PORT` (`3000`) y `HOST` (`0.0.0.0`).
  - Responder `200 OK` en `GET /health`.
  - Importar y montar `createHttpRouter()` en `/api/v1`.
  - Servir la carpeta `dist/` estáticamente mediante `express.static`.
  - Configurar fallback catch-all `app.get('*')` a `dist/index.html` para permitir el enrutamiento cliente de React Router 7.
  - Inicializar el bot de Telegram de `src/adapters/telegram` de forma no bloqueante si `TELEGRAM_BOT_TOKEN` se encuentra configurado en las variables de entorno.
- Añadir script `start` / `build:server` en `package.json` si resulta necesario para la ejecución con Node.

## Caja de archivos
Archivos autorizados para modificación/creación:
- `src/server.ts`
- `package.json`

## Criterios de done
- [x] Creado `src/server.ts` unificando Express, static serving de Vite `dist/`, API router, healthcheck y Telegram bot listener condicional.
- [x] Añadido script `"start": "tsx src/server.ts"` en `package.json`.
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T10:11:50Z
- [x] Rama creada: feat/T-084-servidor-unificado-node
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
