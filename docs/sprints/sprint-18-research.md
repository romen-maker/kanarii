# Research Sprint 18 — Adaptadores de Transporte (Telegram + MCP + HTTP)
> Fuente: Perplexity — 2026-07-30
> Tarea principal: Integración conversacional (grammY Telegram bot) y agentes (MCP Server) consumiendo `src/lib/services/`.

## Hallazgos clave
- **Telegram Bot (grammY)**:
  - Usar `grammy` con `InlineKeyboard` para botones de confirmación asíncrona.
  - Handler de `/start bind_TOKEN` llamando a `verifyAndLinkTelegram(token, telegramUserId, telegramUsername)`.
  - Middleware de identidad `attachExecutionCtx` que resuelve `telegramUserId` -> `userId` y `communityId` desde `identities.ts`.
  - CallbackQuery matcher `/^pending:(confirm|cancel):(.+)$/` para responder a clicks en InlineKeyboard invocando `confirmPendingAction` o `cancelPendingAction`.
- **MCP Server (@modelcontextprotocol/sdk)**:
  - Usar `McpServer` con `StdioServerTransport`.
  - Registrar herramientas de alto nivel (`kanarii_create_proposal`, `kanarii_register_incident`, `kanarii_get_tasks`) validando esquemas con `zod`.
  - Inyectar `ExecutionCtx` resolviendo la identidad y canal `mcp` antes de delegar a `src/lib/services/`.
- **Router HTTP**:
  - Express router delegando en `src/lib/services/` con middleware de auth por token.

## Decisiones tomadas
- **Decisión:** Los adaptadores NO contienen lógica de negocio. Solo traducen transporte -> `ExecutionCtx` -> `src/lib/services/`.
- **Por qué:** Evita dispersión de reglas sociocráticas y duplica la seguridad/auditoría en un solo punto.
- **Constraint clave:** Callback data en Telegram debe ser muy corto (`pending:confirm:ID`) por límites de la API de Telegram.
