# Features implementadas

> Actualizado automáticamente por `close-task.sh` al cerrar cada tarea.  
> **Fuente de verdad para sprint-planning Paso 2c** — si la feature ya aparece aquí, no entra al sprint.

⚠️ Las filas marcadas con `[manual]` fueron añadidas en el backfill inicial (sprints 00-10). Las siguientes se generan automáticamente.

| Feature | Tarea | Sprint | Archivos principales |
|---|---|---|---|
| Autenticación con Google | — | sprint-00 | src/contexts/AuthContext.tsx |
| Fichas Comunitarias (creación y visualización) | — | sprint-00 | src/components/fichas/, src/lib/services/comunidades.ts |
| Onboarding estilo chat + geocodificación | — | sprint-00 | src/components/onboarding/ |
| Manual Galáctico por pestañas | — | sprint-00 | src/components/manual/ |
| Panel de administración con búsqueda y filtro de manuales | — | sprint-00 | src/pages/AdminPage.tsx |
| appService.ts como fuente única para Firestore | — | sprint-00 | src/lib/services/ |
| Hooks de entidad: useProyectos, useTareas, useActas | — | sprint-00 | src/hooks/ |
| useEntityActions para mutaciones con toasts | — | sprint-00 | src/hooks/useEntityActions.ts |
| CRUD de tareas + kanban tareas y proyectos | — | sprint-00 | src/components/tareas/, src/pages/TareasPage.tsx |
| Asociación tareas-proyectos con progreso automático | — | sprint-00 | src/hooks/useProyectos.ts |
| Actas con estructura base y creación de tareas desde acuerdos | — | sprint-00 | src/components/actas/, src/pages/ActasPage.tsx |
| Dashboard Kanban de proyectos con borrado y deshacer | — | sprint-00 | src/pages/ProyectosPage.tsx |
| Calendario comunitario completo | — | sprint-00 | src/pages/CalendarioPage.tsx, src/components/calendario/ |
| Tablón de necesidades/ofertas | — | sprint-00 | src/pages/TabloPage.tsx |
| Comunidades v2: multi-membership, invitaciones, solicitudes, panel admin, selector | — | sprint-00 | src/contexts/ComunidadContext.tsx, src/lib/services/comunidades.ts |
| AuthGate reutilizable + persistencia cross-device + migration determinista | — | sprint-00 | src/components/auth/AuthGate.tsx |
| Marketplace de soberanía: catálogo, acuerdos, directorio global, cierre/feedback | — | sprint-00 | src/pages/MarketplacePage.tsx, src/lib/services/marketplace.ts |
| Pipeline de análisis estructurado (inteligencia colectiva) | — | sprint-00 | src/lib/services/ |
| Firestore Rules multi-comunidad con roles (admin/miembro/visitante) | T-001 | sprint-01 | firestore.rules |
| Eliminación de email admin hardcoded → campo role en Firestore | T-002 | sprint-01 | src/lib/services/comunidades.ts |
| Reactividad de sesión Google (onAuthStateChanged + React Router) | T-003 | sprint-01 | src/contexts/AuthContext.tsx |
| Validación de invitaciones normalizada (mayúsculas/minúsculas + feedback) | T-004 | sprint-01 | src/lib/services/comunidades.ts |
| Permisos Firestore para actas y fichas | T-005 | sprint-02 | firestore.rules |
| displayName/email/photoURL al unirse por invitación + redirección tras unirse | T-006 | sprint-02 | src/lib/services/comunidades.ts |
| Reglas Firestore para community_exits, profiles y fichas | T-007 | sprint-02 | firestore.rules |
| Restricción escritura en hilos y respuestas de propuestas/posts por comunidad | T-008 | sprint-02 | firestore.rules |
| Sincronización de perfil (displayName/photoURL) en Sidebar y miembros | T-009 | sprint-03 | src/components/layout/Sidebar.tsx, src/contexts/AuthContext.tsx |
| Validación onboarding/invitaciones/solicitudes sin bypass de membresía | T-010 | sprint-03 | firestore.rules |
| Selector de comunidad en parte superior del Sidebar | T-011 | sprint-03 | src/components/layout/Sidebar.tsx |
| Firebase Emulator con JDK 21+ y tests locales de Firestore rules | T-012 | sprint-03 | scripts/, firebase.json |
| Abstracción imports firebase/firestore en hooks hacia appService.ts | T-013 | sprint-04 | src/hooks/ |
| .limit(50) en todos los hooks de listas | T-014 | sprint-04 | src/hooks/ |
| Feedback diferenciado en códigos de invitación (caducado/agotado/inválido) | T-015 | sprint-04 | src/lib/services/comunidades.ts |
| Modularización appService.ts por dominio en src/lib/services/ | T-016 | sprint-04 | src/lib/services/ |
| Fix displayName vacío al re-entrar por invitación tras expulsión | T-017 | sprint-04 | src/lib/services/comunidades.ts |
| Backfill community_members: displayName/email/photoURL desde /users/{uid} | T-018 | sprint-05 | scripts/migrate-community-members.ts |
| Flujo S3 completo en PropuestaDetail: ResponseModal con 4 opciones | T-019 | sprint-05 | src/components/propuestas/ResponseModal.tsx, src/pages/PropuestaDetail.tsx |
| Gestión de objeciones con hilos de aclaración (Solo Dudas) | T-020 | sprint-05 | src/components/propuestas/ClarificationThread.tsx |
| Hook genérico useFirestoreCollection (elimina patrón loading/error duplicado) | T-021 | sprint-05 | src/hooks/useFirestoreCollection.ts |
| Permisos edición de eventos en Calendario: restringir a autor o admin | T-025 | sprint-06 | firestore.rules, src/components/calendario/ |
| Badge contador solicitudes proyectos pendientes en sidebar | T-024 | sprint-06 | src/components/layout/Sidebar.tsx |
| Directorio de decisiones con filtros por estado y badge "requiere tu atención" | T-027 | sprint-06 | src/pages/PropuestasView.tsx |
| Vista de detalle de Acuerdo en Marketplace: panel/modal con historial y CTA enmienda | T-026 | sprint-06 | src/components/marketplace/AcuerdoDetail.tsx |
| Limpieza contexto comunidad activa al logout | T-028 | sprint-07 | src/contexts/ComunidadContext.tsx |
| Validación de communityId en todos los hooks de entidad | T-029 | sprint-07 | src/hooks/ |
| Fix bug carga infinita en Gobernanza (perfil Abián) | T-030 | sprint-07 | src/pages/PropuestaDetail.tsx |
| Máquina de estados S3: transición a integrando manual; automático a en_objeciones | T-031 | sprint-07 | src/lib/services/propuestas.ts |
| Fix fallback hardcodeado currentCommunityId a 'arteara' en ComunidadContext | T-032 | sprint-08 | src/contexts/ComunidadContext.tsx |
| Migración modelo datos Tríada Comunitaria (ofrendas, saberes, necesidades) | T-023 | sprint-08 | src/lib/services/_types.ts, src/lib/services/comunidades.ts |
| Sala de deliberación con timeline S3 y visualización de participantes | T-033 | sprint-08 | src/components/propuestas/SalaDeliberacion.tsx |
| Modal inline con 4 opciones de respuesta S3 y flujos aclaración/objeción | T-034 | sprint-08 | src/components/propuestas/ResponseModal.tsx |
| Onboarding animado (WelcomeHeroSections, GovernanceFlowAnimation) | T-035 | sprint-09 | src/components/onboarding/ |
| PasaporteVisual perfil usuario | T-035 | sprint-09 | src/components/perfil/ |
| SectionHelp contextual (integrado en 4 páginas) | T-035 | sprint-09 | src/components/ui/SectionHelp.tsx |
| Tríada completa (ofrendas, necesidades, saberes) + TagArrayEditor | T-036 | sprint-09 | src/components/triada/, src/components/ui/TagArrayEditor.tsx |
| Persistencia offline IndexedDB base | T-037 | sprint-09 | src/lib/firebase.ts |
| Bug Tríada: ofrendas y necesidades no persisten via TagArrayEditor (fix) | T-038 | sprint-10 | src/components/ui/TagArrayEditor.tsx, src/lib/services/comunidades.ts |
| Vista detalle Acuerdo Marketplace (panel/modal, historial, CTA enmienda) | T-039 | sprint-10 | src/components/marketplace/AcuerdoDetail.tsx |
| Indicador visual online/offline y cambios pendientes de subir | T-040 | sprint-10 | src/components/ui/OfflineIndicator.tsx |
| Estandarización cabeceras PageHeader y layout PageContainer | T-041 | sprint-10 | src/components/layout/PageHeader.tsx, src/components/layout/PageContainer.tsx |
| Tarea: — Despliegue Kanarii en `kanarii.romensuarez.com` con Firebase Hosting | T-042 | sprint-11 | — |
| Kin Maya Dreamspell: widget FichaView + inyección en Gemini | T-046 | sprint-11 | src/lib/kinMaya.ts, src/lib/gemini.ts, src/pages/FichaView.tsx |

