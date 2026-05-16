# Skill: Firebase & Firestore (Estándar Kanarii)

> Guía obligatoria para interactuar con la infraestructura de Firebase en Kanarii, asegurando la integridad de los datos y la arquitectura DRY.

## 🎯 Cuándo activar esta skill (Trigger)
Esta skill debe activarse **SIEMPRE** que el agente necesite:
1. Crear una nueva entidad de datos (colección).
2. Modificar el esquema de una entidad existente.
3. Escribir lógica de acceso a datos (Queries, Mutaciones, Batches).
4. Configurar reglas de seguridad o autenticación.

## 🏛️ Arquitectura DRY: "La Regla de Oro"
En Kanarii, **Firestore es invisible para la UI**.

- ✅ **CORRECTO**: Importar `firebase/firestore` **ÚNICAMENTE** en `src/lib/appService.ts`.
- ✅ **CORRECTO**: Las Pages y Hooks llaman a funciones exportadas desde `appService.ts`.
- ❌ **PROHIBIDO**: Importar `db` o funciones de Firestore en componentes React (`.tsx`) o hooks (`.ts`).
- ❌ **PROHIBIDO**: Hacer `query()`, `addDoc()`, `updateDoc()` fuera de la capa de servicio.

## 🛠️ Uso de Herramientas MCP
Utiliza las herramientas del servidor MCP de Firebase siguiendo estos criterios:

- **`get_project_url` / `get_publishable_api_key`**: Solo para configuración inicial o debug de conexión.
- **`list_tables`**: Úsalo para verificar la existencia de colecciones antes de proponer cambios.
- **`get_advisors`**: Úsalo para auditar el rendimiento de las consultas y sugerir índices.

## 📏 Nomenclatura y Modelo de Datos
Consulta siempre `.agent/rules/naming-convention.md`. Resumen rápido:

- **Idioma**: Siempre Inglés.
- **Formato**: `camelCase`.
- **IDs**: Usar `authorId`, `communityId`, `providerId`. **Evitar** `Uid` o `UID`.
- **Timestamps**: Usar `createdAt`, `updatedAt`, `creadoEn` (solo si la colección ya lo usa, preferir inglés en nuevas).

### Colecciones Existentes (Ejemplos):
| Concepto | Colección | Campos Clave |
| :--- | :--- | :--- |
| Servicios | `servicios` | `providerId`, `title`, `isActive`, `creadoEn` |
| Acuerdos | `acuerdos` | `servicioId`, `solicitanteId`, `status`, `exchangeType` |
| Eventos | `eventos` | `inicio`, `fin`, `communityId`, `responsable_uid` |

## 🚫 Qué NO hacer (Anti-patrones)
1. **Llamadas redundantes**: No pidas al usuario que cree índices manualmente si puedes detectarlos con `get_advisors`.
2. **Hardcoding de IDs**: Nunca uses IDs de documentos específicos en el código. Siempre deben venir por parámetros.
3. **Mapeo inconsistente**: Si Firestore devuelve `authorId`, no lo renombres a `autor` en el hook a menos que sea para transformar el dato (ej: traer el nombre del autor).

---
*Última actualización: 16 May 2026*
