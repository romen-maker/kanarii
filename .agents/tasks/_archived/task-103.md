# Task-103: Mensajes de Estado y Onboarding Simplificado en Telegram Bot (`UNLINKED` / `TOKEN_EXPIRED` / `LINKED`)

## Objetivo
Implementar las respuestas de interfaz y mensajes del bot de Telegram según el estado derivado del contexto: respuesta única de onboarding no vinculado (`MSG_UNLINKED`), feedback para token caducado (`MSG_TOKEN_EXPIRED`), respuesta para usuario vinculado sin comunidad activa y comandos de consulta (`/comunidad`, `/tareas`, `/acuerdos`) para miembros activos.

## Contexto técnico
- `ExecutionCtx` ya inyecta de forma determinista la identidad vinculada (`userId`) y la comunidad resuelta (`communityId`).
- El bot debe usar un middleware global de guardias para responder con `MSG_UNLINKED` si no hay vinculación activa, o con el aviso de falta de comunidad si `communityId` es vacío.
- Se debe capturar la excepción `TOKEN_EXPIRED` en el comando `/start TOKEN` para mostrar una guía clara de cómo refrescar el código en el perfil web.
- Información de soporte en `docs/sprints/sprint-23-research.md`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/adapters/telegram/bot.ts`

## Criterios de done
- [ ] Implementar mensaje `MSG_UNLINKED` con guía clara y deep link a la Web App para interacciones sin cuenta enlazada
- [ ] Capturar `TOKEN_EXPIRED` en el handler `/start TOKEN` para responder `MSG_TOKEN_EXPIRED` con instrucción de re-generación
- [ ] Diferenciar respuesta cuando la cuenta está vinculada pero carece de comunidad activa
- [ ] npx tsc --noEmit sin errores y tests unitarios pasando

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-31T11:42:40Z
- [x] Rama creada: feat/T-103-telegram-bot-status-messages
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
