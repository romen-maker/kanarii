# Modelo de Datos — Kanarii

> Inventario completo de colecciones Firestore, relaciones y reglas de acceso.

## Colecciones Principales

### 1. `users` (Perfiles de Usuario)

**Propósito:** Documento de perfil por usuario autenticado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `uid` | string | ID del usuario (document ID) |
| `email` | string | Email principal |
| `displayName` | string? | Nombre visible |
| `role` | string | `'admin' \| 'member' \| 'user'` |
| `hasConsented` | boolean | Si aceptó términos/consentimiento |
| `communityIds` | string[] | IDs de comunidades a las que pertenece |
| `communityId` | string? | **DEPRECATED**: Usar `communityIds[0]` |
| `createdAt` | Timestamp | Fecha de creación |
| `updatedAt` | Timestamp | Última actualización |
| `lastLogin` | Timestamp | Último acceso |

**Reglas de acceso:**
- **Lectura:** Usuario propio + admins de su comunidad
- **Escritura:** Solo el usuario (salvo role, que lo cambia un admin)

---

### 2. `comunidades` (Comunidades)

**Propósito:** Registro de comunidades activas en la plataforma.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Slug único (ej: `arteara`) |
| `nombre` | string | Nombre oficial |
| `slug` | string | Identificador URL-safe |
| `descripcion` | string | Descripción corta (≤160 chars) |
| `manifiesto` | string? | Manifiesto en Markdown |
| `logoUrl` | string? | URL del logo |
| `creadoEn` | Timestamp | Fecha de creación |
| `esPublica` | boolean | Si es visible públicamente |
| `requiereAprobacion` | boolean | Si requiere aprobación para unirse |
| `adminUids` | string[] | UIDs de administradores |
| `plan` | string | `'free' \| 'pro'` |
| `tags` | string[]? | Tags descriptivos |
| `ubicacion.municipio` | string | Municipio |
| `ubicacion.region` | string | Región/Isla |
| `ubicacion.pais` | string | País |
| `ubicacion.lat` | number? | Latitud |
| `ubicacion.lng` | number? | Longitud |
| `tipo` | string | `'finca' \| 'ecoaldea' \| 'cohousing' \| 'urbano' \| 'nomada' \| 'otro'` |
| `capacidad` | number? | Capacidad estimada (personas) |

**Relaciones:**
- `1 → N` members (community_members)
- `1 → N` proyectos
- `1 → N` tareas
- `1 → N` actas
- `1 → N` eventos
- `1 → N` posts
- `1 → N` servicios
- `1 → N` acuerdos
- `1 → N` propuestas

**Reglas de acceso:**
- **Lectura:** Pública (todas las colecciones dentro de comunidad requieren membership)
- **Escritura:** Solo admins de la comunidad

---

### 3. `fichas` (Fichas Personales)

**Propósito:** Ficha comunitaria de cada miembro con datos de onboarding y análisis astrológico.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `userId` | string | UID del usuario (índice) |
| `datosOnboarding` | Map | Datos del chat de onboarding |
| `datosPersona` | Map? | Versión normalizada (prioridad sobre datosOnboarding) |
| `manualGenerado` | string? | Manual personal generado por IA |
| `manualMarkdown` | string? | Manual en formato Markdown |
| `fechaGeneracion` | Timestamp? | Cuándo se generó el manual |
| `versionesAnteriores` | Array? | Histórico de versiones |
| `datosBrutos` | Map? | Datos crudos de Diseño Humano (IA) |
| `perfilVisual` | Map? | Análisis visual facial (IA) |
| `isSeedData` | boolean | Si es dato de seed inicial |
| `createdAt` | Timestamp | Fecha de creación |
| `updatedAt` | Timestamp | Última actualización |
| `estado` | string? | Estado del proceso de ficha |

