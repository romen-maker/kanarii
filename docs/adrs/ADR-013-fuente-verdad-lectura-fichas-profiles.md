# ADR 013: Fuente de Verdad para la Lectura de Fichas Comunitarias en /profiles

**Estado:** Accepted
**Fecha:** 2026-06-02
**Contexto:** Kanarii Frontend / Colecciones de Firestore y Reglas de Seguridad

## Contexto
Originalmente, la ficha del usuario, que contiene el Manual Galáctico, perfil visual y dimensiones resultantes de la generación de IA, se almacenaba y leía en la colección `/fichas` (usando el identificador del usuario como clave del documento).

Sin embargo, las Reglas de Seguridad de Firestore restringen el acceso a `/fichas` de forma estricta: un usuario solo puede realizar una lectura directa sobre el documento `/fichas/{userId}` si `request.auth.uid == userId`. No se permiten búsquedas por colección (`getDocs` o queries con filtros) sobre `/fichas` para otros usuarios.

Esto provocaba un fallo de regresión crítico: al buscar las fichas de usuarios antiguos que tenían un ID de documento autogenerado en Firestore (pero con el campo `userId` dentro del documento), la función `getUserFicha` realizaba una búsqueda de colección con filtro `where('userId', '==', userId)`. Esta query fallaba debido a que las reglas de seguridad de Firestore no permiten listados generales o queries sobre `/fichas`, lo que impedía que se cargara y mostrara el Manual Galáctico para estos usuarios.

## Decisión
Se toma la decisión de:
1. **Establecer `/profiles` como la fuente de verdad única para lecturas**: Cambiar `getUserFicha(userId)` y `getFichaById(userId)` para realizar lecturas directas por ID sobre `/profiles/{userId}` en lugar de `/fichas`. La función `_writeFichaRaw` ya realiza escrituras unificadas en `/profiles` utilizando un `setDoc` con `merge: true`, por lo que todos los datos necesarios (incluyendo el manual, dimensiones, perfil visual, etc.) ya están presentes o se propagan allí.
2. **Eliminar queries de colección en `/fichas`**: Eliminar la lógica residual de `getUserFicha` que consultaba la colección `/fichas` por el campo `userId`.
3. **Migración de datos históricos**: Crear un script de migración idempotente (`migrate-fichas-to-profiles.ts`) que traspase los manuales históricos y metadatos de las fichas antiguas en `/fichas` a `/profiles/{userId}` si estos perfiles aún no cuentan con un manual generado, mitigando la pérdida de datos en usuarios previos.

## Consecuencias

### Positivas (Pros)
* **Solución de Regresión**: Se recupera la visualización del Manual Galáctico para usuarios históricos de manera inmediata y definitiva.
* **Cumplimiento de Seguridad**: Se eliminan las queries sobre colecciones no autorizadas, respetando las reglas estrictas de Firestore.
* **Simplificación**: Unificamos el modelo de lectura en el frontend, reduciendo dependencias de `/fichas`.

### Negativas (Cons)
* **Esfuerzo de Migración**: Requiere la ejecución única del script de migración en la base de datos de producción para asegurar que todos los usuarios antiguos recuperen sus manuales históricos en su correspondiente perfil.

## Referencias
* [fichas.ts](file:///home/romen/Proyectos/kanarii/src/lib/services/fichas.ts)
* [migrate-fichas-to-profiles.ts](file:///home/romen/Proyectos/kanarii/scripts/migrate-fichas-to-profiles.ts)
