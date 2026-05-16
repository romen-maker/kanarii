---
name: implementar-feature-dry
description: Guía al agente paso a paso en cómo implementar cualquier feature nueva en Kanarii respetando la arquitectura DRY. Actívala antes de escribir cualquier código nuevo.
---

# Implementación de Features DRY (Don't Repeat Yourself)

Esta habilidad es el protocolo obligatorio para añadir cualquier funcionalidad nueva a Kanarii. Su objetivo es asegurar que el código sea consistente, reutilizable y siga la arquitectura de 3 capas definida para el proyecto, evitando la duplicidad de lógica de Firebase y hooks.

## Proceso Obligatorio

### Fase 1: Mapeo y Análisis Previo
Antes de escribir una sola línea de código, debes responder a estas preguntas analizando el repositorio:
1. **Entidad de Datos**: ¿Qué entidad maneja esta feature? (ej. tareas, actas, eventos).
2. **Consistencia de Nomenclatura**: ¿Los campos propuestos siguen `naming-convention.md`? 
   - *Verificación*: Abrir `appService.ts` y comparar nombres de campos (ej: ¿usamos `authorId` o `creatorId` en otras partes?).
3. **Hooks Existentes**: ¿Existe ya un hook `use[Entidad].ts` en `src/hooks/`? 
   - *Regla*: Si existe, se reutiliza o extiende. No se crea uno nuevo para la misma entidad.
4. **Servicios de Datos**: ¿Hay ya operaciones similares en `src/lib/appService.ts`?
   - *Regla*: Toda interacción con Firestore vive en `appService.ts`. No se importa `firebase/firestore` en otros sitios.
5. **Acciones y Mutaciones**: ¿La acción (crear, editar, borrar) está ya contemplada en `useEntityActions`?
6. **UI Reutilizable**: ¿Qué componentes de `src/components/ui/` pueden usarse para esta feature?

### Fase 2: Plan de Acción (Decisión)
Presenta al usuario un plan estructurado antes de proceder:
- **Reutilizar**: Lista de elementos existentes que se usarán tal cual.
- **Extender**: Archivos existentes que necesitan modificaciones mínimas.
- **Crear Nuevo**: Solo si no hay equivalente (especificando a qué capa pertenece).
- **No Tocar**: Archivos que deben permanecer intactos para evitar efectos colaterales.

**DETENERSE**: Espera la aprobación del usuario antes de pasar a la fase de código.

### Fase 3: Implementación por Capas (Bottom-Up)
Implementa siempre en este orden estricto:
1. **Acceso a Datos**: `src/lib/appService.ts` (Nuevos métodos de Firestore).
2. **Lógica de Estado**: Hooks de entidad (`useEntities`) o de acción (`useEntityActions`).
3. **Presentación**: Componentes UI en `src/components/ui/`.
4. **Composición**: Página o Panel final en `src/pages/` (debe ser "tonta", solo orquestar hooks y componentes).

### Fase 4: Verificación Pre-commit
Checklist final antes de dar la tarea por concluida:
- [ ] Ninguna página importa `appService` o `firestore` directamente.
- [ ] No hay `try/catch` con `toast` inline en las páginas (deben ir en `useEntityActions`).
- [ ] Los componentes UI no contienen lógica de negocio.
- [ ] Los nuevos hooks siguen la firma estándar: `{ items, loading, reload }`.

## Restricciones Críticas
- **Prohibida la duplicidad**: Si una entidad ya tiene un hook, úsalo.
- **Separación de responsabilidades**: La lógica de negocio NO vive en el JSX.
- **Modularidad**: Si la feature afecta a más de 5 archivos, usa `roadmap-a-tarea` para dividirla.

## Integración
- Actívala **siempre** al inicio de una tarea técnica.
- Úsala en conjunto con `architecture-audit` para validar el resultado final.
- Si hay dudas de UX, consulta primero con `feature-ux-kanarii`.

---

*Última actualización: 16 May 2026*
