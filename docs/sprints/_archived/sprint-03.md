# Sprint 03 — 2026-06-01 → 2026-06-05

## Estado
✅ Completado

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-009 | Corregir sincronización y visualización del perfil de usuario (`displayName`/`email`/`photoURL`) en el Sidebar y miembros de la comunidad (Síntomas 1 y 2) | M | 🟢 Completado | [.agents/tasks/_archived/task-009.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-009.md) |
| T-010 | Validar que onboarding, invitaciones y solicitudes no permitan bypass de membresía en `firestore.rules` | M | 🟢 Completado | [.agents/tasks/task-010.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/task-010.md) |
| T-011 | Mejorar UX de navegación de comunidades: Mover selector de comunidad a la parte superior del sidebar (Síntoma 3) | S | 🟢 Completado | [.agents/tasks/_archived/task-011.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-011.md) |
| T-012 | Configurar Firebase Emulator con JDK 21+ y habilitar tests locales automatizados de Firestore rules | M | 🟢 Completado | [.agents/tasks/_archived/task-012.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-012.md) |

## Notas de planning
* **Foco en Consistencia del Perfil y UX:** Se resuelven las inconsistencias del `displayName` en Sidebar/miembros (multi-comunidad) y se mejora la jerarquía visual moviendo el selector de comunidad a la parte superior del Sidebar.
* **Seguridad y Automatización:** Se protegen los flujos de membresía de accesos no autorizados en Firestore Rules y se automatiza la suite de tests locales migrando a Firebase Emulator con JDK 21+.
