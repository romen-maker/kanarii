# Task-059: Refactorizar generarAnalisisCruce → Capa 1 (JSON) + Capa 2 (Narrativa)

## Objetivo
Separar `generarAnalisisCruce` en dos funciones atómicas:
- `generarCruceInsights` (Capa 1): JSON estructurado con `responseSchema`, se guarda en Firestore. `kinMayaContext` se inyecta aquí.
- `generarCruceNarrativa` (Capa 2): Markdown narrativo on-demand, recibe el JSON de Capa 1 como contexto. NUNCA a Firestore.

Eliminar el patrón regex que parsea JSON+Markdown mezclados de una sola respuesta.

## Contexto técnico
- **ADR-014**: Separar Capa 1 (JSON, cacheable) de Capa 2 (narrativa, efímera).
- **ADR-015**: `kinMayaContext` solo en Capa 1.
- SDK: `@google/genai` con `Type.*` para schema. Modelo principal: `gemini-2.5-flash`.
- Fallback auditado: `gemini-3.1-flash-lite` (debido a límite 0 en `gemini-2.5-pro` en la API key del Free Tier).
- `responseSchema` + `responseMimeType: "application/json"` → JSON garantizado sin regex.
- Research: `docs/sprints/sprint-14-research.md` — confirmado soporte en gemini-2.5-flash.
- `AnalisisCruceStructured` y tipos asociados ya existen en `gemini.ts`.
- `CruceView.tsx` consume `generarAnalisisCruce` — necesita adaptarse al nuevo retorno `{ structured, narrative }`.
- Campos planos en `/cruces/{id}` para insights (no subcolección).

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/gemini.ts` → refactorizar función principal, crear schema, crear dos funciones internas
- `src/pages/CruceView.tsx` → adaptar consumo al nuevo retorno `{ structured, narrative }`

## Criterios de done
- [x] `generarAnalisisCruce` retorna `{ structured: AnalisisCruceStructured, narrative: string }`
- [x] `generarCruceInsights` usa `responseSchema` con `responseMimeType: "application/json"` — sin regex
- [x] `generarCruceNarrativa` recibe el JSON de Capa 1 como contexto, no `kinMayaContext`
- [x] `CruceView.tsx` adaptado al nuevo contrato sin romper UX existente
- [x] `kinMayaContext` presente solo en la llamada de Capa 1
- [x] Compilación sin errores TypeScript
- [x] La app arranca sin errores en dev (pendiente confirmación usuario)

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-06-07T14:27:23
- [x] Rama creada: feat/sprint-14-arquitectura-ia
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente


