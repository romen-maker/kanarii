# Task-104: Integración del contexto `ExecutionCtx` en Servidores MCP

## Objetivo
Garantizar que las llamadas a herramientas y recursos del servidor MCP de Kanarii consuman e inyecten el contexto de ejecución normalizado (`ExecutionCtx`) de forma segura en servidor (request-time authorization), compartiendo el resolutor de identidades con Telegram sin implementar lógica duplicada.

## Contexto técnico
- El servidor MCP vive en `src/adapters/mcp/` (o endpoints asociados en `src/server.ts`).
- Las herramientas MCP deben exigir un `ExecutionCtx` válido (`channel: 'mcp'`), validando `userId`, `communityId` y `userRole` en cada invocación de herramienta sin depender exclusivamente del apretón de manos inicial.
- Investigación previa en `docs/sprints/sprint-23-research.md`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/adapters/mcp/server.ts`
- `src/adapters/mcp/router.ts`
- `src/lib/services/contracts.ts`

## Criterios de done
- [ ] Inyectar `ExecutionCtx` normalizado en las peticiones del servidor MCP
- [ ] Revalidar autorización a nivel de servidor (request-time) antes de ejecutar cada herramienta MCP
- [ ] npx tsc --noEmit sin errores y tests unitarios pasando

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-31T11:59:30Z
- [x] Rama creada: feat/T-104-mcp-execution-ctx-integration
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
