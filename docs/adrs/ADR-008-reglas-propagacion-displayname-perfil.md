# ADR 008: Reglas de propagación de displayName y datos de perfil

**Estado:** Accepted  
**Fecha:** 2026-05-26  
**Contexto:** Kanarii  

## Contexto
Bug T-017 — El `displayName` del usuario se sobreescribía con `""` (vacío) tras la expulsión y posterior re-ingreso a una comunidad. Requirió 3 sesiones de investigación con múltiples agentes.

La causa raíz fue que la función `_writeFichaRaw()` era llamada con objetos de datos parciales (por ejemplo, `{ communityId }`) desde los flujos de `useInvitacion()` y `unirseComunidadDirecto()`. Al calcular `resolvedDisplayName` desde un objeto parcial que carecía de `datosPersona`, se obtenía una cadena vacía (`""`) que posteriormente se escribía en `/users` y `/community_members`, eliminando los datos válidos existentes.

## Decisión
1. `_writeFichaRaw()` solo propaga `displayName` / `nombre` si el flag de validación `hasProfileData` es verdadero (es decir, la ficha completa contiene `datosPersona.nombre` o similar).
2. Las llamadas a `_writeFichaRaw()` con datos parciales están **PROHIBIDAS**. Si solo se requiere actualizar el campo `communityId` en `/fichas`, se debe utilizar un `updateDoc` directo.
3. Nunca escribir propiedades destructivas con valores por defecto vacíos en operaciones de escritura de tipo `setDoc` o lotes (`writeBatch`). Siempre emplear la sintaxis de propagación condicional: `...(value ? { displayName: value } : {})`.

### Componentes Clave
1. `src/lib/services/fichas.ts`: Protección de la función `_writeFichaRaw` a través del flag `hasProfileData`.
2. `src/lib/services/invitaciones.ts`: Sustitución de `_writeFichaRaw` por llamadas directas a `updateDoc` para la propagación del `communityId`.
3. `src/lib/services/members.ts`: Mismo cambio para la membresía directa.

## Consecuencias

### Positivas (Pros)
* La función `_writeFichaRaw()` es segura contra sobreescrituras parciales accidentales.
* El flujo de re-ingreso conserva la integridad del perfil, propagando todos los campos correctos (como diseño humano, carta astral, etc.) de `profiles` a `community_members` en el lote de inserción.
* Se clarifica la interfaz para operaciones parciales usando la API estándar de Firebase `updateDoc`.

### Negativas (Cons)
* Requiere recordar la restricción de que `_writeFichaRaw` no debe usarse para escrituras parciales.

### Riesgos y Mitigaciones
* Que futuros desarrolladores intenten realizar escrituras parciales mediante `_writeFichaRaw`.
  * *Mitigación:* Se ha documentado explícitamente y se puede auditar mediante linter/revisión de código.

## Referencias
* Tarea T-017 en [sprint-04.md](file:///home/romen/Proyectos/kanarii/docs/sprints/sprint-04.md)
* Archivo de cambios: [fichas.ts](file:///home/romen/Proyectos/kanarii/src/lib/services/fichas.ts)