**Subcampos de `datosOnboarding`:**
- `nombre`, `fechaNacimiento`, `hora`, `lugar`, `genero`
- `saberes`, `rol_comunidad`, `antiguedad_anos`, `tension`
- `rol` (`'propietario' \| 'miembro' \| 'voluntario'`)
- `fechaLlegada`, `fechaSalida`, `habilidadesVoluntario` (para voluntarios)
- `latitud`, `longitud`, `timezone` (geocodificación)

**Relaciones:**
- `N → 1` users (cada usuario tiene 0 o 1 ficha)
- `N → 1` community_members (vinculado por userId)

**Reglas de acceso:**
- **Lectura:** Usuario propio + admins de su comunidad
- **Escritura:** Usuario propio (edición de su ficha) + admins (gestión)

---

### 4. `community_members` (Miembros de Comunidad)

**Propósito:** Relación muchos-a-muchos entre usuarios y comunidades.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `userId` | string | UID del usuario |
| `communityId` | string | Slug de la comunidad |
| `nombre` | string | Nombre del miembro |
| `tipo_hd` | string? | Tipo de Diseño Humano |
| `elemento_dominante` | string? | Elemento dominante |
| `autoridad_hd` | string? | Autoridad en Diseño Humano |
| `antiguedad_anos` | number? | Años en la comunidad |
| `rol_comunidad` | string? | Rol dentro de la comunidad |
| `rol` | string? | Tipo de vínculo (`propietario`, `miembro`, `voluntario`) |
| `estado` | string? | Estado del membre (activo, baja, etc.) |
| `creadoEn` | Timestamp | Fecha de ingreso |
| `updatedAt` | Timestamp | Última actualización |

**Relaciones:**
- `N → 1` communities
- `N → 1` users (vía userId)

**Reglas de acceso:**
- **Lectura:** Miembros de la misma comunidad + admins
- **Escritura:** Solo admins de la comunidad

---

### 5. `proyectos` (Proyectos Comunitarios)

**Propósito:** Gestión de proyectos colaborativos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `titulo` | string | Título del proyecto |
| `descripcion` | string | Descripción detallada |
| `lider_uid` | string | UID del líder |
| `colaboradores_uid` | string[] | UIDs de colaboradores |
| `solicitudes_uid` | string[]? | Solicitudes pendientes |
| `habilidadesNecesarias` | string[] | Tags de habilidades necesarias |
| `estado` | string | `'en_marcha' \| 'buscando_colaboradores' \| 'completado' \| 'pausado'` |
| `fechaInicio` | string? | YYYY-MM-DD |
| `fechaFin` | string? | YYYY-MM-DD |
| `communityId` | string | Comunidad propietaria |
| `creadoEn` | Timestamp | Fecha de creación |
| `updatedAt` | Timestamp | Última actualización |

**Relaciones:**
- `N → 1` communities
- `1 → N` tareas (proyectoId)

**Reglas de acceso:**
- **Lectura:** Miembros de la comunidad
- **Escritura:** Líder del proyecto + admins

---

### 6. `tareas` (Tareas)

**Propósito:** Gestión de tareas dentro de proyectos o independientes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `titulo` | string | Título de la tarea |
| `descripcion` | string? | Descripción |
| `asignadaA` | string? | UID del asignado |
| `creadaPor` | string | UID del creador |
| `estado` | string | `'pendiente' \| 'en_progreso' \| 'completada' \| 'archivada'` |
| `estadoPrevio` | string? | Para undoable delete |
| `fechaLimite` | Timestamp? | Deadline |
| `proyectoId` | string? | Proyecto al que pertenece |
| `communityId` | string | Comunidad |
| `prioridad` | string | `'alta' \| 'media' \| 'normal' \| 'baja'` |
| `createdAt` | Timestamp | Creación |
| `updatedAt` | Timestamp | Actualización |

**Relaciones:**
- `N → 1` projects (opcional)
- `N → 1` communities

**Reglas de acceso:**
- **Lectura:** Miembros de la comunidad
- **Escritura:** Creador, asignado + admins

---

### 7. `actas` (Actas de Reuniones)

