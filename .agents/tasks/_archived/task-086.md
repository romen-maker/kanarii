# Task-086: Configuración para Coolify (docker-compose.yml + .env.example.coolify)

## Objetivo
Configurar la orquestación y plantilla de variables de entorno para desplegar Kanarii en Coolify (VPS) utilizando Docker Compose (`docker-compose.yml` y `.env.example.coolify`), diferenciando claramente las variables de build-time de las de runtime.

## Contexto técnico
- Basado en `docs/sprints/sprint-20-research.md`.
- `docker-compose.yml` debe:
  - Definir el servicio `kanarii` compilando desde el `Dockerfile` local.
  - Mapear el puerto `3000:3000`.
  - Configurar las variables de entorno de runtime (`PORT`, `HOST`, `ENABLE_TELEGRAM_BOT`, `TELEGRAM_BOT_TOKEN`, `API_TOKEN`).
  - Incluir reglas de reinicio automático (`restart: unless-stopped`).
  - Configurar el bloque de `healthcheck` apuntando a `/health`.
- `.env.example.coolify` debe:
  - Documentar las variables de compilación (`VITE_*`) necesarias durante `docker build`.
  - Documentar las variables de tiempo de ejecución (`PORT`, `TELEGRAM_BOT_TOKEN`, etc.) inyectables desde la consola de Coolify.

## Caja de archivos
Archivos autorizados para creación:
- `docker-compose.yml`
- `.env.example.coolify`

## Criterios de done
- [x] Creado `docker-compose.yml` compatible con Coolify y Traefik con healthcheck y variables de runtime.
- [x] Creado `.env.example.coolify` categorizando estrictamente variables build-time (`ARG VITE_*`) vs runtime (`ENV PORT`, `ENABLE_TELEGRAM_BOT`, etc.).
- [x] Compilación TypeScript sin errores (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T10:27:39Z
- [x] Rama creada: feat/T-086-configuracion-coolify
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
