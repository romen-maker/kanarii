---
trigger: always_on
---

# Arquitectura DRY y Gestión de Hooks

> Maximizar la reutilización de código (principio DRY) y asegurar una separación clara entre lógica de negocio (Hooks) e interfaz (Componentes).

## Reglas
1. **[MANDATO DRY]**: Si una lógica (API, filtrado, estado complejo) se utiliza en 2 o más lugares, **DEBE** extraerse a un Hook personalizado en `src/hooks/`.
2. **[HOOKS EXISTENTES PRIMERO]**: Antes de crear un Hook nuevo, se debe listar el contenido de `src/hooks/` y confirmar que ninguna abstracción existente cubre la necesidad. El directorio no debe crecer con duplicados.
3. **[COMPONENTES PUROS]**: Los componentes en `src/pages/` y `src/components/` deben ser principalmente declarativos. La lógica de efectos y estado complejo debe delegarse a Hooks.
4. **[SISTEMA DE NOTIFICACIONES]**: Prohibido el uso de `window.confirm` o `alert`. Usar siempre el sistema interactivo de `useToast` con soporte para "Undo" en acciones destructivas.

## Ejemplos
- ✅ **Correcto**: Usar `useUndoableDelete` para el borrado en Actas, Tareas y Proyectos.
- ❌ **Incorrecto**: Implementar un `setTimeout` local para un borrado en un componente de página.

## Excepciones
- Lógica de estado extremadamente simple y no reusable (ej: toggle de visibilidad de un menú local).
