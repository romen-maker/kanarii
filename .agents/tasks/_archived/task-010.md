# Task-010: Validar que onboarding, invitaciones y solicitudes no permitan bypass de membresía en firestore.rules

## Objetivo
Asegurar que las reglas de seguridad de Firestore (`firestore.rules`) validen correctamente los flujos de onboarding, invitaciones y solicitudes, impidiendo que cualquier usuario salte los controles de membresía correspondientes.

## Contexto técnico
- El archivo de reglas de seguridad es `firestore.rules` en la raíz.
- Se debe validar que los documentos creados o modificados en las colecciones/subcolecciones de membresía (onboarding, invitaciones, solicitudes) sigan un flujo seguro y no permitan el acceso o creación no autorizados.

## Caja de archivos
Archivos autorizados para modificación:
- `firestore.rules`
- `src/lib/appService.ts` (solo para añadir `codigoInvitacion` en `useInvitacion`)

## Criterios de done
- [x] Revisar y corregir reglas para la creación/modificación de solicitudes de membresía en comunidades.
- [x] Revisar y corregir reglas para el proceso de onboarding e invitaciones de usuarios.
- [x] Verificar que no sea posible crear membresías activas falsas saltándose el flujo de aprobación/invitación.
- [x] Asegurar que las reglas compilen y se puedan desplegar/testear correctamente.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-26T08:25:35+01:00
- [x] Rama creada: feat/T-010-rules-membership-bypass
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
