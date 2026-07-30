# Sprint 21 — 30/07/2026 → 03/08/2026: CI Pipeline & Suite Base de Tests Unitarios con Vitest

## Estado
🟡 En curso

## Objetivo del Sprint
Instalar y configurar Vitest como runner principal de unit tests (`vitest.config.ts`), construir la primera suite de pruebas unitarias aisladas para los servicios de negocio de Kanarii (`tests/unit/`), y crear la integración continua en GitHub Actions (`.github/workflows/ci.yml`) con validación de tipos, tests unitarios y cache de npm en un único job eficiente.

## Principios del Sprint
1. **Runner Ultra-Rápido con Vitest**: Utilizar Vitest en entorno `node` aprovechando la integración nativa con Vite y TypeScript.
2. **Aislamiento Estricto en Tests Unitarios**: Probar lógica de dominio y validaciones sin depender de instancias reales de Firestore o de red externa.
3. **CI Único y Rápido en GitHub Actions**: Un solo job en `ci.yml` ejecutando `npm ci`, `npx tsc --noEmit` y `npm run test:unit`.

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-088 | Configuración e Instalación de Vitest (`vitest.config.ts`) | M | ✅ Completada | [task-088.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/task-088.md) |
| T-089 | Suite Base de Tests Unitarios para Servicios Core (`tests/unit/`) | M | ⬜ Pendiente | — |
| T-090 | GitHub Actions CI Workflow (`.github/workflows/ci.yml`) | S | ⬜ Pendiente | — |
| T-091 | Verificación de CI Pipeline y Cobertura de Tests | S | ⬜ Pendiente | — |

## Lo que se deja Fuera Explícitamente
- ❌ Tests visuales de UI o capturas E2E con navegador.
- ❌ Múltiples jobs pesados o paralelos en CI.
- ❌ Coberturas obligatorias del 100% que generen tests frágiles acoplados a componentes visuales.

## Criterio de Éxito Medible
- Suite `npm run test:unit` ejecutándose con 100% tests pasados en local y en el workflow `.github/workflows/ci.yml` en menos de 60 segundos (`npx tsc --noEmit` con 0 errores).
