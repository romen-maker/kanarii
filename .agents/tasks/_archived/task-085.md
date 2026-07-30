# Task-085: Dockerización de Producción Multi-etapa (Dockerfile + .dockerignore)

## Objetivo
Empaquetar la aplicación Kanarii en un contenedor Docker de producción multi-etapa optimizado (`Dockerfile` y `.dockerignore`), minimizando el tamaño final de la imagen y el consumo de RAM a <200MB en la VPS de Coolify.

## Contexto técnico
- Basado en `docs/sprints/sprint-20-research.md`.
- `Dockerfile` debe:
  - Utilizar `node:22-alpine` como imagen base.
  - Instalar `tini` mediante `apk add --no-cache tini` para gestión de procesos e interrupciones en el contenedor.
  - Utilizar patrón multi-stage (`base`, `deps`, `build`, `runner`).
  - En la etapa `build`, aceptar argumentos de construcción (`ARG VITE_*`) e inyectarlos para que Vite compile los valores en `dist/`.
  - En la etapa `runner`, copiar `dist/`, `src/`, `package.json` y `node_modules`.
  - Configurar `EXPOSE 3000` y `HEALTHCHECK` consultando `http://127.0.0.1:3000/health`.
  - Usar `ENTRYPOINT ["tini", "--"]` y `CMD ["npx", "tsx", "src/server.ts"]` o `CMD ["npm", "start"]`.
- `.dockerignore` debe omitir `node_modules`, `.git`, `.env*`, `.tmp/`, `tests/` y artefactos de desarrollo.

## Caja de archivos
Archivos autorizados para creación:
- `Dockerfile`
- `.dockerignore`

## Criterios de done
- [x] Creado `Dockerfile` multi-stage optimizado para producción con `node:22-alpine`, `tini`, dependencias de producción aisladas (`prod-deps`) y `HEALTHCHECK`.
- [x] Creado `.dockerignore` previniendo la copia de artefactos de desarrollo y secretos locales.
- [x] Compilación TypeScript sin errores (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T10:21:28Z
- [x] Rama creada: feat/T-085-dockerizacion-multietapa
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
