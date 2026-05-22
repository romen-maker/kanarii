    # Roadmap Kanarii 🌿

Solo contiene trabajo pendiente. Historial completado → `docs/sprints/sprint-00-historico.md`.

## Criterios de prioridad
- **[CRÍTICO]** Bloquea seguridad, confianza básica o flujos core.
- **[ALTO]** Desbloquea crecimiento, gobernanza o uso semanal real.
- **[MEDIO]** Mejora consistencia, UX o mantenibilidad sin bloquear operación.
- **[BAJO]** Calidad diferida sin impacto operativo inmediato.
- **[POST-MVP]** Valioso, pero no urgente para el uso actual.

---

## 🚨 Seguridad y confianza
- [ ] [CRÍTICO] Implementar Firestore Rules reales alineadas con el modelo multi-comunidad y roles.
- [ ] [CRÍTICO] Revisar permisos de lectura/escritura en propuestas, acuerdos, servicios, actas y fichas.
- [ ] [CRÍTICO] Validar que onboarding, invitaciones y solicitudes no permitan bypass de membresía.
- [ ] [CRÍTICO] Eliminar email hardcoded de admin en `appService.ts` (líneas 148, 154, 1887). Reemplazar con campo `role` en Firestore.
- [ ] [CRÍTICO] Corregir reactividad en inicio de sesión con Google (falta propagación en `onAuthStateChanged` → React Router tras popup/redirect).

## 🐛 Bugs de acceso y flujo
- [ ] [ALTO] Auditar validación de códigos de invitación: diferenciar "código inválido" de "ya eres miembro" con feedback preciso.
- [ ] [ALTO] Resolver conflicto mayúsculas/minúsculas en input de código de invitación (normalizar a `.toLowerCase()` antes de comparar).
- [ ] [ALTO] Completar interacción detallada en tarjetas del Marketplace (clic en tarjeta de otro miembro no abre detalle ni modal).

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
- [ ] [ALTO] Migrar `community_member` docs antiguos para rellenar `displayName`/`email`/`photoURL` desde `/users/{uid}` (muestran email en lugar de nombre en fichas públicas). Script one-shot o Cloud Function triggered on read si `displayName` vacío.
- [ ] [MEDIO] Crear hook genérico `useFirestoreCollection` para eliminar patrón `loading/error` duplicado en 10+ hooks.
- [ ] [MEDIO] Reducir usos de `any`: priorizar `datosBrutos`, `perfilVisual` y `configuracion` con interfaces específicas.
- [ ] [MEDIO] Auditar listeners, queries y lógica duplicada en Sidebar/BottomNav.
- [ ] [MEDIO] Revisar consistencia de toasts vs validación inline.
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

*Última actualización: 22 May 2026*
