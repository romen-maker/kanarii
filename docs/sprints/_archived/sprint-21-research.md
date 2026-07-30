# Research Sprint 21
> Fuente: Perplexity / Investigación del Usuario — 30/07/2026
> Tarea principal: CI Pipeline & Suite Base de Tests Unitarios con Vitest

## Hallazgos clave
- **Configuración de Vitest (`vitest.config.ts`)**:
  - Entorno `environment: 'node'` ideal para lógica de servicios y adaptadores.
  - Aislamiento de Mocks: `restoreMocks: true`, `clearMocks: true`, `mockReset: true` para prevenir fugar estado entre tests.
  - Inclusión/Exclusión: `include: ['tests/unit/**/*.test.ts']`, `exclude: ['tests/e2e/**', 'dist/**', 'node_modules/**']`.
  - Cobertura ligera V8 opcional: `provider: 'v8'`.
- **Pipeline CI GitHub Actions (`.github/workflows/ci.yml`)**:
  - Job único `ubuntu-latest` con Node 22.
  - Pasos: `actions/checkout@v5` -> `actions/setup-node@v6` con `cache: 'npm'` -> `npm ci` -> `npx tsc --noEmit` -> `npm run test:unit`.
- **Estrategia de Mocking para Servicios Core**:
  - Testear en prioridad `identities.ts`, `pendingActions.ts`, `audit.ts`.
  - Mockear el SDK de Firebase (`vi.mock('../src/lib/firebase', ...)` o `vi.mock('firebase/firestore', ...)`).

## Decisiones tomadas
- **Decisión:** Usar Vitest con entorno Node 22 para unit tests en `tests/unit/`.
- **Por qué:** Integración ultra rápida nativa con Vite y TypeScript, ejecución en <10 segundos por test run.
- **Constraint clave:** Separar estrictamente `tests/unit/**/*.test.ts` de `tests/e2e-multichannel.test.ts` para no ralentizar los unit tests en CI.

## Descartado
- Matriz multi-versión de Node en CI (ruido innecesario si solo soportamos Node 22).
- Cache manual de `node_modules` en CI (usar `cache: 'npm'` nativo de `actions/setup-node`).
- Snapshots para lógica de dominio.