**Propósito:** Registro de actas de reuniones comunitarias.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `titulo` | string | Título de la reunión |
| `fecha` | Timestamp | Fecha de la reunión |
| `facilitador` | string | Nombre del facilitador |
| `participantes` | string[] | Lista de participantes |
| `contexto` | string | Contexto de la reunión |
| `decisiones` | string[] | Decisiones tomadas |
| `tareasDerivadas` | string[]? | IDs de tareas derivadas |
| `proximaReunion` | Timestamp? | Próxima reunión |
| `creadaPor` | string | UID del creador |
| `communityId` | string | Comunidad |
| `createdAt` | Timestamp | Creación |
| `updatedAt` | Timestamp | Actualización |
| `lastEditedBy` | string? | Última edición por |

**Relaciones:**
- `N → 1` communities

**Reglas de acceso:**
- **Lectura:** Miembros de la comunidad
- **Escritura:** Creador + admins

---

### 8. `eventos` (Eventos de Calendario)

**Propósito:** Eventos del calendario comunitario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `titulo` | string | Título del evento |
| `descripcion` | string | Descripción |
| `tipo` | string | `'reunion' \| 'tarea_comunal' \| 'visita' \| 'celebracion' \| 'otro'` |
| `inicio` | Timestamp | Fecha/hora inicio |
| `fin` | Timestamp | Fecha/hora fin |
| `todoElDia` | boolean | Si es todo el día |
| `responsable_uid` | string | UID del responsable |
| `participantes` | string[] | UIDs de participantes |
| `communityId` | string | Comunidad |
| `vinculado_a` | Map? | `{ tipo: 'proyecto' \| 'acta', id: string }` |
| `creadoEn` | Timestamp | Creación |
| `creadoPor` | string | UID del creador |

**Relaciones:**
- `N → 1` communities
- `N → 1` projects/actas (vinculado_a)

**Reglas de acceso:**
- **Lectura:** Miembros de la comunidad
- **Escritura:** Responsable + creador + admins

---

### 9. `posts` (Tablón de Anuncios)

**Propósito:** Publicaciones de ofertas/necesidades comunitarias.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `tipo` | string | `'necesidad' \| 'oferta'` |
| `titulo` | string | Título |
| `descripcion` | string | Descripción |
| `categoria` | string | `'habilidad' \| 'recurso' \| 'espacio' \| 'apoyo_emocional' \| 'otro'` |
| `estado` | string | `'activo' \| 'en_proceso' \| 'resuelto'` |
| `autor_uid` | string | UID del autor |
| `communityId` | string | Comunidad |
| `respuestas_count` | number | Contador denormalizado |
| `creadoEn` | Timestamp | Creación |
| `actualizadoEn` | Timestamp | Actualización |

**Subcolección:**
- `posts/{postId}/respuestas`

**Reglas de acceso:**
- **Lectura:** Miembros de la comunidad
- **Escritura:** Autor + admins

---

### 10. `servicios` (Marketplace de Soberanía)

**Propósito:** Servicios ofrecidos por miembros (talento o recurso).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `providerId` | string | UID del proveedor |
| `title` | string | Título del servicio |
| `description` | string | Descripción |
| `type` | string | `'talento' \| 'recurso'` |
| `category` | string | Categoría |
| `location` | string? | Ubicación |
| `availability` | string? | Disponibilidad |
| `communityId` | string | Comunidad |
| `isActive` | boolean | Si está activo |
| `creadoEn` | Timestamp | Creación |
| `actualizadoEn` | Timestamp | Actualización |

**Relaciones:**
- `N → 1` communities
- `1 → N` acuerdos

**Reglas de acceso:**
- **Lectura:** Miembros de la comunidad
- **Escritura:** Proveedor + admins

---

### 11. `acuerdos` (Acuerdos de Servicio)

