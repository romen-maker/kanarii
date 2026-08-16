# ADR-024: Adaptadores de Transporte Multicanal Desacoplados para Agentes e Interfaces Conversacionales

- **Estado**: Aceptado
- **Fecha**: 2026-07-30
- **Autores**: Equipo de Arquitectura de Kanarii
- **Sprints de Implementación**: Sprint 17 (Fundación: T-072 a T-075) y Sprint 18 (Adaptadores: T-077 a T-079)

---

## 1. Contexto y Problema

Kanarii evoluciona de ser una Single Page Application (SPA) web aislada a convertirse en un **ecosistema multicanal accesible para Agentes de IA, Bots de Telegram e Integraciones HTTP/JSON externas**.

El desafío técnico principal reside en exponer las capacidades de la plataforma (gobernanza sociocrática, gestión de tareas, acuerdos comunitarios e identidades) a diferentes canales de entrada sin:
1. Duplicar la lógica de negocio ni las reglas de acceso a Firestore entre canales.
2. Introducir capas de abstracción innecesarias (como un `src/core/` prematuro) cuando la base del proyecto se apoya sólidamente en `src/lib/services/`.
3. Perder la trazabilidad inmutable de qué usuario, agente, canal y evento origen ejecutó cada acción.

---

## 2. Alternativas Evaluadas y Rechazadas

### ❌ Alternativa A: Reescritura Arquitectónica con `src/core/` prematuro
- **Descripción**: Mover toda la lógica de `src/lib/services/` a un nuevo directorio `src/core/` desacoplado de Firebase.
- **Motivo de Rechazo**: Exceso de sobre-ingeniería. El repositorio actual tiene una arquitectura probada en `src/lib/services/`. Crear una capa paralela rompería la consistencia con las vistas React existentes sin aportar valor real en esta fase.

### ❌ Alternativa B: Lógica de Negocio y Datos dentro de los Adaptadores
- **Descripción**: Escribir consultas de Firestore y reglas sociocráticas directamente dentro de los handlers del bot de Telegram (`bot.ts`), en el servidor MCP (`server.ts`) o en los controladores HTTP (`router.ts`).
- **Motivo de Rechazo**: Violación grave del principio DRY. Dispersa las reglas de negocio en múltiples transportes, imposibilita la auditoría unificada y genera riesgos de seguridad por desincronización de permisos.

---

## 3. Decisión Aprobada

Adoptar el patrón **Adaptadores de Transporte Desacoplados de 3 Capas**, donde todos los transportes externos (Telegram, MCP, HTTP API) actúan como simples "skins" o traductores que resuelven la identidad del usuario, construyen el `ExecutionCtx` y delegan la ejecución directamente en `src/lib/services/`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAPA 1: TRANSPORTES                             │
│  Telegram Bot (grammY)  │  MCP Server (Stdio)  │  HTTP API (Express)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CAPA 2: CONTRATOS & CONTEXTO                    │
│           ExecutionCtx + Taxonomía Semántica (contracts.ts)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CAPA 3: SERVICIOS Y DATOS                       │
│    identities.ts  │  audit.ts  │  pendingActions.ts  │  tareas.ts/etc. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Taxonomía Semántica del Contexto de Ejecución (`ExecutionCtx`)

Definida en `src/lib/services/contracts.ts` (T-072), garantiza que cada invocación lleve consigo el contexto unificado:

```typescript
export type ChannelType = 'web' | 'telegram' | 'mcp' | 'api';
export type AgentType = 'web-app' | 'telegram-bot' | 'mcp-server' | 'api-client';
export type SourceActionType = 
  | 'web_ui_click' 
  | 'telegram_command' 
  | 'telegram_button_click' 
  | 'mcp_tool_call' 
  | 'api_request';

export interface ExecutionCtx {
  userId: string;
  communityId: string;
  userRole?: string;
  channel: ChannelType;
  agentId: AgentType;
  sourceAction: SourceActionType;
  telegramChatId?: number;
}
```

---

## 5. Ciclo de Vida de Identidad, Auditoría y Confirmación de 2 Pasos

1. **Resolución de Identidad Vinculada (T-073)**:
   - Colección `/user_telegram_identities/{userId}`.
   - Generación de token efímero de 5 minutos mediante `generateTelegramBindToken()`.
   - Verificación en Telegram mediante `/start bind_TOKEN` activando el estado `linked`.
