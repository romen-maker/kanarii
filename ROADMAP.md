# Roadmap Kanarii 🌿

Solo contiene trabajo pendiente REAL. Lo marcado ✅ ya está implementado.

## ✅ COMPLETADO (última verificación)
- [x] Interacción detallada Marketplace (ServicioDetailModal implementado)
- [x] Normalización lowercase en códigos invitación
- [x] PWA básica: manifest.json y Service Worker con caché mínima de index
- [x] Validación YA_ES_MIEMBRO vs código inválido (parcial)
- [x] Firestore Rules multi-comunidad con roles (Sprint 01 — T-001)
- [x] Eliminar email admin hardcoded, usar campo `role` en Firestore (Sprint 01 — T-002)
- [x] Reactividad de sesión Google → React Router (Sprint 01 — T-003)
- [x] Completar permisos lectura/escritura en `actas` y `fichas` en rules (Sprint 02 — T-005)
- [x] Rellenar `displayName`/`email`/`photoURL` al unirse por invitación (Sprint 02 — T-006)
- [x] Redirección directa tras unirse por invitación (Sprint 02 — T-006)
- [x] Reglas Firestore para colecciones `community_exits`, `profiles` y `fichas` (Sprint 02 — T-007)
- [x] Restringir subcolecciones `hilos` y `respuestas` de propuestas/posts (Sprint 02 — T-008)
- [x] Corregir sincronización y visualización del perfil de usuario (`displayName`/`email`/`photoURL`) en Sidebar y miembros (Sprint 03 — T-009)
- [x] Validar que onboarding, invitaciones y solicitudes no permitan bypass de membresía en `firestore.rules` (Sprint 03 — T-010)
- [x] Mejorar UX de navegación: mover selector de comunidad a parte superior del sidebar (Sprint 03 — T-011)
- [x] Configurar Firebase Emulator con JDK 21+ y tests locales automatizados de Firestore rules (Sprint 03 — T-012)
- [x] Validar `communityId` en `usePropuestaDetail` para evitar fuga de datos entre comunidades (Sprint 04 — T-013)
- [x] Abstraer imports directos de `firebase/firestore` en hooks hacia `appService.ts` (Sprint 04 — T-013)
- [x] Añadir `.limit(50)` a todos los hooks de listas (Sprint 04 — T-014)
- [x] Mejorar feedback error códigos invitación: diferenciar "caducado", "agotado", "inválido" (Sprint 04 — T-015)
- [x] Modularizar `appService.ts` por dominio en `src/lib/services/` (Sprint 04 — T-016)
- [x] Fix bug displayName vacío al re-entrar por invitación tras expulsión (Sprint 04 — T-017, ADR-008)
- [x] Migrar `community_member` docs antiguos para rellenar `displayName`/`email`/`photoURL` desde `/users/{uid}` (Sprint 05 — T-018)
- [x] Crear hook genérico `useFirestoreCollection` para eliminar patrón `loading/error` duplicado en 10+ hooks (Sprint 05 — T-021)
- [x] Permisos de edición de eventos en Calendario: solo el autor del evento o un admin pueden editarlo (Sprint 06 — T-025)
- [x] Limpiar contexto de comunidad activa al logout (Sprint 07 — T-028)
- [x] Generalizar validación de `communityId` a todos los hooks de entidad (Sprint 07 — T-029)
- [x] Fix bug carga infinita "Cargando deliberación" para el perfil de Abián en Gobernanza (Sprint 07 — T-030)
- [x] Máquina de estados S3: transición a integrando solo manual por autor; pase automático a en_objeciones (Sprint 07 — T-031)
- [x] Modelo de datos S3: colección /propuestas con subcolecciones /respuestas e /hilos
- [x] Campos críticos: activeObjectionsCount y responsibleIds[]
- [x] Wizard de creación sociocrática: tensión/driver → propuesta → ejecución y revisión
- [x] Sala de deliberación con timeline S3 y visualización de participantes
- [x] Modal inline con 4 opciones de respuesta S3 (Consentimiento, Preocupación, Duda, Objeción)
- [x] Flujo de registro de nueva comunidad en 4 pasos sin recarga
- [x] Post-creación: redirigir a /admin?tab=comunidad, crear /comunidades/{slug}, asignar fundador como adminUids
- [x] Vista pública /c/{slug} con perfil, mapa, tipo, capacidad, miembros visibles y CTA de acceso
- [x] Backend: campo reviewDate persistido en Firestore
- [x] Resto de animaciones (AsynchronousLogic, ComunidadesCirculos, ConsentElection, Cruce, DoubleLink, FichaRoles, Roles) implementadas en KanariiOnboarding
- [x] Infraestructura de tipos: interfaz TriadaComunitaria definida en _types.ts con arrays separados

