# ADR 012: Fuente de Verdad para la Comunidad Activa del Usuario

**Estado:** Accepted
**Fecha:** 2026-05-28
**Contexto:** Kanarii Frontend / Gestión de espacios activos

## Contexto
El usuario puede pertenecer a múltiples comunidades simultáneamente (membresía múltiple). En el frontend, el usuario interactúa con un selector de comunidad activa.
Anteriormente, algunos hooks de entidad (como `usePropuestaDetail`) intentaban validar la pertenencia del usuario a la comunidad de la propuesta comparando contra `appUser.communityId`. 
Sin embargo, `appUser.communityId` es un valor estático en Firestore que se calcula como el primer elemento (`communityIds[0]`) del array de membresías del usuario en su documento de perfil global. Por lo tanto, no refleja los cambios interactivos que el usuario realiza en el selector visual de la UI. Esto provocaba falsos positivos, impidiendo a los usuarios con múltiples membresías acceder a propuestas legítimas si su comunidad seleccionada actualmente no coincidía con el primer elemento de su perfil.

## Decisión
Se establece que la única fuente de verdad para la comunidad activa del usuario en el frontend es **`currentCommunityId`** provisto por **`ComunidadContext`** (obtenido mediante el hook `useComunidad()`).
Este ID se gestiona de manera reactiva en el cliente y se persiste localmente en la sesión del navegador a través de `sessionStorage`.

Se prohíbe explícitamente el uso de `appUser.communityId` como proxy para verificar la comunidad activa o filtrar entidades en el frontend. En su lugar, todos los hooks y componentes deben consumir `useComunidad` para obtener `currentCommunityId` y realizar comparaciones contra el mismo.

### Componentes Clave
1. **`ComunidadContext.tsx`**: Propietario del estado `currentCommunityId` y persistencia en `sessionStorage`.
2. **`useComunidad`**: Hook unificado para consumir la comunidad activa y las comunidades disponibles.
3. **Hooks de Entidad (`usePropuestaDetail`, `useProyectos`, `useTareas`, etc.)**: Deben usar `currentCommunityId` para filtrar o validar el contexto actual si no se proporciona un `communityId` explícito por parámetro.

## Consecuencias

### Positivas (Pros)
* **Precisión y Reactividad**: Elimina los falsos positivos de acceso cuando un usuario con membresías múltiples cambia de comunidad en la interfaz.
* **Consistencia**: Unifica el criterio de lo que constituye el "espacio activo" actual en la aplicación.

### Negativas (Cons)
* **Dependencia de Contexto**: Los hooks de datos que antes dependían únicamente de `AuthContext` (vía `appUser`) ahora deben acoplarse también a `ComunidadContext` (vía `useComunidad`) si requieren conocer la comunidad activa.

### Riesgos y Mitigaciones
* **Bloqueo de almacenamiento local**: En navegadores en modo incógnito estricto o sandboxes de iframe, `sessionStorage` puede arrojar errores de acceso.
  * *Mitigación*: `ComunidadContext.tsx` implementa un fallback transparente en memoria (`memoryStorage`) para garantizar que la aplicación continúe funcionando sin interrupciones bajo estas condiciones.

## Referencias
* [ComunidadContext.tsx](file:///home/romen/Proyectos/kanarii/src/contexts/ComunidadContext.tsx)
* [usePropuestaDetail.ts](file:///home/romen/Proyectos/kanarii/src/hooks/usePropuestaDetail.ts)
