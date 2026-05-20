# Hooks y Contextos — Kanarii

> Referencia completa de hooks personalizados y contextos de estado global.

---

## Contextos

### 1. AuthContext

**Archivo:** `src/contexts/AuthContext.tsx`
**Provider:** `<AuthProvider>` (en `main.tsx`)

#### Estado que Provee

```typescript
interface AuthContextType {
  user: User | null;              // Usuario Firebase Auth
  appUser: AppUser | null;        // Perfil extendido de Firestore
  loading: boolean;               // Estado de carga inicial
  login: () => Promise<void>;     // Login con Google
  sendMagicLink: (email, ficha?, mode?) => Promise<void>;
  completeMagicLinkLogin: (email, link) => Promise<boolean>;
  logout: () => Promise<void>;
  updateConsent: () => Promise<void>;
}
```

#### Campos de `appUser`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `uid` | string | ID del usuario |
| `email` | string | Email principal |
| `displayName` | string? | Nombre visible |
| `role` | string | `'admin' \| 'member' \| 'user'` |
| `hasConsented` | boolean | Si aceptó términos |
| `hasFicha` | boolean | Si tiene ficha personal (calculado) |
| `communityIds` | string[] | IDs de comunidades donde es miembro |
| `communityId` | string? | **DEPRECATED**: Usar `communityIds[0]` |

#### Componentes que lo Consumen

- **Todos los componentes** que necesiten saber si el usuario está autenticado
- `AppContent`: Para mostrar banner de "Completa tu ficha"
- `ComunidadProvider`: Para sincronizar comunidades del usuario
- `OnboardingChat`: Para verificar si ya está logueado
- `FichaView`, `AdminPanel`, etc.: Para verificar roles y permisos

#### Dependencias de Firebase

- `firebase/auth`: `onAuthStateChanged`, `signInWithPopup`, `GoogleAuthProvider`, `signOut`, `sendSignInLinkToEmail`, `signInWithEmailLink`
- `firestore`: `getAppUser`, `listenAppUser`, `updateAppUserConsent` (vía `appService.ts`)

---

### 2. ComunidadContext

**Archivo:** `src/contexts/ComunidadContext.tsx`
**Provider:** `<ComunidadProvider>` (en `main.tsx`, hijo de AuthProvider)

#### Estado que Provee

```typescript
interface ComunidadContextType {
  currentCommunityId: string;     // Slug de comunidad activa
  comunidad: Comunidad | null;    // Datos de la comunidad actual
  comunidades: Comunidad[];       // Lista de todas las comunidades
  setCommunityId: (id: string) => void;
  loading: boolean;               // Cargando datos de comunidad actual
}
```

#### Comportamiento Clave

1. **Inicialización:** Default a `'arteara'` (comunidad seed)
2. **Persistencia:** Guarda en `sessionStorage` (con fallback a memoria si está bloqueado)
3. **Sincronización:** Si `appUser.communityIds` cambia y no incluye la actual, cambia a la primera disponible
4. **Seed automático:** Ejecuta `seedArteara()` al montar para asegurar existencia de comunidad por defecto

#### Componentes que lo Consumen

- **Todas las páginas protegidas** que necesitan filtrar datos por comunidad
- `AdminPanel`: Para mostrar nombre de comunidad y verificar adminUids
- `useCommunityMembers`, `useTareas`, etc.: Para obtener `communityId` si no se pasa explícitamente
- `Sidebar`, `BottomNav`: Para mostrar nombre/logo de comunidad actual

#### Dependencias de Firebase

- `appService.ts`: `getComunidad`, `listenComunidades`, `seedArteara`

---

## Hooks de Entidad (Lectura)

### Patrón Estándar

Todos los hooks de lectura siguen esta firma:

```typescript
function use[Entidad](communityId?: string) {
  return {
    items: [Entidad][],    // o item: [Entidad] | null para detalle
    loading: boolean,
    error: Error | null,
    reload: () => void     // Fuerza refetch incrementando versión
  };
}
```

