# Roadmap Kanarii 🌿

Solo contiene trabajo pendiente REAL. Lo marcado ✅ ya está implementado.

## ✅ COMPLETADO (última verificación)
- [x] Interacción detallada Marketplace (ServicioDetailModal implementado)
- [x] Normalización lowercase en códigos invitación
- [x] PWA con manifest.json y Service Worker básico
- [x] Validación YA_ES_MIEMBRO vs código inválido (parcial)
- [x] Firestore Rules multi-comunidad con roles (Sprint 01 — T-001)
- [x] Eliminar email admin hardcoded, usar campo `role` en Firestore (Sprint 01 — T-002)
- [x] Reactividad de sesión Google → React Router (Sprint 01 — T-003)
- [x] Completar permisos lectura/escritura en `actas` y `fichas` en rules (Sprint 02 — T-005)
- [x] Rellenar `displayName`/`email`/`photoURL` al unirse por invitación (Sprint 02 — T-006)
- [x] Redirección directa tras unirse por invitación (Sprint 02 — T-006)
- [x] Reglas Firestore para colecciones `community_exits`, `profiles` y `fichas` (Sprint 02 — T-007)
- [x] Restringir subcolecciones `hilos` y `respuestas` de propuestas/posts (Sprint 02 — T-008)

---

## 🚨 Seguridad y confianza
- [ ] [CRÍTICO] Validar que onboarding, invitaciones y solicitudes no permitan bypass de membresía en `firestore.rules` (Sprint 03 — T-010).

## 🐛 Bugs de acceso y flujo
- [ ] [ALTO] Corregir sincronización y visualización del perfil de usuario (`displayName`/`email`/`photoURL`) en el Sidebar y miembros de la comunidad (Sprint 03 — T-009).
- [ ] [ALTO] Mejorar feedback error códigos invitación: diferenciar "caducado", "agotado", "inválido".
- [ ] [MEDIO] Mejorar UX de navegación de comunidades: Mover selector de comunidad a la parte superior del sidebar (Sprint 03 — T-011).

---

## 🎯 Foco activo

### 2.4 Gestión de Propuestas y Consentimiento (S3)
- [ ] [ALTO] Modelo de datos S3: colección `/propuestas` con subcolecciones `/respuestas` e `/hilos`.
- [ ] [ALTO] Campos críticos: `activeObjectionsCount` y `responsibleIds[]`.
- [ ] [ALTO] Wizard de creación sociocrática: tensión/driver → propuesta → ejecución y revisión.
- [ ] [ALTO] Directorio de decisiones con filtros por estado y badge "requiere tu atención".
- [ ] [ALTO] Sala de deliberación con timeline S3 y visualización de participantes.
- [ ] [ALTO] Modal inline con 4 opciones de respuesta S3 (Consentimiento ✅, Preocupación 💭, Duda ❓, Objeción ⛔).
- [ ] [ALTO] Gestión de dudas y objeciones con hilos de aclaración.
- [ ] [ALTO] Estados automáticos: borrador → abierta → en_objeciones → integrando → acordada / descartada.
- [ ] [MEDIO] Estado visual de "acuerdo cálido" con `reviewDate`.
- [ ] [BAJO] Estandarizar campo `reason` a `purpose` en colección `/propuestas`.

### 2.5 Comunidades v2 — crecimiento
- [ ] [ALTO] Flujo de registro de nueva comunidad en 4 pasos sin recarga (Identidad → Lugar → Cultura y acceso → Confirmación).
- [ ] [ALTO] Post-creación: redirigir a `/admin?tab=comunidad`, crear `/comunidades/{slug}` y asignar fundador como `adminUids`.
- [ ] [ALTO] Vista pública `/c/{slug}` con perfil, mapa, tipo, capacidad, miembros visibles y CTA de acceso.

---

## ⚡ Performance Firestore
- [ ] [ALTO] Añadir `.limit(50)` a todos los hooks de listas: `usePosts`, `useServicios`, `useAcuerdos`, `useEventos`, `usePropuestas`, `useActas`, `useFichas`, `useProyectos`, `useTareas`.
- [ ] [MEDIO] Implementar paginación cursor-based (`startAfter`) para scroll infinito en listas largas.
- [ ] [BAJO] Crear índices compuestos en Firebase Console: `(communityId + fecha)`, `(communityId + updatedAt)`, `(communityId + inicio)`.

