# Sprint 01 — 2026-05-25 → 2026-05-29

## Estado
🟡 En curso

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-001 | Implementar Firestore Rules reales alineadas con el modelo multi-comunidad y roles | L | ⬜ Pendiente | — |
| T-002 | Eliminar email de admin hardcoded en `appService.ts` y usar campo `role` en Firestore | S | ⬜ Pendiente | — |
| T-003 | Corregir reactividad de sesión con Google (onAuthStateChanged y propagación a React Router) | M | ⬜ Pendiente | — |
| T-004 | Corregir validación de invitaciones (normalizar mayúsculas/minúsculas y feedback preciso) | S | ⬜ Pendiente | — |
| T-005 | Asegurar permisos de lectura/escritura en propuestas, acuerdos, servicios, actas y fichas | M | ⬜ Pendiente | — |

## Notas de planning
* **Foco en seguridad y acceso:** Este sprint sienta las bases de seguridad necesarias antes de desplegar más componentes en producción. 
* **Firestore Rules:** El mayor reto es asegurar que las reglas multi-comunidad funcionen bien sin interferir con la UX actual de la app.
* **Sesión e invitación:** Soluciona las dos mayores fricciones reportadas en el flujo de entrada de miembros.
