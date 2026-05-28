# Sprint 00 — Histórico consolidado

**Fecha de consolidación:** 2026-05-22  
**Propósito:** dejar registrada la historia anterior al sistema formal de sprints semanales.

## Completado antes del sistema de sprints

### Base del producto
- [x] Autenticación con Google.
- [x] Creación y visualización de Fichas Comunitarias.
- [x] Onboarding estilo chat.
- [x] Generación del Manual Galáctico por pestañas.
- [x] Panel de administración con búsqueda, filtro y gestión de manuales.
- [x] Geocodificación integrada en onboarding.

### Refactorización de arquitectura
- [x] `appService.ts` como fuente única para Firestore.
- [x] Hooks de entidad: `useProyectos`, `useTareas`, `useActas`.
- [x] `useEntityActions` para mutaciones con toasts.
- [x] Reglas persistentes de arquitectura.
- [x] Migración de vistas clave a servicios y hooks.
- [x] Sustitución de `alert()` por `useToast`.
- [x] Extracción de modales inline.
- [x] `EntityCard` aplicado transversalmente.
- [x] Refactor final de `AuthContext.tsx` para dejar de usar Firestore directo.

### App operativa mínima
- [x] CRUD de tareas.
- [x] Asociación tareas-proyectos con progreso automático.
- [x] Feedback UI con toasts.
- [x] Kanban de tareas y proyectos.
- [x] Actas con estructura base y creación de tareas desde acuerdos.
- [x] Navegación e histórico de actas.
- [x] Dashboard Kanban de proyectos.
- [x] Borrado con deshacer para proyectos.

### Inteligencia colectiva y social ya completada
- [x] Pipeline de análisis estructurado.
- [x] Calendario comunitario completo.
- [x] Tablón de necesidades/ofertas.
- [x] Comunidades v2: multi-membership, invitaciones, solicitudes, panel admin, selector de comunidad y flujo de rechazo estructurado.
- [x] AuthGate reutilizable, persistencia cross-device y migration determinista.
- [x] Marketplace de soberanía con catálogo, acuerdos, directorio global y cierre/feedback.

## Nota
Este archivo no sustituye `CHANGELOG.md`. Su función es histórica y funcional: capturar qué capacidades del producto ya existían antes de empezar los sprints formales.
