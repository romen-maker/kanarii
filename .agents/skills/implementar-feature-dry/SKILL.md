---
name: implementar-feature-dry
description: Protocolo de implementación DRY para features de Kanarii. Activa siempre que vayas a escribir código. Verifica que no duplicas lógica antes de crear nada nuevo.
---

# Implementar Feature — DRY First

## Antes de escribir una sola línea

Responde estas preguntas en orden. Si alguna es SÍ, adapta en lugar de crear:

### 1. Hooks y lógica
- ¿Ya existe un hook `use[Entidad]Actions.ts` para esta entidad?
  (Ejemplos: `useActaActions`, `useComunidadActions`, `useFichaActions`)
- ¿O un hook genérico reutilizable que cubra el caso?

### 2. Componentes
- ¿Existe ya un componente que haga lo mismo o algo similar?
- Si es similar al 80%+: extiende el existente con props, no crees uno nuevo.

### 3. Datos y Firestore
- ¿Los campos propuestos siguen `.agents/rules/naming-convention.md`?
- ¿El modelo de datos encaja con las colecciones existentes sin añadir redundancia?

### 4. Servicios
- ¿La llamada a Firestore ya existe en algún servicio (`services/`)?

### 5. Acciones y Mutaciones
- ¿La acción (crear, editar, borrar) ya está contemplada en `use[Entidad]Actions.ts`
  para la entidad afectada? Si no existe el hook, créalo tú primero.

## Modularidad
- Si la feature afecta a **6 o más archivos** (nuevos o modificados),
  usa `roadmap-a-tarea` para dividirla en tareas más pequeñas antes de empezar.

## Durante la implementación
1. Un archivo a la vez.
2. Tras cada archivo: compilación mental — ¿sigue funcionando el conjunto?
3. Si surge un desvío: `idea-capture` lo anota, tú sigues.

## Al terminar
- Revisa que no queden `TODO` o `console.log` de debug.
- Actualiza el task file con estado `DONE`.
- Activa `accesibilidad-comunitaria` si la feature tiene UI.
