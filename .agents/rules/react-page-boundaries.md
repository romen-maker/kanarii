---
trigger: always_on
---

# Límites de Modificación en Pages

> El agente NUNCA modifica un archivo que el usuario no haya aprobado explícitamente.

## Reglas
1. Si el usuario dice "modifica ProyectosView", solo se toca ProyectosView y sus dependencias directas (hooks, componentes que se crean nuevos para él).
2. NUNCA se modifica una page "hermana" (ej: TareasPanel) como efecto colateral.
3. Si un refactor requiere tocar múltiples pages, se lista cada una en el plan y se pide aprobación por separado.
4. Los archivos compartidos (hooks, components/ui) SÍ se pueden modificar si son necesarios para el cambio aprobado, siempre manteniendo compatibilidad.
