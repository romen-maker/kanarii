# Task-078: MCP Adapter Server (herramientas de alto nivel consumiendo `src/lib/services/`)

## Objetivo
Implementar el Servidor MCP (Model Context Protocol) en `src/adapters/mcp/` (`server.ts`, `index.ts`) utilizando `@modelcontextprotocol/sdk` para exponer herramientas orientadas a resultados para agentes LLM externos, reutilizando directamente las funciones de `src/lib/services/` (`tareas.ts`, `acuerdos.ts`, `pendingActions.ts`, `audit.ts`, `identities.ts`).

## Contexto técnico
- Basado en los hallazgos de `docs/sprints/sprint-18-research.md`.
- Conecta con los servicios de `src/lib/services/`:
  - `tareas.ts` / `acuerdos.ts` / `audit.ts` / `pendingActions.ts`
- Utiliza `@modelcontextprotocol/sdk/server/mcp.js` y `StdioServerTransport`.
- Registra herramientas con esquemas `zod` e inyecta `ExecutionCtx` (`channel: 'mcp'`, `agentId: 'mcp-server'`, `sourceAction: 'mcp_tool_call'`).

## Caja de archivos
Archivos autorizados para modificación:
- `src/adapters/mcp/server.ts`
- `src/adapters/mcp/index.ts`
- `package.json`

## Criterios de done
- [x] Añadida la dependencia `@modelcontextprotocol/sdk` a `package.json`.
- [x] Implementado `src/adapters/mcp/server.ts` creando el `McpServer`, registrando `kanarii_get_community_tasks`, `kanarii_list_agreements` y `kanarii_get_audit_logs` con `zod` e inyección de `ExecutionCtx`.
- [x] Implementado `src/adapters/mcp/index.ts` exportando `runMcpServer(server)` con `StdioServerTransport`.
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T08:23:15Z
- [x] Rama creada: feat/T-078-mcp-adapter-server
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
