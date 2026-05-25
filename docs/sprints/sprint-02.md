# Sprint 02 — 2026-05-25 → 2026-05-29

## Estado
🟡 En curso

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-005 | Asegurar permisos de lectura/escritura en actas y fichas en `firestore.rules` (deuda del Sprint 01) | M | ✅ Completado | — |
| T-006 | Rellenar `displayName`/`email`/`photoURL` al unirse por invitación y corregir redirección directa tras unirse (ver [ideas 24-05](file:///home/romen/Proyectos/kanarii/docs/idea-inbox/2026-05-24.md) para síntomas pendientes) | M | ✅ Completado | — |
| T-007 | Implementar reglas de seguridad Firestore para colecciones `community_exits`, `profiles` y `fichas` | S | ⬜ Pendiente | — |
| T-008 | Restringir escritura en subcolecciones `hilos` y `respuestas` de propuestas y posts por comunidad | M | ⬜ Pendiente | — |

## Notas de planning
* **Foco en Seguridad y Flujos de Crecimiento:** Este sprint completa la auditoría de seguridad crítica en Firestore iniciada en el sprint anterior y repara los bugs del flujo de invitaciones que afectan a la experiencia de usuario y la integridad de los datos.
* **Seguridad en subcolecciones:** Se implementarán restricciones para evitar el "cross-community write" en `/propuestas/hilos` y `/posts/respuestas`. Se requiere evaluar el trade-off de desnormalizar el `communityId` o realizar llamadas `get()` al documento padre en las reglas.
* **Consistencia de datos en Invitaciones:** Al redimir un código de invitación, se deben guardar correctamente los datos del usuario (`displayName`, `email`, `photoURL`) en el documento `community_member` correspondiente para evitar campos vacíos o emails en lugar de nombres en las listas de miembros.
