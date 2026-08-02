# Idea: Fase 1 — Operatividad del Bot de Telegram (Superpoderes para miembros)

> **Fecha de captura:** 2026-08-02  
> **Estado:** Capturada (Priorizada para próximo sprint de producto)  
> **Área:** Telegram Bot / Experiencia de Usuario / Notificaciones  

---

## 📌 Objetivo

Que un miembro de la comunidad pueda gestionar su día a día sociocrático y operativo directamente desde Telegram sin necesidad de abrir la Web App ni autenticarse en el navegador.

Aplica de forma directa el principio estratégico: **"¿Qué le ahorra más tiempo real a los miembros de la comunidad?"**.

---

## 🚀 Acciones Clave

### 1. Consolidar la visualización de `/tareas` y `/acuerdos`
- Aprovechar la integración ya completada de **Firebase Admin SDK** (`src/lib/firebaseAdmin.ts`) para realizar lecturas omnipotentes en servidor sin problemas de `firestore.rules`.
- Formatear las listas con información procesable (estado, fecha de entrega, rol en el acuerdo).
- Añadir paginación o límites razonables (ej. 5-10 ítems) con botones inline de navegación o detalle.

### 2. Notificaciones Push / Mensajes Directos desde el Bot
- Enviar alertas automáticas a través de Telegram (`telegramChatId` resuelto en `/user_telegram_identities`) cuando:
  - Se asigna una nueva tarea a un usuario.
  - Se requiere el voto/consentimiento del usuario en una propuesta S3 en deliberación o fase de objeciones.
  - Ocurre un cambio de estado en un acuerdo del Marketplace donde el usuario es solicitante o proveedor.

### 3. Fluidez en el cambio de comunidad activa (`/comunidad`)
- Asegurar que la conmutación de comunidad activa mediante el selector inline (`select_community:slug`) actualice instantáneamente el contexto `ExecutionCtx` y se persista en `/user_telegram_identities/{telegramUserId}`.
- Proporcionar feedback efímero claro en el chat.

---

## 🔗 Relación con Arquitectura y ADRs
- **ADR-024:** Adaptadores de transporte multicanal desacoplados (`ExecutionCtx`).
- **ADR-026:** Separación estricta entre Client SDK (Web) y Admin SDK (Telegram Server).
- **`src/adapters/telegram/bot.ts`:** Punto de entrada para la implementación de los handlers y triggers de notificación.
