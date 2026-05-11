# Arquitectura y Convenciones de Desarrollo - Kanarii

Este documento define las reglas de oro para mantener el código de Kanarii limpio, escalable y eficiente. Todos los agentes y desarrolladores deben seguir estos principios.

## 1. Principio DRY (Don't Repeat Yourself)
Maximizar la reutilización de código y mantener la lógica de negocio separada de la interfaz.

- **[MANDATO DRY]**: Si una lógica se usa en 2 o más sitios, **DEBE** extraerse a un Hook personalizado en `src/hooks/`.
- **[COMPONENTES PUROS]**: Los componentes de la UI (pages/components) deben enfocarse en el renderizado. La lógica compleja reside en Hooks.
- **[SISTEMA DE NOTIFICACIONES]**: Nunca usar `window.confirm` o `alert`. Usar siempre `useToast` con soporte para acciones interactivas.

## 2. Gestión de Hooks
Para evitar que el directorio `src/hooks/` crezca sin control y con duplicados:

- **[HOOKS EXISTENTES PRIMERO]**: Antes de crear un Hook nuevo, lista los archivos en `src/hooks/` y confirma que ninguno cubre el caso actual.
- **Ejemplo Maestro**: `useUndoableDelete.ts`. Este hook centraliza la lógica de borrado con retardo y opción de "Deshacer". Se usa en `ActasPanel.tsx` y `TareasPanel.tsx`.

## 3. UX Patterns
- **Borrado Destructivo**: Siempre ofrecer una ventana de 4 segundos para "Deshacer" mediante un Toast interactivo antes de ejecutar la eliminación definitiva en la base de datos.