**Propósito:** Acuerdos entre miembros tras contratar un servicio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `servicioId` | string | Servicio relacionado |
| `providerId` | string | UID del proveedor |
| `solicitanteId` | string | UID del solicitante |
| `communityId` | string | Comunidad |
| `status` | string | `'pendiente' \| 'confirmado' \| 'en_curso' \| 'completada' \| 'cancelada' \| 'contraoferta'` |
| `mensaje` | string? | Mensaje inicial |
| `contribucion` | string? | Contribución acordada |
| `notas` | string? | Notas adicionales |
| `createdAt` | Timestamp | Creación |
| `updatedAt` | Timestamp | Actualización |

**Relaciones:**
- `N → 1` servicios
- `N → 1` communities

**Reglas de acceso:**
- **Lectura:** Provider + solicitante + admins
- **Escritura:** Participantes del acuerdo + admins

---

### 12. `propuestas` (Gobernanza Sociocrática)

**Propósito:** Propuestas de gobernanza con votación por consentimiento.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `title` | string | Título |
| `description` | string | Descripción detallada |
| `reason` | string | Razón/motivación |
| `authorId` | string | UID del autor |
| `communityId` | string | Comunidad |
| `status` | string | `'borrador' \| 'abierta' \| 'en_objeciones' \| 'integrando' \| 'acordada' \| 'descartada' \| 'caducada'` |
| `responsibleIds` | string[] | UIDs de responsables si se aprueba |
| `activeObjectionsCount` | number | Contador de objeciones activas |
| `totalResponsesCount` | number | Total de respuestas (consentimiento + preocupación) |
| `deadline` | Timestamp? | Fecha límite para votar |
| `reviewDate` | Timestamp? | Fecha de revisión |
| `userPositions` | Map | `{ [memberId]: 'consentimiento' \| 'preocupacion' \| 'duda' \| 'objecion' }` |
| `version` | number | Número de versión (incrementa al integrar) |
| `integrationNote` | string? | Nota de integración de objeciones |
| `caducadaReason` | string? | Motivo de caducidad (`falta_quorum`, `tiempo_agotado`) |
| `createdAt` | Timestamp | Creación |
| `updatedAt` | Timestamp | Actualización |

**Subcolección:**
- `propuestas/{propuestaId}/respuestas`
- `propuestas/{propuestaId}/hilos`

**Reglas de acceso:**
- **Lectura:** Miembros de la comunidad
- **Escritura:** Autor + miembros (para votar) + admins

---

### 13. `invitaciones` (Invitaciones a Comunidad)

**Propósito:** Sistema de invitaciones para unirse a comunidades.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `communityId` | string | Comunidad |
| `creadoPor` | string | UID del creador |
| `tipo` | string | `'permanente' \| 'caduca' \| 'unico_uso'` |
| `expiraEn` | Timestamp? | Fecha de expiración |
| `usosMaximos` | number? | Máximo de usos |
| `usosActuales` | number | Usos actuales |
| `activo` | boolean | Si está activa |
| `creadoEn` | Timestamp | Creación |

**Reglas de acceso:**
- **Lectura:** Admins de la comunidad
- **Escritura:** Solo admins

---

### 14. `solicitudes_acceso` (Solicitudes de Acceso)

**Propósito:** Solicitudes de usuarios para unirse a comunidades privadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `communityId` | string | Comunidad |
| `solicitante_uid` | string | UID del solicitante |
| `mensaje` | string | Mensaje del solicitante |
| `estado` | string | `'pendiente' \| 'aprobada' \| 'rechazada'` |
| `creadoEn` | Timestamp | Creación |
| `resueltoPor` | string? | UID del admin que resolvió |
| `resueltoEn` | Timestamp? | Fecha de resolución |
| `motivoRechazo` | string? | Motivo si fue rechazada |
| `detalleRechazo` | string? | Detalle adicional |

**Reglas de acceso:**
- **Lectura:** Solicitante + admins de la comunidad
- **Escritura:** Solicitante (crear) + admins (resolver)

---

### 15. `feedback_salida` (Feedback de Baja)