---

### useActas

**Archivo:** `src/hooks/useActas.ts`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `communityId` | string? | `appUser.communityId` | Filtra por comunidad |

**Retorna:**
```typescript
{ actas: Acta[], loading, error, reload }
```

**Dependencias Firebase:**
- `getActasQuery`: Query con `where('communityId', '==', ...), orderBy('fecha', 'desc')`
- `subscribeToCollection`: Suscripción real-time

**Cuándo usarlo:** Listado de actas en `ActasPanel` o tab de gobernanza en `AdminPanel`.

---

### useAcuerdos

**Archivo:** `src/hooks/useAcuerdos.ts`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `communityId` | string | **Requerido** | Filtra por comunidad |

**Retorna:**
```typescript
{ acuerdos: Acuerdo[], loading, error, reload }
```

**Dependencias Firebase:**
- `getAcuerdosQuery`: Query con `orderBy('creadoEn', 'desc')`

**Cuándo usarlo:** Tab de Marketplace & Acuerdos en `AdminPanel`, `MarketplaceView`.

---

### useAllServicios

**Archivo:** `src/hooks/useAllServicios.ts`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `communityId` | string | **Requerido** | Filtra por comunidad |

**Retorna:**
```typescript
{ servicios: Servicio[], loading, error, reload }
```

**Diferencia con `useServicios`:** Incluye servicios inactivos (`isActive = false`).

**Dependencias Firebase:**
- `getAllServiciosQuery`: Sin filtro `isActive`

**Cuándo usarlo:** AdminPanel para ver todos los servicios (activos e inactivos).

---

### useCommunityMembers

**Archivo:** `src/hooks/useCommunityMembers.ts`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `communityId` | string? | **Requerido** | Filtra por comunidad |

**Retorna:**
```typescript
{
  members: CommunityMember[],
  loading,
  error,
  reload,
  getMemberName: (uid) => string  // Helper para resolver nombres
}
```

**Dependencias Firebase:**
- `getCommunityMembersQuery`: Query básico por communityId
- `subscribeToCollection`: Suscripción real-time

**Cuándo usarlo:** **Hook recomendado** para listados de miembros. Más ligero que `useProfiles`.

---

### useComunidades

**Archivo:** `src/hooks/useComunidades.ts`

**Sin parámetros.**

**Retorna:**
```typescript
{ items: Comunidad[], loading, error, reload }
```

**Dependencias Firebase:**
- `getComunidades()`: Función que devuelve todas las comunidades (sin filtro)

**Cuándo usarlo:** `ComunidadesView` para listar comunidades del usuario.

---

### useEventos

**Archivo:** `src/hooks/useEventos.ts`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `communityId` | string | **Requerido** | Filtra por comunidad |

**Retorna:**
```typescript
{ eventos: Evento[], loading, error, reload }
```

**Transformación especial:** Convierte `Timestamp` de Firestore a `Date` de JS para `react-big-calendar`.

**Dependencias Firebase:**
- `getEventosQuery`: Query con `orderBy('inicio', 'asc')`

**Cuándo usarlo:** `CalendarioView`, dashboard de AdminPanel.

---

### useFicha

**Archivo:** `src/hooks/useFicha.ts`

**Sin parámetros** (usa `appUser.uid` internamente).

**Retorna:**
```typescript
{ ficha: Ficha | null, loading, loadingFicha, error, reload }
```

**Dependencias Firebase:**
- `getUserFicha(uid)`: Obtiene ficha por userId (colección `fichas`)

**Cuándo usarlo:** `FichaView` para cargar ficha del usuario actual.

---

### useFichas

**Archivo:** `src/hooks/useFichas.ts`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `communityId` | string? | Todas las fichas | Filtra por comunidad |

**Retorna:**
```typescript
{ fichas: Ficha[], loading }
```