---

## 🚨 Seguridad y confianza
- [x] Fix bug fallback de currentCommunityId a 'arteara' en cookies bloqueadas / Safari (T-032).

---

## 🎯 Foco activo

### 2.4 Gestión de Propuestas y Consentimiento (S3)
- [x] [ALTO] Directorio de decisiones con filtros por estado y badge "requiere tu atención" (Sprint 06 — T-027).
- [ ] [BAJO] UI: Badge visual "acuerdo cálido" diferenciado en PropuestaDetail
- [ ] [BAJO] Estandarizar campo `reason` a `purpose` en colección `/propuestas`.

### 2.6 Unificación de Superficies de Perfil (ADR-020)
- [ ] [ALTO] Unificar superficies de perfil y manual de usuario (Ficha, Expediente, Pasaporte, Cruce) con componente compartido `<ManualSeccionesViewer>` e integración híbrida (Sprint 15 — T-062).

### 2.5 Comunidades v2 — crecimiento (Completado)

---

## ⚡ Performance Firestore
- [ ] [MEDIO] Implementar paginación cursor-based (`startAfter`) para scroll infinito en listas largas.
- [ ] [BAJO] Crear índices compuestos en Firebase Console: `(communityId + fecha)`, `(communityId + updatedAt)`, `(communityId + inicio)`.
- [ ] [MEDIO] Revisar persistencia en Firestore de narrativas del Manual Galáctico si el almacenamiento gratuito supera el 60% (ADR-018).


## 🧹 Calidad interna y DRY
- [x] Bug: Tríada Comunitaria — ofrendas y necesidades no persisten via TagArrayEditor (Sprint 10 — T-038).
- [x] Migración datos Triada: script de migración de campo legacy saberes: string a arrays, actualizar UI onboarding (Sprint 13 — T-055).
- [x] Reducir usos de `any`: priorizar `datosBrutos`, `perfilVisual` y `configuracion` con interfaces específicas (Sprint 11 — T-044).
- [ ] [MEDIO] Auditar listeners, queries y lógica duplicada en Sidebar/BottomNav.
- [ ] [MEDIO] Revisar consistencia de toasts vs validación inline.
- [x] Fix botón "Cancelar" en CreateTareaModal deshabilitado offline (Sprint 12 — T-053).
- [ ] [BAJO] Consolidar scripts de auditoría duplicados en `scripts/` y extraer helpers a `firestore-helpers.ts` (AUDIT-06).
- [ ] [BAJO] AUDIT-07: Renombrar 20+ funciones de consulta para añadir sufijo Query (getUserFicha, getPosts, getServiciosByProvider, getAcuerdosByUser, getAppUserDoc, etc.)
- [ ] [BAJO] Marcar "Discrepancias Detectadas" como RESUELTO EN T-002 en `docs/firebase/current-data-model-audit.md` (AUDIT-03).
- [ ] [BAJO] Centralizar formateo de fechas en `dateUtils.ts` (7+ sitios duplicados).
- [ ] [BAJO] Memoizar transformación de fechas en `useEventos` (audit FIX-003).
- [ ] [BAJO] Optimizar `getMemberName` con Map en `useCommunityMembers` (audit FIX-004).
- [ ] [BAJO] Script de sanity check periódico para validar contadores desnormalizados (`activeObjectionsCount`, `totalResponsesCount`).

