# Task-088: Configuración e Instalación de Vitest (vitest.config.ts)

## Objetivo
Instalar y configurar `vitest` como runner de unit tests ultrarrápido (`vitest.config.ts`) aislado en entorno Node, estableciendo las reglas de inclusión de `tests/unit/**/*.test.ts` y añadiendo el script `test:unit` en `package.json`.

## Contexto técnico
- Basado en `docs/sprints/sprint-21-research.md`.
- Instalar `vitest` en `devDependencies`.
- `vitest.config.ts` debe:
  - Configurar `test.environment = 'node'`.
  - Habilitar `test.globals = true`.
  - Aplicar `restoreMocks: true`, `clearMocks: true` y `mockReset: true` para prevenir fugas de estado entre pruebas.
  - Definir `include: ['tests/unit/**/*.test.ts']` y `exclude: ['tests/e2e/**', 'dist/**', 'node_modules/**']`.
- Añadir el script `"test:unit": "vitest run"` a `package.json`.

## Caja de archivos
Archivos autorizados para modificación/creación:
- `vitest.config.ts`
- `package.json`

## Criterios de done
- [x] Creado `vitest.config.ts` con la configuración optimizada para unit tests en entorno Node.
- [x] Instalado `vitest` en `devDependencies` y script `"test:unit": "vitest run"` añadido en `package.json`.
- [x] Compilación TypeScript sin errores (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T11:00:32Z
- [x] Rama creada: feat/T-088-configuracion-vitest
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