## 🧹 Calidad interna y DRY
- [ ] [ALTO] Configurar Firebase Emulator con JDK 21+ y habilitar tests locales automatizados de Firestore rules (Sprint 03 — T-012).
- [ ] [ALTO] Modularizar `appService.ts` por dominio en `src/lib/services/` (auth, comunidades, propuestas, posts, eventos) (AUDIT-04/05).
- [ ] [ALTO] Migrar `community_member` docs antiguos para rellenar `displayName`/`email`/`photoURL` desde `/users/{uid}` (muestran email en lugar de nombre en fichas públicas). Script one-shot o Cloud Function triggered on read si `displayName` vacío.
- [ ] [MEDIO] Crear hook genérico `useFirestoreCollection` para eliminar patrón `loading/error` duplicado en 10+ hooks.
- [ ] [MEDIO] Reducir usos de `any`: priorizar `datosBrutos`, `perfilVisual` y `configuracion` con interfaces específicas.
- [ ] [MEDIO] Auditar listeners, queries y lógica duplicada en Sidebar/BottomNav.
- [ ] [MEDIO] Revisar consistencia de toasts vs validación inline.
- [ ] [BAJO] Consolidar scripts de auditoría duplicados en `scripts/` y extraer helpers a `firestore-helpers.ts` (AUDIT-06).
- [ ] [BAJO] Normalizar convenio de naming de funciones de consulta (sufijo `Query`) (AUDIT-07).
- [ ] [BAJO] Marcar "Discrepancias Detectadas" como RESUELTO EN T-002 en `docs/firebase/current-data-model-audit.md` (AUDIT-03).
- [ ] [BAJO] Centralizar formateo de fechas en `dateUtils.ts` (7+ sitios duplicados).
- [ ] [BAJO] Script de sanity check periódico para validar contadores desnormalizados (`activeObjectionsCount`, `totalResponsesCount`).

---

## 🎨 Coherencia visual transversal
- [ ] [MEDIO] Estandarizar validación de formularios con `<FieldError />`.
- [ ] [MEDIO] Estandarizar cabeceras con `<PageHeader />`.
- [ ] [MEDIO] Crear `<PageContainer />` para unificar layout y fondo cálido (`#FDFBF7`).
- [ ] [MEDIO] Unificar patrón de apertura en tarjetas (Gobernanza: clic en tarjeta; Tareas: requiere lápiz — elegir uno).
- [ ] [MEDIO] Definir criterio coherente Modal vs Drawer y aplicarlo en toda la app.
- [ ] [BAJO] Crear `TourStepLayout.tsx` como wrapper común para onboarding (escape hatch, progress tracker, UI global). Resolver al añadir nueva animación al tour.
- [ ] [MEDIO] Integrar 8 animaciones educativas (ver `docs/animated-onboarding.md`). Prioridad: `WelcomeHeroSections` (A7) y `GovernanceFlowAnimation` (A1, prompt listo).

---

## 🌍 Siguiente expansión funcional
- [ ] [MEDIO] Admin Dashboard global: refinar con filtros por miembro y estado (refinamiento de feature existente en Fase 1, no feature nueva).
- [ ] [MEDIO] Mejorar UI de aceptación/rechazo de colaboradores desde el detalle del proyecto.
- [ ] [MEDIO] Gestión de visitas / recién llegados con ficha simplificada.
- [ ] [MEDIO] Registro de contribuciones y balance visible.
- [ ] [MEDIO] Badge nav para solicitante en acuerdos (en progreso — incluir acuerdos donde eres `solicitanteId` con status cambiado).
- [ ] [MEDIO] Sistema leído/no leído en acuerdos: campo `vistoPorSolicitante: boolean`, batch update al entrar a "Mis Acuerdos", badge desaparece solo al ver el cambio.
- [ ] [MEDIO] Sistema de badges reactivos para Gobernanza: propuestas pendientes de voto, tensiones asignadas sin resolver, actas pendientes de ratificación. Considerar hook genérico `usePendingActionsCount(communityId, userId, query)`.

## 📱 Infraestructura offline
- [ ] [ALTO] Activar persistencia offline de Firestore (IndexedDB) con estrategia segura.
- [ ] [MEDIO] Indicador de cambios pendientes de subir.
- [ ] [MEDIO] PWA instalable con `manifest.json` y Service Workers.
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
- [ ] [POST-MVP] Mapa interactivo editable de zonas, recursos y puntos de interés.

---

*Última actualización verificada contra código: 23 de mayo de 2026*
