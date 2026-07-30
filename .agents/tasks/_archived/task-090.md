# Task-090: GitHub Actions CI Workflow (.github/workflows/ci.yml)

## Objetivo
Crear la canalización de integración continua en `.github/workflows/ci.yml` para automatizar la verificación de tipos con TypeScript y la ejecución de la suite de unit tests con Vitest en un único job optimizado ante cada `push` a `main` y `pull_request`.

## Contexto técnico
- Basado en `docs/sprints/sprint-21-research.md`.
- Crear el archivo `.github/workflows/ci.yml` con la siguiente estructura:
  - Eventos de activación: `push` en `main` y `pull_request`.
  - Job único `test` ejecutándose en `ubuntu-latest`.
  - Configurar `actions/setup-node@v6` con Node 22 y `cache: 'npm'`.
  - Paso `npm ci` para instalar dependencias deterministas.
  - Paso `Typecheck`: `npx tsc --noEmit`.
  - Paso `Unit tests`: `npm run test:unit` con variable `CI: true`.

## Caja de archivos
Archivos autorizados para creación:
- `.github/workflows/ci.yml`

## Criterios de done
- [x] Creado `.github/workflows/ci.yml` con triggers en `push` a `main` y `pull_request`.
- [x] Job configurado con Node 22, `cache: 'npm'`, `npm ci`, `npx tsc --noEmit` y `npm run test:unit`.
- [x] Compilación TypeScript sin errores (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T11:06:40Z
- [x] Rama creada: feat/T-090-github-actions-ci-workflow
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
