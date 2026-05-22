# ADR 004: Colección Plana community_members como Fuente de Verdad para Membresías

**Estado:** Accepted
**Fecha:** 2026-05-22
**Contexto:** Kanarii - Estructura de Datos y Membresía

## Contexto
Existía un desajuste arquitectónico en Kanarii: `firestore.rules` buscaba las membresías en la subcolección anidada `/comunidades/{id}/members/{uid}`, pero el código del frontend y el seeding físico real escribían en la colección plana `/community_members` usando una clave compuesta `{communityId}_{userId}`. Este desajuste causaba fallos constantes de permisos denegados o bypass total de las reglas de seguridad.

### Alternativas Consideradas
*   **Alternativa A: Migración masiva a subcolecciones anidadas (`/comunidades/{id}/members`)**: Cambiar todo el frontend y backend para usar la estructura jerárquica nativa de Firestore.
    *   *Desventajas*: Alta fricción, riesgo de romper compatibilidad hacia atrás con fichas existentes e impacto severo en la UX del usuario durante la migración en caliente.
*   **Alternativa B: Unificar y oficializar la colección plana `/community_members` (Seleccionada)**: Mantener la colección plana existente y actualizar `firestore.rules` para consultar de forma consistente la ruta `/community_members/$(communityId)_$(userId)`.

## Decisión
Se establece la colección plana `/community_members` como la fuente de verdad única y actual para las membresías comunitarias en Kanarii. Las reglas de seguridad de Firestore se alinean para proteger y leer esta colección usando claves compuestas. Se prohíbe el uso de subcolecciones anidadas `/comunidades/{id}/members` para almacenar roles o registros de pertenencia.

## Consecuencias

### Positivas (Pros)
*   **Compatibilidad**: No se requiere realizar migraciones en caliente ni modificar el esquema físico actual de la base de datos.
*   **Consultas Simplificadas**: Permite listar todos los miembros de todas las comunidades con una sola consulta plana en el panel de control de administración global.

### Negativas (Cons)
*   **Clave Compuesta Manual**: La generación y validación de claves debe realizarse manualmente concatenando `{communityId}_{userId}` en el frontend.

### Riesgos y Mitigaciones
*   *Riesgo*: Modificaciones maliciosas de claves compuestas en Firestore. -> *Mitigación*: Las reglas de seguridad validarán de forma estricta que el ID del documento coincida exactamente con la concatenación de los campos internos `communityId` y `userId`.

## Criterio de Revisión
Este ADR se mantendrá vigente mientras la escala de datos no justifique una migración a subcolecciones para optimización de queries paginadas a gran escala.
