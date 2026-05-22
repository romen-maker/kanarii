# Referencia de Scripts de Auditoría y Mantenimiento Firebase

Este documento cataloga y describe los scripts de utilidad ubicados en la carpeta `scripts/` de Kanarii. Estos scripts permiten interactuar de forma segura con la base de datos Firestore y verificar la integridad de los datos.

---

## 1. Utilidades Compartidas

### `db-client.ts`
*   **Propósito**: Proveer un cliente HTTP unificado y autenticado para interactuar con la API REST de Firestore.
*   **Funciones Principales**:
    *   `getAccessToken()`: Extrae el token de acceso activo desde la sesión local de Firebase Tools (`~/.config/configstore/firebase-tools.json`).
    *   `runCurl(url)`: Realiza llamadas GET autenticadas.
    *   `getDocuments(collection)`: Recupera de forma recursiva y paginada todos los documentos de una colección (límite de 100 por lote).
    *   `parseDocument(doc)`: Transforma los documentos formateados de Firestore REST en objetos JSON planos de Javascript.
*   **Cuándo usarlo**: Es importado por otros scripts de auditoría para no duplicar la lógica de autenticación y mapeo.

---

## 2. Scripts de Auditoría de Integridad

### `audit_db_ninja.ts`
*   **Propósito**: Analizar y clasificar los datos de membresía en las colecciones `profiles`, `community_members` y `fichas` mediante la API REST.
*   **Comando de Ejecución**:
    ```bash
    npx ts-node scripts/audit_db_ninja.ts
    ```
*   **Qué valida**:
    *   Distingue entre miembros cargados de forma sintética (Seed) y usuarios reales.
    *   Comprueba qué usuarios están vinculados a `arteara` o a `arteara_hidden` en `community_members`.
*   **Advertencias**: Requiere que el usuario haya iniciado sesión localmente en Firebase CLI (`firebase login`).

### `audit_db_members.ts`
*   **Propósito**: Realizar una auditoría de miembros similar a `audit_db_ninja.ts` pero consumiendo el SDK del cliente de Firebase (`src/lib/firebase`).
*   **Comando de Ejecución**:
    ```bash
    npx ts-node scripts/audit_db_members.ts
    ```
*   **Qué valida**: Conteo e impresión de nombres de miembros reales vs semillas.
*   **Cuándo usarlo**: Para verificar acceso utilizando la misma librería y configuración que usa la app cliente React.

### `check-orphan-users.ts`
*   **Propósito**: Identificar usuarios que tienen comunidades asignadas en su perfil global pero carecen de registro de membresía.
*   **Comando de Ejecución**:
    ```bash
    npx ts-node scripts/check-orphan-users.ts
    ```
*   **Qué valida**: Compara los documentos en `/users` (el array `communityIds`) con las claves de `/community_members` (`{communityId}_{userId}`).
*   **Advertencias**: Si reporta huérfanos, indica inconsistencias en el flujo de registro o baja de usuarios.

### `check-acuerdos-huerfanos.ts`
*   **Propósito**: Verificar que todos los acuerdos de intercambio comunitario tienen relaciones válidas en la base de datos.
*   **Comando de Ejecución**:
    ```bash
    npx ts-node scripts/check-acuerdos-huerfanos.ts
    ```
*   **Qué valida**:
    *   Que el `servicioId` del acuerdo existe en `/servicios`.
    *   Que `providerId` y `solicitanteId` existen en `/users`.
*   **Cuándo usarlo**: Antes de realizar auditorías contables o reportes de transacciones comunitarias.

### `verify_community_ids.ts`
*   **Propósito**: Comprobar si hay documentos en `community_members` que no tengan definido o tengan un valor nulo para el campo `communityId`.
*   **Comando de Ejecución**:
    ```bash
    npx ts-node scripts/verify_community_ids.ts
    ```
*   **Qué valida**: Recorre membresías y repara campos `communityId` faltantes intentando leer el perfil correspondiente.

---

## 3. Scripts de Modificación y Mantenimiento

### `align_architecture.ts`
*   **Propósito**: Sincronizar y alinear la base de datos a la arquitectura plana actual de membresía.
*   **Comando de Ejecución**:
    ```bash
    npx ts-node scripts/align_architecture.ts
    ```
*   **Qué hace**: Lee los perfiles no semilla en `fichas` y los sincroniza haciendo PATCH en `profiles` y `community_members` con la comunidad por defecto `arteara`.
*   **Advertencias**: Realiza modificaciones directas de escritura en caliente en Firestore. Ejecutar con extrema precaución.

### `cleanup-acuerdos-huerfanos.ts`
*   **Propósito**: Eliminar físicamente los acuerdos que tienen referencias rotas para sanear la base de datos.
*   **Comando de Ejecución**:
    ```bash
    npx ts-node scripts/cleanup-acuerdos-huerfanos.ts
    ```
*   **Advertencias**: Operación destructiva. Hacer copia de seguridad de la base de datos antes de proceder.

### `hide-demos.ts`
*   **Propósito**: Mover usuarios de prueba o demo de Arteara a `arteara_hidden` para limpiar el feed público.
*   **Comando de Ejecución**:
    ```bash
    npx ts-node scripts/hide-demos.ts
    ```

---

## 4. Scripts de Pruebas y Validación

### `test-security-rules.ts`
*   **Propósito**: Ejecutar la suite de pruebas unitarias sobre las reglas de seguridad de Firestore (`firestore.rules`).
*   **Comando de Ejecución**:
    ```bash
    npx ts-node scripts/test-security-rules.ts
    ```
*   **Qué valida**:
    *   Lectura de comunidades restringida a usuarios autenticados.
    *   Denegación de lectura anónima sobre comunidades.
    *   Escritura y actualización de comunidades permitida sólo para administradores de la comunidad (`community_members.rol == 'admin'`).
    *   Lectura de membresías restringida a los propios miembros o a miembros de la misma comunidad.
    *   Comportamiento defensivo de las reglas frente a campos nulos o documentos inexistentes.
*   **Advertencias**: Requiere la instalación del emulador local de Firestore (`firebase emulators:start`) y Java 21+ instalado en el entorno.