**⚠️ INCONSISTENCIA:** Este hook importa directamente de `firebase/firestore` en lugar de usar `appService.ts`. Viola el mandato DRY.

**Dependencias Firebase:**
- Importa `collection`, `query`, `onSnapshot`, `where` directamente
- Usa colección `profiles` (no `fichas`)

**Cuándo usarlo:** `CruceView`, `AdminPanel` para obtener todas las fichas completas.

**⚠️ DEUDA TÉCNICA:** Debería migrar a `subscribeToCollection` vía `appService.ts`.

---

### usePosts

**Archivo:** `src/hooks/usePosts.ts`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `communityId` | string | **Requerido** | Filtra por comunidad |

**Retorna:**
```typescript
{ posts: Post[], loading, error, reload }
```

**Dependencias Firebase:**
- `getPostsQuery`: Query con `orderBy('creadoEn', 'desc')`

**Cuándo usarlo:** `Tablon` para listado de ofertas/necesidades.

---

### useProfiles

**Archivo:** `src/hooks/useProfiles.ts`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `communityId` | string | **Requerido** | Filtra por comunidad |

**Retorna:**
```typescript
{ profiles: Ficha[], loading, error }
```

**Advertencia en comentarios:** Usar solo cuando sea estrictamente necesario el payload completo (Cruce, Edición). Para listados normales, usar `useCommunityMembers`.

**Dependencias Firebase:**
- `getProfilesQuery`: Query a colección `profiles`
- `subscribeToCollection`

**Cuándo usarlo:** `CruceView` cuando se necesitan datos astrológicos completos.

---

### usePropuestas

**Archivo:** `src/hooks/usePropuestas.ts`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `communityId` | string | **Requerido** | Filtra por comunidad |

**Retorna:**
```typescript
{ items: Propuesta[], propuestas: Propuesta[], loading, error, reload }
```

**Nota:** Retorna `items` y `propuestas` como alias por conveniencia.

**Dependencias Firebase:**
- `getPropuestasQuery`: Query con `orderBy('createdAt', 'desc')`

**Cuándo usarlo:** `PropuestasView` para kanban de gobernanza.

---

### useProyectos

**Archivo:** `src/hooks/useProyectos.ts`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `communityId` | string? | `appUser.communityId` | Filtra por comunidad |

**Retorna:**
```typescript
{ items: Proyecto[], proyectos: Proyecto[], loading, error, reload }
```

**⚠️ INCONSISTENCIA:** Importa directamente de `firebase/firestore` en lugar de usar `appService.ts`.

**Dependencias Firebase:**
- Importa `collection`, `query`, `orderBy`, `onSnapshot`, `where` directamente

**Cuándo usarlo:** `ProyectosView`, tab de Tareas & Proyectos en `AdminPanel`.

**⚠️ DEUDA TÉCNICA:** Debería migrar a `subscribeToCollection` vía `appService.ts`.

---

### useServicios

**Archivo:** `src/hooks/useServicios.ts`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `communityId` | string | **Requerido** | Filtra por comunidad |

**Retorna:**
```typescript
{ servicios: Servicio[], loading, error, reload }
```

**Diferencia con `useAllServicios`:** Solo incluye servicios activos (`isActive = true`).

**Dependencias Firebase:**
- `getServiciosQuery`: Query con `where('isActive', '==', true)`

**Cuándo usarlo:** `MarketplaceView` para listado público de servicios.

---

### useTareas

**Archivo:** `src/hooks/useTareas.ts`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `communityId` | string? | `appUser.communityId` | Filtra por comunidad |

**Retorna:**
```typescript
{ items: Tarea[], tareas: Tarea[], loading, error, reload }
```

**⚠️ INCONSISTENCIA:** Importa directamente de `firebase/firestore` en lugar de usar `appService.ts`.

**Dependencias Firebase:**
- Importa `collection`, `onSnapshot`, `query`, `orderBy`, `where` directamente

