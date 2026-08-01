# Regla de Arquitectura: Adaptadores Backend y Telegram Bot

> Garantizar la separación total de SDKs de Firebase entre el cliente web y el backend de servidores/bots.

## Reglas Obligatorias

1. **Prohibido importar Client SDK en `src/adapters/telegram/`**:
   No importar `db`, `_core.ts`, `colTareas`, `colAcuerdos`, `colCommunityMembers` ni ninguna función de `firebase/firestore` en los handlers del bot o middlewares de Telegram.

2. **Acceso Exclusivo vía Admin SDK (`getAdminDb`)**:
   Todas las lecturas y escrituras de Firestore en el backend de Telegram deben consumir `getAdminDb()` de `src/lib/firebaseAdmin.ts`.

3. **Soporte para Base de Datos Nombrada**:
   Toda consulta con `getAdminDb()` debe respetar la variable de entorno `FIREBASE_ADMIN_DATABASE_ID`.

4. **Identidad Única de Telegram**:
   - `telegramUserId` solo debe tener **un documento activo (`status: 'linked'`)** en `/user_telegram_identities`.
   - `getTelegramIdentityByTelegramId` debe ordenar las coincidencias por `updatedAt` / `linkedAt` descendente y seleccionar el registro más reciente.

5. **Logging Estructurado Obligatorio**:
   Todo handler de comando debe emitir logs con el formato:
   `[Telegram Backend] [Admin SDK] Colección: "<nombre>", Community: "<communityId>", UID: "<userId>"`

---

*Última actualización: 1 de Agosto de 2026*