**Propósito:** Registro de feedback cuando un miembro abandona la comunidad.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Document ID |
| `communityId` | string | Comunidad |
| `userId` | string | UID del miembro que sale |
| `motivo` | string | Motivo principal |
| `comentario` | string? | Comentario adicional |
| `fecha` | Timestamp | Fecha de salida |

**Reglas de acceso:**
- **Lectura:** Solo admins
- **Escritura:** Sistema (automático tras baja)

---

## Relaciones entre Colecciones

```
users (1) ──────────────→ (N) community_members ←────────────── (1) comunidades
   │                            │                                   │
   │                            │                                   │
   ↓                            ↓                                   ↓
fichas (1:1 por userId)    proyectos (1:N) ←───────────────────────┘
                           │
                           ↓
                        tareas (N:1 por proyectoId)

comunidades (1) ──→ (N) actas
                 ──→ (N) eventos
                 ──→ (N) posts
                       │
                       ↓
                    respuestas (subcolección)
                 ──→ (N) servicios
                       │
                       ↓
                    acuerdos (N:1 por servicioId)
                 ──→ (N) propuestas
                       │
                       ↓
                    respuestas (subcolección)
                    hilos (subcolección)
```

## Índices Compuestos

Actualmente `firestore.indexes.json` está vacío (sin índices personalizados).

**Índices automáticos usados:**
- `tareas` → `orderBy('createdAt', 'desc')`
- `actas` → `where('communityId', '==', ...), orderBy('fecha', 'desc')`
- `proyectos` → `where('communityId', '==', ...), orderBy('updatedAt', 'desc')`
- `eventos` → `where('communityId', '==', ...), orderBy('inicio', 'asc')`
- `posts` → `where('communityId', '==', ...), orderBy('creadoEn', 'desc')`
- `servicios` → `where('communityId', '==', ...), where('isActive', '==', true)`
- `acuerdos` → `where('communityId', '==', ...), orderBy('creadoEn', 'desc')`
- `propuestas` → `where('communityId', '==', ...), orderBy('createdAt', 'desc')`

**⚠️ DEUDA TÉCNICA:** Considerar añadir índices compuestos explícitos antes de escalar a producción con grandes volúmenes de datos.

## Campos Calculados (No Persisten en Firestore)

Los siguientes campos existen solo en estado React y se calculan en tiempo de ejecución:

| Campo | Dónde se calcula | Fórmula/Fuente |
|-------|------------------|----------------|
| `appUser.hasFicha` | `AuthContext.listenAppUser()` | Query a `fichas` + `profiles` en paralelo |
| `appUser.communityId` | `AuthContext` | `communityIds[0] ?? null` |
| `PropuestaCard.totalMiembros` | `PropuestasView` | `members.length` desde `useCommunityMembers` |
| `CruceView.needsEnrich` | `CruceView` | Verifica si `datosBrutos.diseno_humano.puertas_activas` existe |
| `AdminPanel.isCommunityAdmin` | `AdminPanel` | `adminUids.includes(appUser.uid) \|\| appUser.role === 'admin'` |

## Reglas de Seguridad Resumidas

| Colección | Lectura | Escritura |
|-----------|---------|-----------|
| `users` | Owner + admins | Owner (parcial) |
| `comunidades` | Público | Admins |
| `fichas` | Owner + admins | Owner + admins |
| `community_members` | Members de misma comunidad | Admins |
| `proyectos` | Members | Líder + admins |
| `tareas` | Members | Creador + asignado + admins |
| `actas` | Members | Creador + admins |
| `eventos` | Members | Responsable + creador + admins |
| `posts` | Members | Autor + admins |
| `servicios` | Members | Provider + admins |
| `acuerdos` | Participantes + admins | Participantes + admins |
| `propuestas` | Members | Autor + voters + admins |
| `invitaciones` | Admins | Admins |
| `solicitudes_acceso` | Solicitante + admins | Solicitante (crear) + admins (resolver) |
| `feedback_salida` | Admins | Sistema |

---

*Documento vivo. Última actualización: mayo 2026.*