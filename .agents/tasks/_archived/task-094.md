# Task File: T-094 — Unificar Servicios en MCP y Validar Pertenencia a Comunidad

> **Sprint 22** | Tarea: `T-094` | Tamaño: **M** | Fecha: 2026-07-30  
> **Objetivo**: Garantizar que el servidor MCP consuma directamente las funciones deterministas centralizadas en `src/lib/services/` (evitando duplicación de lógica de acceso a datos o validaciones) y aplique la comprobación de pertenencia y rol de comunidad al igual que el canal Telegram.

---

## Estado
- [x] Creado por session-start
- [x] Plan presentado y aprobado con cambios
- [x] Ejecución completada
- [x] Tests pasando
- [x] Sesión cerrada correctamente

---

## Contexto técnico
- Auditar y refactorizar las herramientas expuestas por el servidor MCP en `src/adapters/mcp/server.ts`.
- Asegurar reutilización directa de los servicios de `src/lib/services/` (`tareas.ts`, `acuerdos.ts`, `identities.ts`, `members.ts`).
- Aplicar validación de pertenencia a comunidad y rol en las llamadas a herramientas MCP con respuesta de errores diferenciada expresiva (`visitante`, `sin_comunidad_activa`, `no_pertenece_a_comunidad`, `recurso_no_encontrado`).

---

## Caja de archivos (Autorizados para modificación)
- `src/adapters/mcp/server.ts`
- `src/adapters/mcp/index.ts`
- `tests/unit/mcp.test.ts`

---

## Criterios de Aceptación / Done
- [x] El servidor MCP utiliza exclusivamente las funciones de servicio de `src/lib/services/`.
- [x] Las herramientas MCP rechazan peticiones con respuestas de error expresivas diferenciadas (`visitante`, `sin_comunidad_activa`, `no_pertenece_a_comunidad`, `recurso_no_encontrado`).
- [x] Cero duplicación de lógica de base de datos en la capa MCP.
- [x] Tests unitarios en `tests/unit/mcp.test.ts` y compilación TypeScript pasando con 0 errores.
