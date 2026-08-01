# Checklist Operativo: Verificación de Telegram Bot y Conexión de Servidor

> Lista de comprobación obligatoria antes de autorizar un despliegue en producción o staging.

---

## 📋 Checklist de Despliegue e Infraestructura

- [ ] **1. Variables de Entorno en Servidor (Coolify)**:
  - [ ] `FIREBASE_ADMIN_PROJECT_ID` configurado.
  - [ ] `FIREBASE_ADMIN_CLIENT_EMAIL` configurado.
  - [ ] `FIREBASE_ADMIN_PRIVATE_KEY` con formato PEM válido.
  - [ ] `FIREBASE_ADMIN_DATABASE_ID` apuntando a la base nombrada correcta.

- [ ] **2. Aislamiento de Código Backend**:
  - [ ] Ningún archivo dentro de `src/adapters/telegram/` importa `_core.ts` ni `firebase/firestore`.
  - [ ] `npx tsc --noEmit` se ejecuta sin errores de compilación.

- [ ] **3. Pruebas de Comandos en Telegram**:
  - [ ] `/comunidad`:
    - [ ] Muestra el estado de la cuenta vinculada y el UID del usuario.
    - [ ] Lista **todas** las comunidades a las que pertenece el usuario (incluso si es 1 sola).
    - [ ] Muestra la marca `✅` en la comunidad activa actual y botones `📍 Activar <nombre>` en las demás.
    - [ ] Al pulsar un botón inline, cambia la comunidad activa efímeramente y refresca el mensaje sin recargar el chat.
  - [ ] `/tareas`:
    - [ ] Devuelve las tareas de la comunidad activa resuelta.
    - [ ] No emite errores `permission-denied` ni `Missing or insufficient permissions`.
  - [ ] `/acuerdos`:
    - [ ] Devuelve los acuerdos de la comunidad activa resuelta.
    - [ ] No emite errores de permisos.

- [ ] **4. Garantía de Identidad Única**:
  - [ ] Al realizar una nueva vinculación con `/start TOKEN`, los vínculos previos del mismo `telegramUserId` pasan automáticamente a `status: 'revoked'`.
  - [ ] No existen dos documentos activos `linked` simultáneos en `/user_telegram_identities`.

- [ ] **5. Trazabilidad en Logs de Servidor**:
  - [ ] La consola de Node.js muestra los logs estructurados `[Telegram Backend] [Admin SDK] Colección: "..."`.
