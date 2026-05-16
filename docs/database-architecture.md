# Arquitectura de Base de Datos — Kanarii

## Resumen Ejecutivo

Kanarii gestiona los datos de sus miembros mediante un sistema de **3 colecciones sincronizadas** en Firestore. Toda escritura debe pasar por una única función controlada (`_writeFichaRaw`) para mantener la consistencia. Escribir directamente en una sola colección rompe la sincronización de forma silenciosa y es la principal fuente de bugs difíciles de depurar.

---

## Las 3 Capas de Datos de Miembros

### Capa 1: `profiles` — Ficha Completa

La colección más pesada. Contiene todo lo que el miembro ha introducido en el onboarding: datos de Diseño Humano, manuales de IA personalizados, preferencias, y cualquier campo extendido que añadan futuras versiones del formulario.

**Cuándo leerla:** Siempre que necesites el perfil completo de un miembro individual (vista de detalle, edición de perfil, generación de IA).

**Cuándo NO leerla:** Nunca para listas o búsquedas. Cargar `profiles` completos para renderizar un listado de 30 miembros es entre 10x y 50x más lento que usar `community_members`.

```
/profiles/{userId}
  ├── userId: string
  ├── communityId: string          ← CRÍTICO: debe estar siempre presente
  ├── datosOnboarding: { ... }     ← payload completo del formulario
  ├── manualIA: { ... }
  └── updatedAt: Timestamp
```

---

### Capa 2: `community_members` — Índice Ultraligero

Colección diseñada exclusivamente para velocidad. Cada documento tiene solo los campos mínimos para renderizar listas y ejecutar búsquedas sin tocar `profiles`.

**Cuándo leerla:** Panel Admin, buscadores, ConsentGrid, cualquier lista de miembros.

**Invariante:** Si un usuario existe en `profiles`, debe existir en `community_members` con el mismo `communityId`. Si no existe aquí, no aparecerá en ninguna lista ni búsqueda del sistema.

```
/community_members/{userId}
  ├── userId: string
  ├── communityId: string
  ├── nombre: string               ← Nombre para listados
  ├── tipo_hd: string             ← Para filtros rápidos de Diseño Humano
  └── updatedAt: Timestamp
```

---

### Capa 3: `fichas` — Detalle del Proceso Socrático

Esta no es una capa "legacy" ni transitoria: es la **fuente de verdad del proceso socrático de cada persona**. Contiene el historial de propuestas, tensiones trabajadas, acuerdos alcanzados, y el estado de madurez dentro de la comunidad.

Mantenerla separada de `profiles` es una decisión de diseño deliberada: el perfil público puede cambiar sin afectar el registro del proceso, y viceversa.

```
/fichas/{userId}
  ├── userId: string
  ├── communityId: string          ← CRÍTICO: debe estar siempre presente
  ├── datosOnboarding: { ... }
  ├── procesoSocratico: { ... }    ← tensiones, propuestas, acuerdos
  └── updatedAt: Timestamp
```

---

## Relación Entre Colecciones

Las tres colecciones usan el `userId` como ID de documento. Esto permite joins de O(1) sin necesidad de queries:

```
userId = "rXDlDiXHMKQBdOArSqXCOOkfrm42"

profiles/rXDlDiXHMKQBdOArSqXCOOkfrm42      ← ficha completa
fichas/rXDlDiXHMKQBdOArSqXCOOkfrm42        ← proceso socrático
community_members/rXDlDiXHMKQBdOArSqXCOOkfrm42  ← índice ligero
```

---

## Protocolo de Escritura Atómica

### Regla de Oro

> **Nunca escribas directamente en una sola colección de miembros.**
> Toda operación de escritura debe pasar por `_writeFichaRaw` en `src/lib/appService.ts`.

Si llamas a `setDoc` o `updateDoc` directamente sobre `profiles`, `fichas`, o `community_members` de forma aislada, las otras dos colecciones quedarán desactualizadas. Firestore no tiene transacciones cruzadas de colecciones automáticas — esa responsabilidad recae en `_writeFichaRaw`.

### `_writeFichaRaw` — La Única Puerta de Entrada

```typescript
// src/lib/appService.ts
async function _writeFichaRaw(uid: string, data: Partial<Ficha>, merge: boolean) {
  // Escribe en las 3 colecciones de forma atómica usando Promise.all o batch
  await Promise.all([
    setDoc(doc(db, 'fichas', uid), data, { merge }),
    setDoc(doc(db, 'profiles', uid), data, { merge }),
    setDoc(doc(db, 'community_members', uid), {
      userId: uid,
      communityId: data.communityId,
      nombre: data.datosPersona?.nombre || data.datosOnboarding?.nombre || 'Sin Nombre',
      tipo_hd: data.datosBrutos?.diseno_humano?.tipo || '',
      updatedAt: serverTimestamp()
    }, { merge: true })
  ])
}
```

### Funciones Permitidas para Escritura

| Función | Cuándo usarla |
|---------|--------------|
| `_writeFichaRaw(uid, data, false)` | Crear un miembro nuevo desde cero |
| `_writeFichaRaw(uid, data, true)` | Actualizar campos específicos de un miembro existente |
| `useInvitacion(invId, uid)` | Vincular un usuario existente a una comunidad (llama a `_writeFichaRaw` internamente) |