**Cuándo usarlo:** `TareasPanel`, tab de Tareas & Proyectos en `AdminPanel`.

**⚠️ DEUDA TÉCNICA:** Debería migrar a `subscribeToCollection` vía `appService.ts`.

---

## Hooks de Acción (Mutación)

### Patrón Estándar

Todos los hooks de acción usan `useEntityActions` internamente:

```typescript
function use[Entidad]Actions() {
  const { perform, isExecuting } = useEntityActions();

  const add[Entidad] = async (payload, options) => {
    return perform(serviceFunction(payload), options);
  };

  return { add[Entidad], edit[Entidad], remove[Entidad], isExecuting };
}
```

**Opciones comunes:**
```typescript
{
  successMessage?: string;
  errorMessage?: string | null;
  onSuccess?: (result) => void;
  onError?: (error) => void;
}
```

---

### useActaActions

**Archivo:** `src/hooks/useActaActions.ts`

**Métodos:**
- `addActa(payload, options)`: Crea o actualiza acta
- `editActa(id, payload, options)`: Actualiza acta existente
- `removeActa(id, options)`: Elimina acta

**Dependencias de appService:**
- `saveActa`, `deleteActa`

---

### useComunidadActions

**Archivo:** `src/hooks/useComunidadActions.ts`

**Métodos:**
- `redeemInvitacion(codigo, uid, options)`: Canjea invitación
- `solicitarAcceso(communitySlug, uid, mensaje, options)`: Solicita unirse
- `resolverSolicitudAcceso(communityId, solicitudId, estado, opciones, options)`: Aprueba/rechaza
- `generarCodigoInvitacion(communityId, tipo, options)`: Genera código
- `desactivarCodigoInvitacion(codigo, options)`: Desactiva código
- `expulsarMiembro(userId, communityId, options)`: Expulsa miembro
- `abandonarComunidad(userId, communityId, motivo, comentario, options)`: Baja voluntaria
- `registrarNuevaComunidad(data, options)`: Crea comunidad nueva
- `actualizarComunidad(slug, data, options)`: Actualiza comunidad
- `eliminarComunidad(slug, options)`: Elimina comunidad

**Dependencias de appService:** Múltiples funciones de gestión comunitaria.

---

### useEntityActions (Hook Genérico)

**Archivo:** `src/hooks/useEntityActions.ts`

**Propósito:** Encapsular patrón try/catch → service call → toast → callback.

**Método:**
- `perform(promise, options)`: Ejecuta promise con manejo de errores y toasts

**Estado:**
- `isExecuting`: boolean, true mientras se ejecuta

**Cuándo usarlo:** Base para todos los hooks de acción. No usar directamente en componentes.

---

### useEventoActions

**Archivo:** `src/hooks/useEventoActions.ts`

**Métodos:**
- `addEvento(payload, options)`
- `editEvento(id, payload, options)`
- `removeEvento(id, options)`

**Dependencias de appService:**
- `createEvento`, `updateEvento`, `deleteEvento`

---

### useFichaActions

**Archivo:** `src/hooks/useFichaActions.ts`

**Métodos:**
- `addFicha(datosOnboarding, options)`: Crea ficha nueva
- `editFicha(userId, datosOnboarding, options)`: Actualiza ficha
- `getUserFichaData(userId)`: Obtiene ficha (sin toast, manejo manual)

**Dependencias de appService:**
- `saveFicha`, `getUserFicha`

---

### useMemberActions

**Archivo:** `src/hooks/useMemberActions.ts`

**Métodos:**
- `addMember(payload, options)`: Crea miembro de comunidad
- `updateMember(memberId, cambios, options)`: Actualiza miembro
- `removeMember(memberId, options)`: Elimina miembro

**Dependencias de appService:**
- `createCommunityMember`, `updateCommunityMember`, `deleteCommunityMember`

---

### usePostActions

**Archivo:** `src/hooks/usePostActions.ts`

