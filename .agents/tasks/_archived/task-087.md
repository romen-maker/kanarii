# Task-087: Verificación de Despliegue y Hardening (SPA Fallback & Healthcheck)

## Objetivo
Crear una suite de pruebas automatizada en `tests/server.test.ts` para verificar la robustez del servidor unificado Node/Express (`src/server.ts`), asegurando que `/health` responda 200 OK, el SPA Fallback sirva `index.html` para rutas cliente de React Router 7 y las peticiones a `/api/v1` no sean interceptadas por el catch-all del frontend.

## Contexto técnico
- Basado en `docs/sprints/sprint-20-research.md`.
- `tests/server.test.ts` debe:
  - Simular o realizar solicitudes HTTP locales al servidor Express.
  - Verificar que `GET /health` devuelva código HTTP `200` y cuerpo JSON conteniendo `{ status: 'ok' }`.
  - Verificar que rutas navegables de React Router (ej. `/comunidades`, `/actas`) sirvan la SPA estática.
  - Verificar que las rutas `/api/v1/...` preserven su comportamiento API sin colisionar con el fallback HTML.

## Caja de archivos
Archivos autorizados para creación:
- `tests/server.test.ts`

## Criterios de done
- [x] Creado `tests/server.test.ts` verificando el endpoint `/health`, la resolución de la SPA y el aislamiento del router `/api/v1`.
- [x] Ejecución del test con 100% afirmaciones superadas.
- [x] Compilación TypeScript sin errores (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T10:33:24Z
- [x] Rama creada: feat/T-087-verificacion-despliegue-server
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
