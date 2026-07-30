# Task-082: Runner CLI de Simulación Interactiva Multicanal (`scripts/simulate-multichannel-flow.ts`)

## Objetivo
Implementar un runner interactivo CLI en `scripts/simulate-multichannel-flow.ts` (ejecutable con `npx tsx scripts/simulate-multichannel-flow.ts`) que permita a desarrolladores simular interactivamente el flujo multicanal en directo (identidad Telegram, disparo de PendingAction, confirmación de 2 pasos y visualización de audit log).

## Contexto técnico
- El script guía al usuario paso a paso por consola:
  1. Genera e imprime el token de 6 caracteres.
  2. Simula la recepción de `/start bind_TOKEN` en Telegram y vincula la identidad.
  3. Crea una acción pendiente de confirmación (`PendingAction`) con InlineKeyboard interactivo simulado.
  4. Permite al desarrollador confirmar o cancelar la acción desde consola y muestra la mutación de estado en tiempo real.
  5. Imprime una tabla o JSON formateado con el registro de auditoría inmutable resultante en `/audit_logs`.

## Caja de archivos
Archivos autorizados para modificación:
- `scripts/simulate-multichannel-flow.ts`

## Criterios de done
- [x] Creado `scripts/simulate-multichannel-flow.ts` como herramienta visual de depuración/demostración por consola.
- [x] Ejecución limpia por consola sin excepciones no capturadas.
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T09:09:42Z
- [x] Rama creada: feat/T-082-runner-cli-simulacion
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
