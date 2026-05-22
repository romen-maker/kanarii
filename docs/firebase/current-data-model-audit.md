# Auditoría de Integridad del Modelo de Datos Firebase

- **Fecha de Auditoría**: 22 de Mayo de 2026
- **Rama Activa**: `feat/T-002-eliminar-admin-hardcoded`
- **Proyecto/Base de Datos Auditada**: `ai-studio-fb5ef2e1-c472-43e5-bb6a-51f1141b0793` (Proyecto Firebase: `gen-lang-client-0601258149`)

---

## 1. Colecciones Verificadas y Campos Observados

Mediante consultas directas al API REST de Firestore y ejecución de scripts locales, se ha verificado la estructura física real de la base de datos:

### A. Colección `/users`
*   **Propósito**: Almacena los perfiles globales de los usuarios en la plataforma.
*   **Campos clave de roles/gobernanza**:
    *   `role` (string): Rol de sistema global (ej: `"user"`, `"admin"`).
    *   `communityId` (string): Identificador de la comunidad activa/preferida del usuario.
    *   `communityIds` (array de strings): Lista de identificadores de las comunidades a las que pertenece el usuario.

### B. Colección `/comunidades`
*   **Propósito**: Información general y metadatos de las comunidades creadas.
*   **Documentos reales detectados**: `arteara` y `la-alpispa`.
*   **Campos clave de roles/gobernanza**:
    *   `createdBy` (string): Contiene el UID del creador de la comunidad (propietario fundador).

### C. Colección `/community_members` (Plana)
*   **Propósito**: Colección plana raíz que representa las membresías de los usuarios en comunidades individuales.
*   **Estructura de clave de documento**: `{communityId}_{userId}` (ej: `arteara_Ma5KgZgD7RYWl9jDjzBeGnFzeno2`).
*   **Campos clave de roles/gobernanza**:
    *   `userId` (string): UID del usuario miembro.
    *   `communityId` (string): ID de la comunidad.
    *   `nombre` (string): Nombre del miembro.
    *   `rol` (string): Rol local dentro de la comunidad en **español** (ej: `"admin"`, `"miembro"`, `"visitante"`).
    *   `rolesFuncionales` (array de strings, opcional): Array de roles contextuales o de capacidades específicas asignadas (ej: `["facilitador", "tesorero"]`).
    *   `rol_comunidad` (string): Etiqueta descriptiva del rol del miembro (ej: `"Fundador/a"`).

### D. Colección `/profiles`
*   **Propósito**: Copias rápidas de perfiles de usuario para búsquedas. Contiene campos duplicados de membresía (`communityId`, `rol`, `rol_comunidad`) para visualización directa.

### E. Colección `/fichas`
*   **Propósito**: Colección de respaldo para compatibilidad hacia atrás que contiene la información de miembros reales e históricos.

---

## 2. Discrepancias Detectadas

Se han identificado discrepancias críticas entre la base de datos real, el código del frontend y las reglas de seguridad (`firestore.rules`):

| Elemento | Código de la App (`src/`) | Reglas de Firestore (`firestore.rules`) | Base de Datos Real (Firestore) | Estado / Impacto |
|---|---|---|---|---|
| **Colección de Comunidades** | `/comunidades` (Español) | `/communities` (Inglés) | `/comunidades` (Español) | **Crítico**: Las reglas no protegen la colección real de comunidades. |
| **Estructura de Membresías** | Colección plana raíz `/community_members` | Subcolección `/communities/{id}/members` | Colección plana raíz `/community_members` | **Crítico**: Genera denegación de permisos o deja sin validar las membresías locales. |
| **Campos de Rol Local** | `rol` (ej: `"admin"`, `"miembro"`) | `role` (Inglés, ej: `"admin"`, `"member"`) | `rol` (Español, ej: `"admin"`, `"miembro"`) | **Crítico**: Las reglas buscan campos inexistentes (`role` en vez de `rol`). |
| **Administración Global** | Hardcoded email en `appService.ts` | No aplicable (bypass parcial) | Rol guardado en `/users/{uid}.role` | **Seguridad**: Vulnerabilidad por dependencia de strings e imposibilidad de cambiar roles dinámicamente. |

---

## 3. Decisiones Provisionales y Preguntas Abiertas

### Decisiones de Diseño Tomadas:
1.  **Mantener la colección plana `/community_members`**: Es la fuente de verdad única en producción y desarrollo. Las reglas de seguridad de Firestore se alinearán para consultar esta colección mediante `/community_members/{communityId}_{userId}`.
2.  **Eliminar Hardcoding**: Se removerá el email `romenusabo3@gmail.com` de `appService.ts`. El privilegio administrativo se leerá directamente de Firestore o de la constante de UID del fundador (`Ma5KgZgD7RYWl9jDjzBeGnFzeno2`) para el seeding seguro y determinista de la comunidad "Arteara".
3.  **Arquitectura de Roles en 4 Capas**:
    *   **Capa 1: Plataforma Global**: En `/users/{uid}.role` (`admin | user`).
    *   **Capa 2: Membresía Local**: En `/community_members/{key}.rol` (`admin | miembro | visitante`).
    *   **Capa 3: Roles Funcionales**: En `/community_members/{key}.rolesFuncionales` (array).
    *   **Capa 4: Propiedad**: En `/comunidades/{id}.createdBy`.

### Preguntas Abiertas / Siguientes Pasos:
*   *¿Se mantendrá la colección `/profiles` a largo plazo?* Actualmente duplica información de `/community_members`. Su uso y compatibilidad deberán revisarse en el próximo Sprint.
