# Task File: T-093 — Inyección de Rol Real en Telegram & Comandos de Negocio

> **Sprint 22** | Tarea: `T-093` | Tamaño: **M** | Fecha: 2026-07-30  
> **Objetivo**: Resolver el rol real del usuario (`admin`, `miembro`, `visitante`) en el middleware `attachExecutionCtx()` consultando la colección `community_members` en lugar del valor estático 'member', e implementar los comandos de negocio `/comunidad`, `/tareas` y `/acuerdos` en el bot de Telegram.

---

## Estado
- [x] Creado por session-start
- [x] Plan presentado y aprobado
- [x] Ejecución completada
- [x] Tests pasando
- [x] Sesión cerrada correctamente

---

## Contexto técnico (Research Sprint 22)
- Modificar `src/adapters/telegram/middleware.ts` para consultar la identidad vinculada en `user_telegram_identities` y luego obtener la membresía en `community_members/{communityId_userId}`.
- Si no está vinculado o no tiene membresía activa, `userRole` se establece explícitamente como `'visitante'`.
- En `src/adapters/telegram/bot.ts`, registrar los comandos de negocio:
  - `/comunidad`: Muestra la comunidad activa del usuario y su rol.
  - `/tareas`: Obtiene y lista las tareas asociadas a la comunidad activa del usuario usando los servicios core (`src/lib/services/`).
  - `/acuerdos`: Lista los acuerdos de gobernanza / marketplace de la comunidad activa.
- Incluir guía explícita paso a paso para el usuario al final de la tarea de cómo probar y verificar el bot en su interfaz web y Telegram.

---

## Caja de archivos (Autorizados para modificación)
- `src/adapters/telegram/middleware.ts`
- `src/adapters/telegram/bot.ts`
- `tests/unit/telegram.test.ts`

---

## Criterios de Aceptación / Done
- [x] `attachExecutionCtx()` asigna en `ctx.exec.userRole` el rol dinámico obtenido desde `community_members` en lugar de hardcodear `'member'`, con fallback explícito `'visitante'`.
- [x] El comando `/comunidad` en Telegram responde con el slug de la comunidad activa y el rol real del usuario.
- [x] El comando `/tareas` obtiene y muestra las tareas de la comunidad activa formateadas en Markdown.
- [x] El comando `/acuerdos` obtiene y muestra los acuerdos de la comunidad activa formateados en Markdown.
- [x] Tests unitarios en `tests/unit/telegram.test.ts` validando la inyección de `ExecutionCtx` con rol dinámico y fallback `'visitante'`.
- [x] Instrucciones claras paso a paso entregadas al usuario para probar la vinculación y los comandos del bot en vivo.