**Métodos:**
- `addPost(payload, options)`: Crea post
- `editPost(id, payload, options)`: Actualiza post
- `removePost(id, options)`: Elimina post
- `addRespuesta(postId, payload, options)`: Añade respuesta a post

**Dependencias de appService:**
- `createPost`, `updatePost`, `deletePost`, `createRespuesta`

---

### usePropuestaActions

**Archivo:** `src/hooks/usePropuestaActions.ts`

**Métodos:**
- `addPropuesta(payload, options)`: Crea propuesta
- `editPropuesta(id, payload, options)`: Actualiza propuesta
- `removePropuesta(id, options)`: Elimina propuesta
- `integrateObjeciones(propuestaId, newDescription, integrationNote, options)`: Integra objeciones
- `responderPropuesta(propuestaId, respuesta, options)`: Registra voto/respuesta

**Dependencias de appService:**
- `createPropuesta`, `updatePropuesta`, `deletePropuesta`, `integratePropuestaObjeciones`, `registerPropuestaResponse`

---

### useProyectoActions

**Archivo:** `src/hooks/useProyectoActions.ts`

**Métodos:**
- `addProyecto(payload, options)`: Crea proyecto
- `submitSolicitud(proyectoId, memberUid, options)`: Solicita colaborar
- `acceptColaborador(proyectoId, memberUid, options)`: Aprueba colaborador
- `rejectSolicitud(proyectoId, memberUid, options)`: Rechaza solicitud
- `updateEstadoProyecto(proyectoId, estado, options)`: Cambia estado
- `removeProyecto(proyectoId, options)`: Elimina proyecto

**Dependencias de appService:**
- `crearProyecto`, `solicitarColaboracion`, `aprobarColaborador`, `rechazarSolicitud`, `actualizarEstadoProyecto`, `deleteProyecto`

---

### useServicioActions

**Archivo:** `src/hooks/useServicioActions.ts`

**Métodos:**
- `publishServicio(servicio, options)`: Publica servicio
- `editServicio(id, updates, options)`: Edita servicio
- `removeServicio(id, options)`: Elimina servicio
- `proposeAcuerdo(acuerdo, options)`: Propone acuerdo
- `updateAcuerdoStatus(id, status, options)`: Cambia estado de acuerdo
- `editAcuerdo(id, updates, options)`: Edita acuerdo

**Dependencias de appService:**
- `createServicio`, `updateServicio`, `deleteServicio`, `createAcuerdo`, `updateAcuerdo`, `updateAcuerdoStatus`

---

### useTareaActions

**Archivo:** `src/hooks/useTareaActions.ts`

**Métodos:**
- `addTarea(payload, options)`: Crea tarea
- `editTarea(id, payload, options)`: Edita tarea
- `removeTarea(id, options)`: Elimina tarea
- `updateEstado(id, nuevoEstado, previo, options)`: Cambia estado de tarea

**Dependencias de appService:**
- `saveTarea`, `deleteTarea`, `updateTareaEstado`

---

## Hooks Utilitarios

### useToast

**Archivo:** `src/hooks/useToast.ts` (re-export desde `components/Toaster`)

**Retorna:**
```typescript
{
  success: (message) => void;
  error: (message) => void;
  info: (message) => void;
  warning: (message) => void;
}
```

**Cuándo usarlo:** Notificaciones de usuario tras acciones.

---

### useUndoableDelete

**Archivo:** `src/hooks/useUndoableDelete.ts`

**Propósito:** Manejar borrados con opción de deshacer (undo).

**Método:**
- `startDelete(id, options)`: Inicia borrado pendiente

**Opciones:**
```typescript
{
  onDelete: (id) => Promise<void>;   // Acción real de borrado
  onUndo?: (id) => void;             // Opcional: acción al cancelar
  successMessage?: string;           // Mensaje tras confirmación
  undoMessage?: string;              // Mensaje al cancelar
  errorMessage?: string;             // Mensaje si falla
  delay?: number;                    // Tiempo antes de confirmar (default 4000ms)
}
```

