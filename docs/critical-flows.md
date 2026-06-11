# Flujos Críticos de Kanarii

Documento vivo que mapea los flujos críticos del sistema con sus
casos de borde conocidos y cobertura de tests actual.

**Convención de estado:**
- ✅ Cubierto — existe test automatizado
- 🟡 Parcial — test existe pero no cubre todos los casos de borde
- ⬜ Pendiente — sin cobertura automatizada

---

## F-001 — Registro y creación de membresía

**Happy path:** Usuario se registra → completa onboarding → se une a
comunidad → documento `community_members/{communityId}_{uid}` se crea
con todos los campos obligatorios.

**Campos obligatorios en community_members:**
`userId`, `communityId`, `rol`, `nombre`, `displayName`, `email`,
`estado`, `joinedAt`, `creadoEn`

**Casos de borde conocidos:**
- Usuario se une sin haber completado el perfil → `nombre` vacío
  *(Bug detectado 2026-06-11: Abián en arteara — resuelto con fallback
  reactivo en getMemberName + patch manual del documento)*
- Usuario con proveedor OAuth sin displayName

**Cobertura:** ⬜ Pendiente
**Archivo de test propuesto:** `tests/flows/F-001-membership.test.ts`

---

## F-002 — Provider en Marketplace muestra su nombre

**Happy path:** Miembro crea servicio → aparece en el Marketplace con
su nombre visible, no con el fallback 'Miembro'.

**Dependencias:** `getMemberName` resuelve correctamente desde
`community_members`, con fallback reactivo a `/profiles/{uid}`.

**Casos de borde conocidos:**
- Documento `community_members` sin campo `nombre` → fallback a
  `/profiles` *(Bug detectado 2026-06-11 — resuelto con caché reactiva)*
- Miembro de otra comunidad ofreciendo servicio en comunidad actual
- Cambio de comunidad activa con caché de nombres sucia
  *(Mitigado con reset de caché en useEffect por communityId)*

**Cobertura:** ⬜ Pendiente
**Archivo de test propuesto:** `tests/flows/F-002-marketplace-nombre.test.ts`

---

## F-003 — Admin global opera en cualquier comunidad

**Happy path:** Usuario con `role: 'admin'` en `/users/{uid}` puede
leer, crear, actualizar y borrar en cualquier colección de gestión
sin necesitar membresía local en la comunidad.

**Colecciones cubiertas por isGlobalAdmin():**
`solicitudes`, `invitaciones`, `community_members`, `joinRequests`,
`acuerdos`, `actas`, `fichas`, `pasaportes`, `users`, `profiles`,
`community_exits`

**Casos de borde conocidos:**
- Admin global sin membresía local intenta suscribirse a listeners
  de subcolecciones → permission-denied silencioso
  *(Bug detectado 2026-06-11: listenSolicitudes para Romén — resuelto
  con isGlobalAdmin() en reglas + error handler en onSnapshot)*
- Nueva colección creada sin doble guarda `hasRole || isGlobalAdmin()`
  *(Mitigado con ADR-022 y checklist de revisión)*

**Cobertura:** 🟡 Parcial — `tests/firestore-rules.test.ts` cubre
algunas colecciones pero no todas las añadidas en 2026-06-11
**Archivo de test propuesto:** `tests/flows/F-003-global-admin-permisos.test.ts`

---

## F-004 — Solicitud de membresía → aprobación → acceso

**Happy path:** Visitante solicita unirse → admin aprueba → miembro
puede acceder a contenido restringido a `miembro`.

**Pasos del flujo:**
1. Visitante crea documento en `/comunidades/{id}/solicitudes`
2. Admin lee solicitud (cubierto por regla `hasRole + isGlobalAdmin`)
3. Admin actualiza estado a `aprobada`
4. Se crea documento en `community_members` con `rol: 'miembro'`
5. Miembro puede leer `/propuestas`, `/tareas`, `/acuerdos`

**Casos de borde conocidos:**
- Solicitud aprobada pero `community_members` no se crea →
  usuario queda en limbo
- Admin aprueba desde sesión de admin global sin membresía local →
  depende de isGlobalAdmin() en reglas de solicitudes

**Cobertura:** ⬜ Pendiente
**Archivo de test propuesto:** `tests/flows/F-004-solicitud-membresia.test.ts`

---

## F-005 — Propuesta → votación → cierre

**Happy path:** Miembro crea propuesta → otros miembros votan →
se alcanza quórum → propuesta se cierra con estado `aprobada` o
`rechazada`.

**Casos de borde conocidos:**
- Propuesta con campo `reason` (legacy) debe mostrarse correctamente
  *(Bug detectado 2026-06-11: campo renombrado a `purpose` con
  fallback `purpose ?? reason ?? ''` — resuelto en T-065)*
- Miembro que abandona la comunidad con votos activos
- Propuesta sin quórum definido

**Cobertura:** ⬜ Pendiente
**Archivo de test propuesto:** `tests/flows/F-005-propuesta-votacion.test.ts`

---

## Guía para añadir nuevos flujos

Al detectar un bug en producción relacionado con un flujo de usuario:

1. Busca si el flujo ya está documentado aquí.
2. Si existe, añade el caso de borde a la sección correspondiente
   con la fecha y referencia a la tarea que lo resolvió.
3. Si no existe, crea una nueva sección F-00N con el patrón anterior.
4. Actualiza el estado de cobertura.
5. Si el bug fue en producción, el test pasa automáticamente a
   prioridad alta en el siguiente sprint.

---

## Stack de tests recomendado

| Capa | Herramienta | Cuándo usarla |
|---|---|---|
| Reglas Firestore | Firebase Emulator + `@firebase/rules-unit-testing` | Permisos por rol y colección |
| Servicios y hooks | Vitest + mocks de Firestore | Lógica de negocio, fallbacks, mapeos |
| Flujos E2E críticos | Playwright | F-004 y F-005 (flujos multi-paso con UI) |

Los tests de reglas tienen el mayor ROI para Kanarii en este momento.
Empezar por completar `tests/firestore-rules.test.ts` con los casos
de F-003 antes de abordar tests E2E.
