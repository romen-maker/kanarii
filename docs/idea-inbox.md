# Idea Inbox 💡

Captura rápida de ideas, mejoras y bugs detectados entre sprints.
Este archivo es procesado durante el sprint planning para convertir entradas en tareas formales o descartarlas.

---

## Pendiente de procesar

### [BUG] Redirect a comunidad tras usar código de invitación
- **Detectado**: 23/05/2026 — validación manual del flujo de invitaciones
- **Comportamiento actual**: tras usar un código válido e incorporarse, el usuario no es redirigido automáticamente a la comunidad.
- **Comportamiento esperado**: `usar código → membresía creada → navigate(/c/${communityId})`
- **Impacto**: UX — el nuevo miembro no sabe que ya pertenece a la comunidad ni puede acceder a sus datos inmediatamente.
- **Prioridad sugerida**: ALTO
- **Área**: componente de validación de invitación (probablemente `src/pages` o `src/components`)

### [BUG] Lista de miembros muestra email en lugar de nombre
- **Detectado**: 23/05/2026 — captura de pantalla comunidad "La Alpispa"
- **Comportamiento actual**: en la pestaña Miembros, el campo de nombre muestra el email (`romenusabo3@gm...`, `casacuevaruraltre...`).
- **Causa probable**: el documento `community_member` se crea al aceptar la invitación sin copiar `displayName` desde el perfil de usuario (`users/{uid}`).
- **Impacto**: visual + confianza — la identidad de los miembros no es legible.
- **Prioridad sugerida**: ALTO
- **Área**: función de creación de `community_member` al procesar invitación. Ver también deuda de T-005 en `.agents/tasks/_archived/task-005.md`.
- **Fix relacionado en roadmap**: "Migrar `community_member` docs antiguos para rellenar `displayName`/`email`/`photoURL`"

---

## Procesadas

_Vacío — primera versión de este archivo._
