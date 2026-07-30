# Sprint 17 — 16/06/2026 → 20/06/2026: Arquitectura Híbrida Conversacional, Identidad Vinculada y Trazabilidad

## Estado
🟡 En curso

## Objetivo del Sprint
Habilitar una integración segura, trazable y centrada en la experiencia de usuario (UX-First) para operar Kanarii desde Telegram y la Web App, desacoplando los casos de uso de negocio en una capa de dominio única (`src/core/domain/`) consumida por adaptadores de transporte (Web, Telegram Bot, MCP Server y API).

## Principios de Diseño
1. **UX-First para Personas Poco Técnicas**: Cero fricción. Interfaz conversacional limpia en Telegram con botones inline y diálogos claros en la Web. Cero gestión manual de tokens o infraestructura por el usuario.
2. **Identidad Vinculada, No Identidad Borrosa**: Toda acción la ejecuta una persona humana (`userId`). El bot o agente (`agentId`) es solo el intermediario técnico.
3. **Taxonomía de Canal Transparente**: `channel` en la auditoría representa la interfaz real (`web | telegram | mcp | api`).
4. **Trazabilidad de Origen (`sourceAction`)**: Distingue entre clics de botón inline (`telegram_button_click`), comandos tecleados (`telegram_command`), llamadas a herramientas de agentes (`mcp_tool_call`) o clics en la web (`web_ui_click`).
5. **Gobernanza Sociocrática Preservada**: Sin superusuarios invisibles ni concentradores de poder automáticos. Toda acción sensible requiere confirmación humana directa (`PendingAction`).

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-072 | Core Domain Use-Cases & Contrato de Identidad/Trazabilidad (`ExecutionCtx` + Audit) | M | ⬜ Pendiente | — |
| T-073 | Flujo de Vinculación de Identidad Telegram <-> Kanarii (Deep Link / Token Efímero) | M | ⬜ Pendiente | — |
| T-074 | Telegram Bot Adapter: cliente ligero con UX conversacional y botones inline | M | ⬜ Pendiente | — |
| T-075 | MCP Adapter Server: herramientas de alto nivel orientadas a resultados para LLMs | M | ⬜ Pendiente | — |
| T-076 | Documentación de integración, trazabilidad por canal y borrador ADR-024 | S | ⬜ Pendiente | — |

## Notas de Planning y Arquitectura
- **Middleware de Resolución de Identidad**: Valida el estado del vínculo (`pending | linked | revoked`) antes de permitir cualquier caso de uso.
- **Middleware de Auditoría**: Escribe de forma inmutable en `/audit_logs` registrando el contexto de 4 dimensiones: Humano (`userId`), Comunidad (`communityId`), Canal (`channel`), Agente (`agentId`) y Origen (`sourceAction`). La revocación de identidad conserva el histórico inalterado.
- **Flujo de Confirmación de Acciones**: Las escrituras generan un objeto `PendingAction` (expira en 15 min). En Telegram se presenta con InlineKeyboard `[✅ Confirmar]` / `[❌ Cancelar]`; en la Web App con un modal simplificado.