---

## 🎨 Coherencia visual transversal
- [x] Estandarizar validación de formularios con `<FieldError />` (Sprint 11 — T-045).
- [x] Estandarizar cabeceras con `<PageHeader />` (Sprint 10 — T-041).
- [x] Crear `<PageContainer />` para unificar layout y fondo cálido (`#FDFBF7`) (Sprint 10 — T-041).
- [ ] [MEDIO] Unificar patrón de apertura en tarjetas (Gobernanza: clic en tarjeta; Tareas: requiere lápiz — elegir uno).
- [ ] [MEDIO] Definir criterio coherente Modal vs Drawer y aplicarlo en toda la app.
- [ ] [BAJO] Crear `TourStepLayout.tsx` como wrapper común para onboarding (escape hatch, progress tracker, UI global). Resolver al añadir nueva animación al tour.
- [x] Animaciones onboarding: GovernanceFlowAnimation (A1) y WelcomeHeroSections (A7) implementadas (Sprint 09 — T-035)
- [x] Definir tagline oficial de Kanarii y actualizar copy de bienvenida (index.html, WelcomeHeroSections, manifest) (Sprint 13 — T-057).

---

## 🌍 Siguiente expansión funcional
- [ ] [ALTO] Rediseño del Pasaporte Comunitario de miembro y comunidad como landing social compartible (Sprint 15 — T-063).
- [ ] [MEDIO] Admin Dashboard global: refinar con filtros por miembro y estado (refinamiento de feature existente en Fase 1, no feature nueva).
- [ ] [MEDIO] Mejorar UI de aceptación/rechazo de colaboradores desde el detalle del proyecto.
- [ ] [MEDIO] Gestión de visitas / recién llegados con ficha simplificada.
- [ ] [MEDIO] Registro de contribuciones y balance visible.
- [ ] [MEDIO] Badge nav para solicitante en acuerdos (en progreso — incluir acuerdos donde eres `solicitanteId` con status cambiado).
- [ ] [MEDIO] Sistema leído/no leído en acuerdos: campo `vistoPorSolicitante: boolean`, batch update al entrar a "Mis Acuerdos", badge desaparece solo al ver el cambio.
- [ ] [MEDIO] Sistema de badges reactivos (patrón DRY) para Gobernanza (notificar miembros sin posición registrada en propuestas activas), Tareas (asignadas sin completar) y Calendario (eventos próximos sin confirmar). Considerar hook genérico `usePendingActionsCount(communityId, userId, query)`.
- [x] Pasaporte Comunitario completo (T-022): vista pública con Triada Comunitaria, OG tags dinámicos, flujo "Conectar" real y widget Kin Maya en PasaporteVisual (Sprint 12 — T-052).
- [x] Vista de detalle de Acuerdo en Marketplace: panel/modal con título, descripción, versión activa, historial y CTA de enmienda (Sprint 10 — T-039).
- [x] Contador de solicitudes de proyectos pendientes en sidebar para proyectos liderados por el usuario (Sprint 06 — T-024).
- [x] Kin Maya en CalendarioView: badge `kinDeHoy()` en cabecera (Sprint 11 — T-043)
- [x] Kin Maya en Cruce: cruzar Kines de dos personas en `generarAnalisisCruce` para detectar complementariedades y tensiones galácticas (Sprint 13 — T-056).
- [x] Kin Maya en PasaporteComunitario: widget idéntico al de FichaView (Sprint 12 — T-052).
- [x] Notificaciones de menciones en Tablón: campo `menciones[]` en post + listener en Sidebar para badge (Sprint 13 — T-058).

