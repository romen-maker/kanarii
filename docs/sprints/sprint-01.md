# Sprint 01 — 2026-05-25 → 2026-05-29

## Estado
🟢 Completado

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-001 | Implementar Firestore Rules reales alineadas con el modelo multi-comunidad y roles | L | ✅ Hecho | [task-001](file:///.agents/tasks/_archived/task-001.md) |
| T-002 | Eliminar email de admin hardcoded en `appService.ts` y usar campo `role` en Firestore | S | ✅ Hecho | [task-002](file:///.agents/tasks/_archived/task-002.md) |
| T-003 | Corregir reactividad de sesión con Google (onAuthStateChanged y propagación a React Router) | M | ✅ Hecho | [task-003](file:///.agents/tasks/_archived/task-003.md) |
| T-004 | Corregir validación de invitaciones (normalizar mayúsculas/minúsculas y feedback preciso) | S | ✅ Hecho | [task-004](file:///.agents/tasks/_archived/task-004.md) |
| T-005 | Asegurar permisos de lectura/escritura en propuestas, acuerdos, servicios, actas y fichas | M | 🟡 Parcial | [task-005](file:///.agents/tasks/_archived/task-005.md) |

## Notas de planning
* **Foco en seguridad y acceso:** Este sprint sienta las bases de seguridad necesarias antes de desplegar más componentes en producción. 
* **Firestore Rules:** El mayor reto es asegurar que las reglas multi-comunidad funcionen bien sin interferir con la UX actual de la app.
* **Sesión e invitación:** Soluciona las dos mayores fricciones reportadas en el flujo de entrada de miembros.
* ⚠️ **Nota administrativa:** Los cambios de `T-001` fueron commiteados directamente en la rama `main` por error en una sesión previa no cerrada (`task-001`).

## Nota de cierre (23/05/2026)
Sesión de cierre de Sprint 01 parcial ejecutada con éxito. Las tareas core de reactividad de auth (T-003) y roles (T-002) han sido auditadas e integradas. La normalización de invitaciones (T-004) se encuentra resuelta en el código existente. Los pendientes de T-005 (actas, fichas y displayName en community_members) pasan a considerarse deuda técnica y se gestionarán en el roadmap para futuros sprints.