| — Fix calendario vacío tras PageContainer + widget Kin Maya en cabecera | T-043 | sprint-11 | src/pages/CalendarioView.tsx |
| — Reducir usos de any en interfaces core (datosBrutos, perfilVisual, configuracion) con interfaces tipadas | T-044 | sprint-11 | — |
| — Estandarizar validación formularios con componente <FieldError /> reutilizable | T-045 | sprint-11 | — |
| — Conectar vía Tablón con mención pre-rellenada | T-054 | sprint-12 | src/components/CreatePostModal.tsx,src/pages/PasaporteComunitarioView.tsx,src/pages/Tablon.tsx |
| Tarea: Integrar Kin Maya de dos personas en generarAnalisisCruce | T-056 | sprint-13 | src/lib/gemini.ts,src/lib/kinMaya.ts |
| Task-057: Tagline oficial de Kanarii + actualizar copy bienvenida (index.html, WelcomeHeroSections, manifest) | T-057 | sprint-13 | src/components/onboarding/WelcomeHeroSections.tsx |
| Task-058: Notificaciones de menciones en Tablón — Opción A: campo menciones[] en post + listener en Sidebar para badge | T-058 | sprint-13 | src/components/Sidebar.tsx,src/components/ui/NotifBadge.tsx,src/hooks/useNotificaciones.ts |
| Task-059: Refactorizar generarAnalisisCruce → Capa 1 (JSON) + Capa 2 (Narrativa) | T-059 | sprint-14 | src/lib/gemini.ts,src/pages/CruceView.tsx |
| : Refactorizar generarManual → separar en generarResumenManual (JSON cacheado con hash) + generarSeccion (narrativa lazy por pestaña) | T-060 | sprint-14 | — |
| : PDF opcional del Manual | T-061 | sprint-14 | — |
| Tarea: Unificación y Auditoría de Superficies de Perfil y Manual de Usuario | T-062 | sprint-15 | — |
| Tarea: Estandarizar campo reason a purpose en colección /propuestas | T-065 | sprint-15 | src/components/CreateProposalWizard.tsx,src/components/PropuestaCard.tsx,src/components/PropuestaDetail.tsx |
| Task-066: UI: Badge visual acuerdo cálido diferenciado en PropuestaDetail | T-066 | sprint-15 | src/components/PropuestaDetail.tsx |
| Task-063: Rediseño Pasaporte Comunitario como landing social compartible | T-063 | sprint-15 | src/pages/PasaporteComunitarioView.tsx,src/components/perfil/PasaporteVisual.tsx |
| Task-064: Pasaporte Universal en /p/:uid — landing pública del miembro | T-064 | sprint-15 | src/pages/PasaporteUniversalView.tsx,src/lib/pasaporte.ts |
| Task-067: Crear sistema de design tokens en @theme (DRY de colores) | T-067 | sprint-15 | src/components/ui/EntityCard.tsx,src/index.css |
| Task-069: Sistema leído/no leído en acuerdos | T-069 | sprint-16 | src/App.tsx,src/components/BottomNav.tsx,src/components/Sidebar.tsx |
| Task-072: Contratos e Interfaces de Identidad, Auditoría y Contexto (`contracts.ts`) | T-072 | sprint-17 | src/lib/services/_core.ts,src/lib/services/contracts.ts |
| Task-073: Servicio de Identidad Vinculada Telegram & Token Efímero (`identities.ts`) | T-073 | sprint-17 | src/lib/services/identities.ts |
| Task-074: Servicio de Auditoría Inmutable por Canal & Origen (`audit.ts`) | T-074 | sprint-17 | src/lib/services/audit.ts |
| Task-075: Servicio de Acciones Pendientes y Confirmaciones (`pendingActions.ts`) | T-075 | sprint-17 | src/lib/services/pendingActions.ts |
| Task-077: Telegram Bot Adapter (`grammY`) con verificación de vínculo y botones InlineKeyboard | T-077 | sprint-18 | src/adapters/telegram/bot.ts,src/adapters/telegram/index.ts,src/adapters/telegram/middleware.ts |
| Task-078: MCP Adapter Server (herramientas de alto nivel consumiendo `src/lib/services/`) | T-078 | sprint-18 | src/adapters/mcp/index.ts,src/adapters/mcp/server.ts |
| Task-079: API Router HTTP/JSON & middleware de autenticación por token | T-079 | sprint-18 | src/adapters/http/auth.ts,src/adapters/http/index.ts,src/adapters/http/router.ts |
| Task-080: Documentación de Arquitectura de Agentes e instalación de ADR-024 | T-080 | sprint-18 | — |
| Task-081: Integration Test Suite End-to-End Multicanal (`tests/e2e-multichannel.test.ts`) | T-081 | sprint-19 | — |
| Task-082: Runner CLI de Simulación Interactiva Multicanal (`scripts/simulate-multichannel-flow.ts`) | T-082 | sprint-19 | — |
| Task-083: Hardening y Ajustes de Integración Multicanal | T-083 | sprint-19 | src/lib/services/audit.ts,src/lib/services/identities.ts,src/lib/services/pendingActions.ts |
| Task-084: Servidor Unificado Node.js (src/server.ts) | T-084 | sprint-20 | src/server.ts |
| Task-085: Dockerización de Producción Multi-etapa (Dockerfile + .dockerignore) | T-085 | sprint-20 | — |
| Task-086: Configuración para Coolify (docker-compose.yml + .env.example.coolify) | T-086 | sprint-20 | — |
| Task-087: Verificación de Despliegue y Hardening (SPA Fallback & Healthcheck) | T-087 | sprint-20 | src/adapters/http/router.ts,src/server.ts |
| Task-088: Configuración e Instalación de Vitest (vitest.config.ts) | T-088 | sprint-21 | — |
| Task-089: Suite Base de Tests Unitarios para Servicios Core (tests/unit/) | T-089 | sprint-21 | — |
| Task-090: GitHub Actions CI Workflow (.github/workflows/ci.yml) | T-090 | sprint-21 | — |
| Task-091: Verificación de CI Pipeline y Cobertura de Tests | T-091 | sprint-21 | — |
| Task File: — Confirmación Resiliente de Acciones Pendientes en Telegram | T-092 | sprint-22 | src/adapters/telegram/bot.ts,src/lib/services/contracts.ts,src/lib/services/pendingActions.ts |
| Task File: — Inyección de Rol Real en Telegram & Comandos de Negocio | T-093 | sprint-22 | src/adapters/telegram/bot.ts,src/adapters/telegram/middleware.ts |
| Task File: — Navegación de Identidad: Ruta /perfil + UserAvatarMenu + Limpieza de Navegación | T-097 | sprint-22 | src/App.tsx,src/components/BottomNav.tsx,src/components/Sidebar.tsx |
| Task File: — Refactor de Cabecera a TopBar Unificada con Slots de Acciones y Avatar | T-098 | sprint-22 | src/App.tsx,src/components/layout/Header.tsx,src/components/layout/TopBar.tsx |
