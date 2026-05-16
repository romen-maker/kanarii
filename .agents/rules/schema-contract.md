# Regla: Schema Contract

> Estándar de nomenclatura para persistencia en Firestore e interfaces TypeScript.

## Protocolo de Nombramiento

Antes de nombrar cualquier campo nuevo en Firestore o en interfaces TypeScript, el agente DEBE:

1. **Auditar Consistencia**: Abrir `src/lib/appService.ts` y buscar si existe un campo equivalente en otras colecciones.
2. **Reutilizar Nombres**: Usar exactamente el mismo nombre si el concepto es el mismo (ej: no mezclar `uid`, `userId` y `autorId`).
3. **Resolver Ambigüedad**: Si hay duda razonable (ej: `reason` vs `purpose`), preguntar al usuario antes de escribir código.

## Referencias Consolidadas (Source of Truth)

Usa SIEMPRE estos nombres para estos conceptos comunes:

| Concepto | Nombre de Campo | No Usar |
|---|---|---|
| Identificador de Autor | `authorId` | `userId`, `autorId`, `createdBy`, `creadoPor`, `autor_uid` |
| Fecha de Creación | `createdAt` | `creadoEn`, `timestamp`, `date`, `fecha` |
| Fecha de Actualización | `updatedAt` | `actualizadoEn`, `lastModified` |
| Estado de Activación | `isActive` | `active`, `estado`, `enabled`, `activo` |
| Votos/Posiciones | `userPositions` | `votos`, `positions`, `choices` |
| Conteos (Desnormalización)| `total[Entidad]Count` | `[entidad]_count`, `num_[entidad]`, `cantidad` |

## Deuda Técnica Detectada (Backlog de Refactor)

Los siguientes campos existen pero violan este contrato. Deben ser migrados cuando se toque el módulo correspondiente:

- `reason` en propuestas (debe ser `purpose`) - **Severidad: Media**
- `creadoEn` en múltiples colecciones (debe ser `createdAt`)
- `autor_uid` / `creadoPor` (debe ser `authorId`)

> [!IMPORTANT]
> Si encuentras una interfaz que usa un nombre fuera de esta tabla, NO la propagues. Usa el nombre estándar en el nuevo código y marca la antigua para refactor.
