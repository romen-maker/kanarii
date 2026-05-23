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

---

## 🚨 Seguridad y confianza
- [ ] [CRÍTICO] Completar permisos lectura/escritura en `actas` y `fichas` (deuda T-005).
- [ ] [CRÍTICO] Rellenar `displayName`/`email`/`photoURL` en `community_member` al unirse vía invitación (deuda T-005).
- [ ] [CRÍTICO] Validar que onboarding, invitaciones y solicitudes no permitan bypass de membresía.
- [ ] [CRÍTICO] Añadir reglas Firestore para colecciones `community_exits`, `profiles`, `fichas` (detectado en auditoría QwenCoder 23/05/2026).
- [ ] [ALTO] Corregir permisos de subcolecciones `hilos` y `respuestas` en `/propuestas` y `/posts` — actualmente cualquier usuario autenticado puede escribir en subcolecciones de comunidades ajenas.

## 🐛 Bugs de acceso y flujo
- [ ] [ALTO] Redirigir directamente a la comunidad tras usar un código de invitación (detectado 23/05/2026 — actualmente no redirige).
- [ ] [ALTO] Lista de miembros muestra email en lugar de nombre (detectado 23/05/2026 — `displayName` vacío en `community_member` creado vía invitación).
- [ ] [ALTO] Mejorar feedback error códigos invitación: diferenciar "caducado", "agotado", "inválido".

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
- [ ] [ALTO] Añadir `.limit(50)` a todos los hooks de listas.
- [ ] [MEDIO] Implementar paginación cursor-based (`startAfter`).
- [ ] [BAJO] Crear índices compuestos en Firebase Console.

## 🧹 Calidad interna y DRY
- [ ] [ALTO] Migrar `community_member` docs antiguos para rellenar `displayName`/`email`/`photoURL`.
- [ ] [MEDIO] Crear hook genérico `useFirestoreCollection`.
- [ ] [MEDIO] Reducir usos de `any` en interfaces.
- [ ] [MEDIO] Auditar listeners, queries y lógica duplicada.
- [ ] [MEDIO] Revisar consistencia de toasts vs validación inline.
- [ ] [BAJO] Crear `dateUtils.ts` para centralizar formateo de fechas.
- [ ] [BAJO] Script de sanity check para contadores desnormalizados.

---

## 🎨 Coherencia visual transversal
- [ ] [MEDIO] Crear componentes `<FieldError />`, `<PageHeader />`, `<PageContainer />`.
- [ ] [MEDIO] Unificar patrón de apertura en tarjetas.
- [ ] [MEDIO] Definir criterio Modal vs Drawer.
- [ ] [BAJO] Crear `TourStepLayout.tsx`.
- [ ] [MEDIO] Integrar 8 animaciones educativas.

---

## 🌍 Siguiente expansión funcional
- [ ] [MEDIO] Admin Dashboard global con filtros.
- [ ] [MEDIO] Mejorar UI de aceptación/rechazo colaboradores.
- [ ] [MEDIO] Gestión de visitas / recién llegados.
- [ ] [MEDIO] Registro de contribuciones y balance visible.
- [ ] [MEDIO] Sistema leído/no leído en acuerdos: campo `vistoPorSolicitante`.
- [ ] [MEDIO] Sistema de badges reactivos para Gobernanza.
- [ ] [MEDIO] Hook genérico `usePendingActionsCount`.

## 📱 Infraestructura offline
- [ ] [ALTO] Activar persistencia offline de Firestore (IndexedDB).
- [ ] [MEDIO] Indicador de cambios pendientes de subir.
- [ ] [POST-MVP] Operaciones IA en diferido.

---

*Última actualización verificada contra código: 23 de mayo de 2026*