2. **Auditoría Inmutable (T-074)**:
   - Colección `/audit_logs/{id}`.
   - Cada acción ejecutada registra inmutablemente `logAuditEvent()` indicando `userId`, `communityId`, `channel`, `agentId`, `sourceAction`, `action` y `status`.
3. **Confirmación Humana Asíncrona (`PendingAction`) (T-075)**:
   - Colección `/pending_actions/{id}` con TTL de 15 minutos.
   - Transiciones de estado estrictas: `pending` -> `confirmed` | `cancelled` | `expired`.
   - Permite solicitar confirmación por InlineKeyboard en Telegram o vía API antes de mutar la base de datos real.

---

## 6. Ejemplos de Implementación de los Adaptadores

### A. Telegram Bot Adapter (`grammY`) (T-077)
Ubicación: `src/adapters/telegram/`
- Middleware `attachExecutionCtx` consulta `getTelegramIdentityByTelegramId` e inyecta `ctx.exec`.
- Handler `/start bind_TOKEN` invoca `verifyAndLinkTelegram(token, telegramUserId, username)`.
- Callback Query matcher `/^pending:(confirm|cancel):(.+)$/` procesa acciones de 2 pasos con InlineKeyboard compacto.

```typescript
// Ejemplo de consumo en bot.ts
bot.callbackQuery(/^pending:(confirm|cancel):(.+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const [, action, actionId] = ctx.match;
  if (action === 'confirm') {
    await confirmPendingAction(actionId, 'TELEGRAM_CONFIRM');
    await ctx.editMessageText('✅ **Acción confirmada y procesada con éxito.**');
  }
});
```

### B. MCP Adapter Server (`@modelcontextprotocol/sdk`) (T-078)
Ubicación: `src/adapters/mcp/`
- Servidor `createMcpServer()` que registra herramientas de alto nivel (`kanarii_get_community_tasks`, `kanarii_list_agreements`, `kanarii_get_audit_logs`) validadas con `zod`.
- Inicia el transporte con `runMcpServer()` usando `StdioServerTransport`.

```typescript
// Ejemplo de consumo en server.ts
server.registerTool('kanarii_get_community_tasks', { ... }, async (args) => {
  const exec: ExecutionCtx = { userId: args.userId, communityId: args.communityId, channel: 'mcp', agentId: 'mcp-server', sourceAction: 'mcp_tool_call' };
  const snap = await getDocs(query(colTareas, where('communityId', '==', args.communityId)));
  await logAuditEvent({ ...exec, action: 'kanarii_get_community_tasks', status: 'success' });
  return { content: [{ type: 'text', text: JSON.stringify(snap.docs.map(d => d.data())) }] };
});
```

### C. HTTP API Router Express (T-079)
Ubicación: `src/adapters/http/`
- Middleware `authenticateApiToken` valida cabeceras `Authorization: Bearer <token>` o `X-Api-Key` e inyecta `req.exec`.
- Endpoints REST protegidos: `POST /api/v1/pending-actions/:id/confirm` y `POST /api/v1/pending-actions/:id/cancel`.

```typescript
// Ejemplo de consumo en router.ts
router.post('/api/v1/pending-actions/:id/confirm', async (req, res) => {
  const confirmed = await confirmPendingAction(req.params.id, req.body.confirmationToken);
  res.status(200).json({ ok: true, action: confirmed });
});
```

---

## 7. Consecuencias y Beneficios

- **✅ Alta Reutilización (DRY)**: 100% de la lógica reside en `src/lib/services/`. Añadir un nuevo canal (ej: Discord o WhatsApp) solo requiere crear su adaptador en `src/adapters/`.
- **✅ Trazabilidad Completa**: Todo evento registrado en `/audit_logs` identifica exactamente el canal y origen de la solicitud.
- **✅ Cero Ruptura**: La Web App existente continúa operando intacta consumiendo `src/lib/services/` con `channel: 'web'`.
- **✅ Concurrencia Confiable**: El flujo de confirmaciones de 2 pasos previene ejecuciones duplicadas o no autorizadas mediante control de estado y TTL de expiración.