**Comportamiento:**
1. Muestra toast informativo con botón "Deshacer"
2. Espera `delay` ms
3. Si no hay undo, ejecuta `onDelete` definitivamente
4. Si hay undo, cancela timeout y restaura

**Cuándo usarlo:** Borrado de tareas, posts, actas, etc.

---

## Patrones a Evitar

### 1. ❌ Fetch Directo en Componentes

**Incorrecto:**
```tsx
// En un componente
useEffect(() => {
  const q = query(collection(db, 'tareas'), ...);
  onSnapshot(q, ...);
}, []);
```

**Correcto:**
```tsx
const { items: tareas, loading } = useTareas(communityId);
```

**Por qué:** Centraliza lógica en hooks reutilizables, evita duplicación.

---

### 2. ❌ Hooks que Importan de firebase/firestore

**Incorrecto:**
```ts
// useFichas.ts
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
```

**Correcto:**
```ts
// useFichas.ts
import { getFichasQuery, subscribeToCollection } from '../lib/appService';
```

**Por qué:** Cumple mandato DRY, permite refactorización centralizada.

**Hooks afectados actualmente:**
- `useFichas` ⚠️
- `useProyectos` ⚠️
- `useTareas` ⚠️

---

### 3. ❌ Duplicación de Hooks de Lectura

**Detectado:** `useServicios` vs `useAllServicios`

- `useServicios`: Solo activos
- `useAllServicios`: Todos (activos + inactivos)

**Recomendación:** Documentar claramente la diferencia (ya hecho en JSDoc). Considerar unificar con parámetro opcional:
```ts
useServicios(communityId, { includeInactive: boolean });
```

---

### 4. ❌ Contextos Anidados Innecesarios

**Actual:** `AuthProvider` → `ComunidadProvider` → `App`

**Justificado:** `ComunidadProvider` necesita `appUser` de `AuthContext` para sincronizar comunidades.

**No añadir más contextos** a menos que sea estado verdaderamente global (no local de página).

---

## Hooks que Podrían Consolidarse

### useFichas + useProfiles

**Solapamiento:** Ambos obtienen fichas/perfiles completos.

**Diferencia actual:**
- `useFichas`: Colección `profiles`, sin filtro por defecto
- `useProfiles`: Colección `profiles`, requiere communityId, advertencia de peso

**Recomendación:** Consolidar en un solo hook con opciones:
```ts
useProfiles({ communityId, includeAstrologicalData: boolean });
```

---

### useTareas + useProyectos (futuro)

**Patrón similar:** Ambos son entidades con estados, asignaciones, fechas.

**Posible consolidación:** Hook genérico `useEntities` con configuración:
```ts
useEntities<'tareas'>({ type: 'tareas', communityId, filters });
```

**En contra:** Pierde tipado específico y autocomplete. Mejor mantener separados pero con implementación consistente.

---

## Resumen de Dependencias Firebase

| Hook | Importa de firebase/firestore | Vía appService.ts |
|------|------------------------------|-------------------|
| useActas | ❌ | ✅ |
| useAcuerdos | ❌ | ✅ |
| useAllServicios | ❌ | ✅ |
| useCommunityMembers | ❌ | ✅ |
| useComunidades | ❌ | ✅ |
| useEventos | ❌ | ✅ |
| useFicha | ❌ | ✅ |
| useFichas | ✅ ⚠️ | ❌ |
| usePosts | ❌ | ✅ |
| useProfiles | ❌ | ✅ |
| usePropuestas | ❌ | ✅ |
| useProyectos | ✅ ⚠️ | ❌ |
| useServicios | ❌ | ✅ |
| useTareas | ✅ ⚠️ | ❌ |

**Prioridad de refactorización:** `useFichas`, `useProyectos`, `useTareas`.

---

*Documento vivo. Última actualización: mayo 2026.*