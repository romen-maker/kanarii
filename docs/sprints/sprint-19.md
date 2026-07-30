# Sprint 19 — 26/06/2026 → 30/06/2026: Verificación End-to-End & Validación de la Arquitectura Multicanal

## Estado
🟡 En curso

## Objetivo del Sprint
Validar funcionalmente el flujo real end-to-end de la arquitectura multicanal (Sprint 17 & Sprint 18) mediante una suite de pruebas de integración y un runner interactivo CLI, verificando la vinculación de identidad en Telegram, el ciclo de confirmación de `PendingAction` de 2 pasos y la trazabilidad inmutable en `/audit_logs`.

## Flujo Funcional Objetivo
1. **Identidad**: Generar token efímero y vincular cuenta Telegram (`pending` -> `linked`).
2. **Disparo de Acción**: Crear una `PendingAction` con TTL de 15 min desde un canal externo.
3. **Confirmación**: Validar token y confirmar la acción de 2 pasos (`pending` -> `confirmed`).
4. **Auditoría**: Verificar que `/audit_logs` contiene la traza inmutable completa (`channel`, `agentId`, `sourceAction`, `status: 'success'`).

## Principios del Sprint
1. **Foco Exclusivo en Verificación**: No añadir nuevos canales, vistas de UI ni refactors.
2. **Validación Real y Medible**: El éxito del sprint se demuestra mediante scripts y tests ejecutables.
3. **Hardening Mínimo Necesario**: Solo aplicar parches si la prueba E2E detecta fricción o errores en el flujo.

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-081 | Integration Test Suite End-to-End Multicanal (`tests/e2e-multichannel.test.ts`) | M | ⬜ Pendiente | — |
| T-082 | Runner CLI de Simulación Interactiva Multicanal (`scripts/simulate-multichannel-flow.ts`) | M | ⬜ Pendiente | — |
| T-083 | Hardening y Ajustes de Integración Multicanal | S | ⬜ Pendiente | — |

## Lo que se deja Fuera Explícitamente
- ❌ Nuevas superficies de UI en la Web App.
- ❌ Nuevos canales de transporte (Discord/WhatsApp).
- ❌ Ampliaciones de dominio o herramientas MCP adicionales.

## Criterio de Éxito Medible
- Superar el 100% de las afirmaciones en `npm run test:e2e-multichannel` sin errores de compilación (`npx tsc --noEmit`).
