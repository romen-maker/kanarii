# Tarea T-065: Estandarizar campo reason a purpose en colección /propuestas

## Contexto técnico
- Estandarizar el campo `reason` por `purpose` en los documentos de la colección `/propuestas`.
- Se requiere cambiar la definición de tipos en la aplicación.
- Se debe asegurar compatibilidad hacia atrás en la capa de datos/servicios para tolerar registros antiguos que contengan `reason` en lugar de `purpose`.
- Modificar el mapeo o lectura en la UI para pintar `purpose`.

## Caja de archivos
- `src/lib/services/_types.ts`
- `src/lib/services/propuestas.ts`
- `src/hooks/usePropuestas.ts`
- `src/components/PropuestaCard.tsx`
- `src/components/PropuestaDetail.tsx`
- `src/components/CreateProposalWizard.tsx`
- `docs/sprints/sprint-15.md`
- `.agents/tasks/task-065.md`

## Criterios de aceptación
- [x] Renombrar `reason` a `purpose` en los tipos de propuesta.
- [x] Asegurar que la capa de servicio soporte la lectura compatible (leer `purpose` y, si no existe/es null/es undefined, usar `reason` como fallback: `purpose: data.purpose ?? data.reason ?? ''`).
- [x] Actualizar las referencias de UI de `reason` a `purpose`.
- [x] Verificar compilación correcta de la app.

## Estado de aprobación
- [x] Plan de la sesión aprobado
- [x] Sesión cerrada correctamente
