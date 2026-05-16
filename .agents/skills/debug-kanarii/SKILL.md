# Skill: Debug Kanarii

> Protocolo de diagnóstico y resolución de errores para el ecosistema Kanarii.

## Cuándo activar
Activa esta skill cuando algo falle en local o producción:
- Errores 403 (Permission Denied) en Firestore.
- Suscripciones `onSnapshot` que no disparan cambios.
- Datos que aparecen como `undefined` o no cargan en la UI.
- Errores de flujo en Firebase Auth.
- Desajustes entre tipos de TS y datos reales.

## Protocolo de Diagnóstico (4 Pasos)

### PASO 1 — Identificar la Capa del Fallo
1. **Error en UI**: Revisa el componente React y el hook (`useEntity.ts`) que consume los datos.
2. **Error de Permisos (403)**: Revisa `firestore.rules` contra el `request.auth` del usuario actual.
3. **Datos Ausentes/Vacíos**: Revisa si la query en `appService.ts` requiere índices compuestos (consulta `firestore.indexes.json`).
4. **Fallo de Auth**: Consulta la skill `firebase-auth-basics`.

### PASO 2 — Herramientas MCP
Usa las herramientas de Firestore para auditar la base de datos sin pedirle al usuario que abra la consola:
- `firestore_get_document`: Verifica si el documento existe y tiene los campos esperados.
- `firestore_list_collections`: Confirma la existencia de colecciones o subcolecciones.

### PASO 3 — Verificar Contrato de Tipos
- Compara la interfaz TypeScript en `appService.ts` con el documento JSON real devuelto por Firestore.
- Detecta campos faltantes o tipos incorrectos (ej: String vs Timestamp).

### PASO 4 — Reporte y Propuesta
- Explica la capa afectada y la causa raíz.
- Propón el fix mínimo.
- **Importante**: Si el fix modifica `firestore.rules`, activa obligatoriamente la skill `firebase-security-rules-auditor`.

## Anti-patrones Comunes en Kanarii

1. **onSnapshot silencioso**: Suele ser un índice faltante en Firestore. Revisa los logs de la consola del navegador del usuario si es posible o asume que falta el índice si hay un `orderBy` + `where`.
2. **Campos undefined**: Falta un guard `?? {}` o `?? []` en el mapeo de `appService.ts`.
3. **403 en Escritura**: La Security Rule no permite la operación para el rol actual del usuario (`admin` vs `member`).

## Recordatorio DRY
No arregles fallos directamente en la Page. Si el error es de datos, el fix pertenece a `appService.ts` o al Hook correspondiente.
