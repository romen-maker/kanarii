# Task-091: Verificación de CI Pipeline y Cobertura de Tests

## Objetivo
Instalar opcionalmente `@vitest/coverage-v8` para verificación de cobertura en local (`npm run test:coverage`), validar el correcto funcionamiento de toda la suite de unit tests y CI, y documentar la estrategia de verificación de PR en GitHub Actions.

## Contexto técnico
- Basado en `docs/sprints/sprint-21-research.md`.
- Añadir el script `"test:coverage": "vitest run --coverage"` en `package.json`.
- Instalar `@vitest/coverage-v8` en devDependencies si es necesario para el reporte V8 de cobertura.
- Ejecutar `npm run test:unit` y `npx tsc --noEmit` para garantizar un entorno 100% verde sin errores ni advertencias.

## Caja de archivos
Archivos autorizados para modificación:
- `package.json`
- `package-lock.json`

## Criterios de done
- [x] Script `"test:coverage": "vitest run --coverage"` habilitado en `package.json`.
- [x] Ejecución exitosa de `npm run test:unit` y `npm run test:coverage` con 100% afirmaciones superadas.
- [x] Compilación TypeScript sin errores (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T11:13:36Z
- [x] Rama creada: feat/T-091-verificacion-ci-cobertura
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
