# Regla: Audit Before Refactor

> Evitar la construcción sobre código inconsistente o la duplicación de lógica sin inspección previa.

## Propósito
Asegurar que cualquier nueva funcionalidad o refactorización respete la arquitectura existente y no introduzca fragmentación en la capa de servicios y hooks.

## Cuándo aplica
Esta regla es de cumplimiento OBLIGATORIO siempre que el agente vaya a:
- Crear o modificar un **Hook** en `src/hooks/`.
- Crear o modificar un **Servicio** en `src/lib/appService.ts`.
- Crear o modificar un **Componente** en `src/components/`.
- Definir o alterar una **Colección de Firestore**.

## Protocolo Obligatorio (4 Pasos)

### PASO 1 — Inventario Previo
Antes de tocar o crear cualquier archivo, lista TODOS los archivos del mismo dominio funcional.
*Ejemplo: Si vas a crear `useEventoActions.ts`, primero debes listar y revisar todos los `use*Evento*.ts` existentes.*

### PASO 2 — Clasificación Técnica
Para cada archivo encontrado en el inventario, el agente debe evaluar:
1. **Patrón Arquitectónico**: ¿Sigue el patrón DRY? (¿Usa `appService`? ¿Exporta `reload` e `isLoading`?)
2. **Consistencia de Datos**: ¿Tiene campos inconsistentes respecto a otros hooks o servicios del mismo tipo? (Revisar contra `schema-contract.md`).
3. **Uso en el Proyecto**: ¿Está referenciado en componentes activos o es código huérfano/obsoleto?

### PASO 3 — Reporte de Auditoría
Muestra el inventario al usuario y señala cualquier inconsistencia encontrada.
> [!IMPORTANT]
> Si detectas violaciones de `dry-architecture` o `schema-contract` en el código existente del mismo dominio, DEBES proponer su corrección antes de proceder con la tarea original.

### PASO 4 — Prevención de Duplicidad
Si ya existe un hook o servicio con funcionalidad similar, **extenderlo es preferible a crear uno nuevo**. Solo crea archivos nuevos si la responsabilidad es claramente distinta.

## Estándar de Firma para Hooks de Lectura
Para mantener la consistencia en toda la aplicación, todos los hooks de lectura deben exportar como mínimo:
- `data` (o el nombre semántico del recurso, ej: `propuestas`).
- `isLoading: boolean`.
- `reload: () => void`.
- `error?: Error | null` (si un hook del mismo dominio lo exporta, todos deben hacerlo por consistencia).