### ❌ Antipatrón — No Hacer Nunca

```typescript
// MAL: solo actualiza profiles, fichas y community_members quedan desactualizados
await setDoc(doc(db, 'profiles', uid), { communityId: 'arteara' }, { merge: true })

// MAL: solo actualiza community_members, profiles queda desactualizado
await updateDoc(doc(db, 'community_members', uid), { displayName: 'Nuevo Nombre' })
```

---

## Flujo de Datos del Usuario (Lifecycle)

### Fase 1: Onboarding en Memoria (localStorage)

Durante el onboarding, los datos se almacenan temporalmente en `localStorage` bajo la clave `kanarii_onboarding_draft`. Este estado es **efímero e intencionalmente no persistente en Firestore**.

**⚠️ Advertencia — El "Efecto Fantasma":**
Si el usuario completa el onboarding en una sesión pero falla la escritura final a Firestore (red caída, error de permisos, cierre del navegador), los datos quedan atrapados en `localStorage`. En la siguiente sesión, el sistema puede detectar un draft incompleto y mostrar un estado inconsistente: el usuario aparece autenticado pero sin comunidad asignada.

**Mitigación:** Al detectar `kanarii_onboarding_draft` con `communityId` vacío o nulo en una sesión autenticada, redirigir al paso de vinculación de comunidad, no al inicio del onboarding.

### Fase 2: Persistencia a Firestore

Al completar el onboarding, se llama a `_writeFichaRaw` con `merge: false`. Los datos pasan de `localStorage` a las 3 colecciones de forma simultánea. Tras la escritura exitosa, se elimina el draft de `localStorage`.

### Fase 3: Vinculación por Invitación

Cuando un usuario existente acepta una invitación (`useInvitacion`):

1. Se verifica que la invitación no esté expirada ni usada
2. Se actualiza `/users/{uid}` con `communityIds: arrayUnion(communityId)` mediante batch
3. Si ya existe un documento en `fichas/{uid}`, se propaga `communityId` a las 3 colecciones
4. Si no existe, el próximo onboarding lo creará con `communityId` ya asignado

---

## Hooks de Lectura — Cuál Usar Según el Caso

| Necesidad | Hook correcto | Colección que lee |
|-----------|--------------|-------------------|
| Lista de miembros de una comunidad | `useCommunityMembers(communityId)` | `community_members` |
| Búsqueda de miembros por nombre | `useCommunityMembers` + filtro local | `community_members` |
| Perfil completo de un miembro | `useFicha(userId)` o `useProfile(userId)` | `fichas` / `profiles` |
| ConsentGrid | `useCommunityMembers(communityId)` | `community_members` |
| Panel Admin — listado | `useCommunityMembers(communityId)` | `community_members` |
| Panel Admin — edición individual | `useProfile(userId)` | `profiles` |

**Regla:** Si vas a renderizar más de un miembro a la vez, usa `community_members`. Si necesitas un único miembro con todos sus datos, usa `profiles` o `fichas`.

---

## Gestión de Datos Iniciales (Seed Data)

La función `ensureSeedData` en `appService.ts` garantiza que el sistema nunca arranque con colecciones vacías. Se ejecuta una sola vez al inicializar la aplicación si detecta que la comunidad no tiene miembros.

**Por qué es necesario:** Sin datos de prueba, el ConsentGrid, el Kanban de propuestas, y las listas del Panel Admin aparecen vacíos, lo que dificulta el desarrollo y las demos.

**Cómo extenderlo:** Para añadir nuevos campos al seed, modifica el objeto `seedMember` en `ensureSeedData` y pásalo a través de `_writeFichaRaw` — nunca directamente a Firestore.

---

## Diagnóstico Rápido de Desincronización

Si un miembro existe en `profiles` pero no aparece en listas ni en el ConsentGrid, ejecutar este diagnóstico:

```typescript
// Verificar que las 3 colecciones tienen el mismo communityId
const uid = 'ID_DEL_USUARIO'
const [ficha, profile, member] = await Promise.all([
  getDoc(doc(db, 'fichas', uid)),
  getDoc(doc(db, 'profiles', uid)),
  getDoc(doc(db, 'community_members', uid))
])

console.log({
  fichas_communityId: ficha.data()?.communityId,
  profiles_communityId: profile.data()?.communityId ?? profile.data()?.datosOnboarding?.communityId,
  community_members_communityId: member.data()?.communityId
})
```

Si alguno difiere o está `undefined`, llamar a `_writeFichaRaw` con `merge: true` y el `communityId` correcto para resincronizar.

---

## Historial de Decisiones

| Fecha | Decisión | Razón |
|-------|----------|-------|
| Mayo 2026 | Crear `community_members` como índice ligero | Las queries sobre `profiles` completos causaban latencia inaceptable en listas |
| Mayo 2026 | `_writeFichaRaw` como única puerta de escritura | Bug de desincronización al vincular usuario por invitación (caso Abián) |
| Mayo 2026 | Propagar `communityId` en `useInvitacion` | Fix del bug: `useInvitacion` no actualizaba `fichas` ni `community_members` |
