# ADR-026: Separación Estricta entre Firebase Client SDK y Firebase Admin SDK en Backend

* **Estado**: Accepted  
* **Fecha**: 2026-08-01  
* **Autores**: Equipo de Desarrollo Kanarii  
* **Ámbito**: Arquitectura de Datos / Adaptadores de Servidor (Telegram Bot, MCP, Express)  

---

## 1. Contexto

Kanarii opera bajo un modelo de arquitectura híbrido:
- **Frontend Single Page Application (SPA)**: Ejecutada en el navegador web de los usuarios.
- **Backend Unificado en Node.js**: Procesa las interacciones de bots multicanal (Telegram Bot), endpoints HTTP y servidores de herramientas MCP.

Inicialmente, los adaptadores del backend (como el bot de Telegram) reutilizaban servicios e importaciones provenientes del Client SDK de Firebase (`firebase/firestore`, `_core.ts`). Puesto que el entorno de ejecución de Node.js no autentica a un usuario con token JWT (`request.auth == null`), Cloud Firestore aplicaba las Security Rules del cliente, bloqueando las lecturas sobre colecciones como `/users`, `/community_members`, `/tareas` y `/acuerdos` y produciendo errores de permisos (`permission-denied` / `Missing or insufficient permissions`).

---

## 2. Decisión Arquitectónica

Se establece la **separación estricta e infranqueable de SDKs según la capa de ejecución**:

1. **Capa Cliente (Navegador / Web App)**:
   - Utiliza exclusivamente **Firebase Client SDK** (`src/lib/firebase.ts`).
   - Las lecturas y escrituras están estrictamente restringidas por las Security Rules de `firestore.rules` mediante autenticación `request.auth`.

2. **Capa Servidor (Node.js / Telegram Bot / Servidores MCP)**:
   - Utiliza exclusivamente **Firebase Admin SDK** (`src/lib/firebaseAdmin.ts`).
   - En backend se prohíbe importar `db`, `_core.ts`, `colTareas`, `colAcuerdos` o cualquier referencia de `firebase/firestore`.
   - Si la base de datos de Firestore es una **base de datos nombrada** (diferente a `(default)`), el backend debe inicializarse explícitamente pasando `FIREBASE_ADMIN_DATABASE_ID` a `getFirestore(app, databaseId)`.

3. **Garantía de Identidad Única en Telegram**:
   - En la colección `/user_telegram_identities`, una cuenta de Telegram (`telegramUserId`) solo puede tener **un único documento en estado `status: 'linked'`**.
   - Al vincular una nueva cuenta, los vínculos anteriores del mismo `telegramUserId` se marcan automáticamente en estado `status: 'revoked'`.
   - En caso de consultas con múltiples coincidencias, el servidor ordena canónicamente por la marca de tiempo más reciente (`updatedAt` / `linkedAt` descendente).

---

## 3. Consecuencias

### Positivas
- **Cero errores de permisos en producción**: Eliminación completa del ruido `permission-denied` en los logs del servidor.
- **Seguridad Garantizada**: El navegador web permanece totalmente protegido por Security Rules, mientras que el bot de Telegram resuelve contextualmente con permisos de servidor.
- **Rendimiento e Independencia**: No se crean socket streams inactivos del Client SDK en el servidor de Node.js.

### Riesgos Evitados
- Evita que refactores de UI en la Web App rompan accidentalmente la lectura de datos del bot de Telegram.
- Evita desalineaciones de identidad cuando un usuario vincula una cuenta nueva en Telegram sobre un vínculo legacy previo.

---

## 4. Enlaces Relacionados
- [ADR-004: Colección Plana community_members como Fuente de Verdad](ADR-004-fuente-verdad-membresias-coleccion-plana.md)
- [ADR-012: Fuente de Verdad para la Comunidad Activa del Usuario](ADR-012-fuente-de-verdad-comunidad-activa.md)
- [Runbook de Depuración Telegram/Firebase](../runbooks/runbook-depuracion-telegram-firebase.md)
