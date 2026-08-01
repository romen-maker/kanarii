# Runbook Operativo: Depuración de Telegram Bot y Firebase Admin en Servidor

> Guía práctica para diagnosticar credenciales de Admin SDK, bases de datos nombradas, desalineación de identidades de Telegram y permisos de lectura en Firestore.

---

## 🛠️ 1. Verificación de Credenciales de Firebase Admin

Si el bot falla al arrancar o muestra `Failed to parse private key` / `5 NOT_FOUND`:

### A. Variables de Entorno Requeridas en Servidor (.env / Coolify)
- `FIREBASE_ADMIN_PROJECT_ID`: ID exacto del proyecto Firebase (ej: `kanarii-prod`).
- `FIREBASE_ADMIN_CLIENT_EMAIL`: Email de la Service Account (ej: `firebase-adminsdk-...@kanarii-prod.iam.gserviceaccount.com`).
- `FIREBASE_ADMIN_PRIVATE_KEY`: Clave privada PEM completa (`-----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----`).
- `FIREBASE_ADMIN_DATABASE_ID`: Nombre de la base de datos nombrada en Firestore (ej: `ai-studio-fb5ef2e1-c472-43e5-bb6a-51f1141b0793`). **No dejar vacía si no es `(default)`**.

### B. Diagnóstico Rápidos de Clave Privada (OpenSSL / Linebreaks)
La clave privada enviada desde la UI de Coolify suele contener comillas envolventes o `\n` escapados. En `src/lib/firebaseAdmin.ts` la función `formatPrivateKey` sanitiza automáticamente:
1. Elimina comillas simples/dobles iniciales y finales.
2. Convierte `\\n` a saltos de línea reales `\n`.
3. Normaliza `\r\n` a `\n`.

---

## 🔍 2. Depuración de Identidades de Telegram (/user_telegram_identities)

### Síntoma A: /comunidad muestra un usuario o una comunidad incorrecta
- **Diagnóstico**: Existen múltiples registros en `/user_telegram_identities` compartiendo el mismo `telegramUserId`.
- **Verificación**:
  ```bash
  npx tsx -e "
    import dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
    import { getAdminDb } from './src/lib/firebaseAdmin';
    (async () => {
      const db = await getAdminDb();
      const snap = await db.collection('user_telegram_identities').where('telegramUserId', '==', 529841983).get();
      snap.docs.forEach(d => console.log(d.id, d.data()));
    })();
  "
  ```
- **Solución Automática**:
  1. Al vincular un nuevo código (`verifyAndLinkTelegram`), la función marca en `status: 'revoked'` cualquier otro vínculo antiguo del mismo `telegramUserId`.
  2. `getTelegramIdentityByTelegramId` ordena por `updatedAt` descendente y toma el registro más reciente.

---

## 📋 3. Diagnóstico de Permisos en /tareas y /acuerdos

### Síntoma: `⚠️ Error al obtener las tareas: Missing or insufficient permissions`
- **Causa**: El handler del comando intentó usar `colTareas` o `getDocs(query(...))` importados de `_core.ts` (Client SDK).
- **Verificación en Código**:
  Buscar imports sospechosos en `src/adapters/telegram`:
  ```bash
  grep -rn "_core" src/adapters/telegram/
  grep -rn "firebase/firestore" src/adapters/telegram/
  ```
- **Solución**:
  En `src/adapters/telegram/bot.ts`, la consulta debe realizarse directamente vía `getAdminDb()`:
  ```typescript
  const dbAdmin = await getAdminDb();
  const snap = await dbAdmin.collection('tareas').where('communityId', '==', exec.communityId).get();
  ```

---

## 📊 4. Verificación de Logs Estructurados en Servidor

En los logs del proceso Node.js (Coolify / Consola) debe observarse la etiqueta de Admin SDK:
```text
[Telegram Backend] [Admin SDK] Colección: "tareas", Community: "arteara", UID: "Ma5KgZgD7RYWl9jDjzBeGnFzeno2"
[Telegram Backend] [Admin SDK] Colección: "acuerdos", Community: "arteara", UID: "Ma5KgZgD7RYWl9jDjzBeGnFzeno2"
```
Si aparece un error, la salida imprimirá la traza completa:
```text
[Telegram Backend Error] Colección: "tareas", Community: "arteara", UID: "...", Error: ...
```
