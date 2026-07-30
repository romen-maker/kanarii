# Task-089: Suite Base de Tests Unitarios para Servicios Core (tests/unit/)

## Objetivo
Construir una suite de tests unitarios pura, aislada y determinista en `tests/unit/` para proteger la lógica de dominio central de Kanarii en `identities.ts`, `pendingActions.ts` y `audit.ts` utilizando Vitest y mocks de Firebase.

## Contexto técnico
- Basado en `docs/sprints/sprint-21-research.md`.
- Crear tres archivos de pruebas unitarias en `tests/unit/`:
  1. `tests/unit/identities.test.ts`: Pruebas de normalización, mapeo y comprobaciones nulas defensivas al leer identidades de Telegram y usuarios.
  2. `tests/unit/pendingActions.test.ts`: Pruebas de cálculo seguro de expiración (Timestamp, Date, number), estado de acciones y generación de tokens.
  3. `tests/unit/audit.test.ts`: Pruebas de sanitización de campos `details` (prevención de undefined/null) y estructura de entradas de auditoría.
- Utilizar `vi.mock` sobre `src/lib/firebase` o `firebase/firestore` para garantizar cero dependencia de red o emulador.

## Caja de archivos
Archivos autorizados para creación:
- `tests/unit/identities.test.ts`
- `tests/unit/pendingActions.test.ts`
- `tests/unit/audit.test.ts`

## Criterios de done
- [x] Creados `tests/unit/identities.test.ts`, `tests/unit/pendingActions.test.ts` y `tests/unit/audit.test.ts`.
- [x] Ejecución de `npm run test:unit` superando el 100% de las pruebas unitarias.
- [x] Compilación TypeScript sin errores (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T11:02:42Z
- [x] Rama creada: feat/T-089-suite-unit-tests-core
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
