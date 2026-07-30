# Task-080: Documentación de Arquitectura de Agentes e instalación de ADR-024

## Objetivo
Crear el registro de decisión de arquitectura `docs/adr/ADR-024-multi-channel-agent-adapters.md` y la guía de arquitectura de agentes `docs/architecture/agents-integration-architecture.md`, documentando formalmente la separación en 3 capas (`src/lib/services/` -> `ExecutionCtx` -> `src/adapters/`), el ciclo de vida de identidades vinculadas, la trazabilidad inmutable y el patrón de confirmaciones asíncronas de dos pasos (`PendingAction`).

## Contexto técnico
- Basado en la implementación completada en Sprint 17 y Sprint 18 (`T-072` a `T-079`).
- Modela formalmente:
  - `ADR-024`: Decisión de diseño de adaptadores desacoplados de transporte (Telegram, MCP, HTTP) consumiendo un núcleo unificado en `src/lib/services/`.
  - `agents-integration-architecture.md`: Diagramas y guía de integración para desarrolladores y agentes LLM sobre cómo autenticar, auditar y ejecutar operaciones multicanal en Kanarii.

## Caja de archivos
Archivos autorizados para modificación:
- `docs/adr/ADR-024-multi-channel-agent-adapters.md`
- `docs/architecture/agents-integration-architecture.md`

## Criterios de done
- [x] Creado `docs/adr/ADR-024-multi-channel-agent-adapters.md` consolidando contexto, alternativas rechazadas, decisiones, consecuencias, taxonomía `ExecutionCtx`, flujos y ejemplos de adaptadores.
- [x] Cita correctamente las tareas T-072 a T-079 sin contradicciones.
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T08:33:31Z
- [x] Rama creada: docs/T-080-adr-024-arquitectura-agentes
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