## 📱 Infraestructura offline
- [x] Activar persistencia offline de Firestore (IndexedDB) con estrategia segura (Sprint 09 — T-037).
- [x] Indicador visual de estado de conexión online/offline (Sprint 10 — T-040).
- [x] Indicador de cambios pendientes de subir (Sprint 10 — T-040).
- [x] PWA: Migrar a `vite-plugin-pwa` con `generateSW` + `registerType: 'autoUpdate'` (Sprint 12 — T-051).

## 🚀 Infraestructura y despliegue
- [x] ~~Despliegue Kanarii en Coolify~~ — **Descartado por decisión de producto** (2026-06-05). Firebase Hosting es suficiente para la fase actual (Sprint 11 — T-042 lo resolvió).
- [ ] [POST-MVP] Operaciones IA en diferido (encolado de "Generar manual" sin conexión).

---

## 🗄️ Backlog post-MVP

### Gobernanza y propuestas
- [ ] [POST-MVP] Notificaciones push para propuestas nuevas.
- [ ] [POST-MVP] Propuestas entre comunidades.
- [ ] [POST-MVP] IA para sugerir si una objeción es válida S3.
- [ ] [POST-MVP] Plantillas de propuestas predefinidas.

### Marketplace y acuerdos
- [ ] [POST-MVP] Flujo de negociación/contrapropuesta en acuerdos (diseñado: estados `contraoferta`, historial de términos, UI de aceptar/declinar/contraofertar).
- [ ] [POST-MVP] Marketplace global inter-comunidad con selector de comunidad (diseñado: eliminar filtro `communityId` en vista global, mantenerlo en vista por comunidad).
- [ ] [POST-MVP] Sistema de roles y estructura administrativa ampliada: `superadmin` (global) + admins por consentimiento de círculo, panel `/superadmin` con DAU/MAU y gestión de admins.

### Arquitectura y soberanía
- [ ] [POST-MVP] Abstraer llamadas a Gemini detrás de `ai-adapter.ts` con interfaz genérica (`generateText`, `generateEmbedding`, `streamText`). Documentar alternativas soberanas en `/docs/architecture.md` (Firestore→Supabase, Auth→Keycloak, Gemini→Ollama, Vector→pgvector).
- [ ] [POST-MVP] Callbacks memoizados en subscribers de hooks Firebase (audit FIX-005).
- [ ] [POST-MVP] Mecanismo de recuperación de errores de escritura (retry/queue para operaciones Firestore críticas).

### UX y producto
- [ ] [POST-MVP] Búsqueda global (Command+K) para proyectos, tareas y actas.
- [ ] [POST-MVP] Exportación de actas a PDF.
- [ ] [POST-MVP] Memoria colectiva con RAG y chat consultivo (stack fase 1: Genkit + Firestore Vector; fase 2: Ollama + pgvector).
- [ ] [POST-MVP] Notificaciones push para nuevas tareas asignadas.
- [ ] [POST-MVP] Editar y eliminar posts del Tablón desde la lista principal.
- [ ] [POST-MVP] Eliminar acta desde Gobernanza.
- [ ] [POST-MVP] Eliminar/desvincular miembro desde Administración.
- [ ] [POST-MVP] Revisar validación de descripción en Propuestas (hacerla obligatoria u opcional, revisar bug "error al procesar solicitud").
- [ ] [POST-MVP] Evaluar alternativa opcional a passwordless (email + contraseña) si Magic Link genera fricción.
- [ ] [POST-MVP] Verificar UX completo de onboarding con nuevas reglas de seguridad de Firestore.
- [ ] [POST-MVP] Mapa interactivo editable de zonas, recursos y puntos de interés.
- [ ] [MEDIO] Redirigir inicio de sidebar y bottomnav a `/` en vez de `/tour` y rediseñar landing (login vs no login).

---

Última actualización verificada contra código: 8 de junio de 2026 (sprint-planning sprint-15)
