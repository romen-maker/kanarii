# Idea: Integración MVP de Hermes (Capa LLM) en el Bot de Telegram de Kanarii

> **Fecha de captura:** 2026-08-02  
> **Estado:** Capturada (Pendiente de priorización)  
> **Área:** Backend / Telegram Bot / Inteligencia Artificial  

---

## 📌 Contexto y Origen

Durante las sesiones de consolidación del bot de Telegram (ADR-026, separación de Client SDK vs Admin SDK) y el análisis de la arquitectura multicanal (ADR-024), se identificó la oportunidad de permitir que los usuarios interactúen con Kanarii desde Telegram utilizando **lenguaje natural**, sin romper ni sustituir los comandos `/` existentes.

Para evitar alucinaciones, mutaciones no deseadas o vulnerabilidades de seguridad (bypasses de comunidad o rol), se diseñó una especificación técnica donde **Hermes actúa únicamente como un clasificador de intenciones (Intent Parser)** probabilístico y no estructurado, mientras que la ejecución real queda delegada a código determinista en Node.js y al flujo de confirmación en 2 pasos de `pending_actions`.

---

## 🎯 Prompt de Especificación Técnica (Consignas de Implementación)

```markdown
Implement the Hermes MVP integration using the already verified architecture.

Constraints:
- Keep existing Telegram commands unchanged.
- Add Hermes only for free-text messages.
- Use runtime schema validation with Zod.
- Treat LLM output as untrusted until validated.
- Do not let Hermes write to Firestore directly.
- All write intents must go through pending_actions confirmation.
- MVP intents only:
  - CONSULTAR_TAREAS
  - CONSULTAR_ACUERDOS
  - CREAR_TAREA_SOLICITUD
  - ACLARACION_REQUERIDA
  - DESCONOCIDO

Tasks:
1. Create `src/lib/hermes.ts` with:
   - Zod schema
   - TypeScript types
   - `parseHermesIntent({ text, exec })`
   - safeParse-based validation
   - timeout handling (8s)
   - fallback behavior
2. Update `src/adapters/telegram/bot.ts` to:
   - add `bot.on('message:text')`
   - ignore messages starting with `/`
   - call `evaluateAccess`
   - call `parseHermesIntent`
   - route validated results
3. Add a small Hermes intent router that:
   - executes reads for tasks and agreements
   - creates pending actions for task creation
   - responds directly for clarification/unknown
4. Extend pending action execution for:
   - `create_task` only in MVP
5. Keep code changes minimal and aligned with current repo conventions.
```

---

## 🛠️ Hallazgos Técnicos y Arquitectura Verificada

### 1. Punto de Inserción en el Bot
- **Archivo:** `src/adapters/telegram/bot.ts`
- **Mecanismo:** Registrar `bot.on('message:text')` **después** de los comandos `/start`, `/comunidad`, `/tareas`, `/acuerdos` y de los listeners de `callbackQuery`.
- **Filtro defensivo:** Ignorar mensajes que inicien con `/` (`if (ctx.message.text.startsWith('/')) return;`) y validar `evaluateAccess(ctx)` para asegurar que el usuario tenga identidad vinculada y comunidad activa antes de invocar al LLM.

### 2. Contrato de Datos y Esquema Zod (`src/lib/services/contracts.ts` y `src/lib/hermes.ts`)
```typescript
import { z } from 'zod';

export const HermesActionKindSchema = z.enum(['read', 'write', 'clarification', 'unknown']);

export const HermesIntentTypeSchema = z.enum([
  'CONSULTAR_TAREAS',
  'CONSULTAR_ACUERDOS',
  'CREAR_TAREA_SOLICITUD',
  'CAMBIAR_COMUNIDAD',
  'ACLARACION_REQUERIDA',
  'DESCONOCIDO'
]);

export const HermesParseResultSchema = z.object({
  kind: HermesActionKindSchema,
  intent: HermesIntentTypeSchema,
  confidence: z.number().min(0).max(1),
  params: z.object({
    titulo: z.string().trim().max(120).optional(),
    descripcion: z.string().trim().max(500).optional(),
    targetCommunityId: z.string().trim().optional()
  }),
  replyText: z.string().min(1).max(1000)
});
```

### 3. Matriz de Estado de Intents para el MVP

| Intent | Categoría | Estado de Soporte en Código | Ejecutor | Requiere `pending_actions` |
|---|---|---|---|---|
| `CONSULTAR_TAREAS` | Lectura | `[SUPPORTED]` | `getTareasByCommunity` / Admin SDK | ❌ No |
| `CONSULTAR_ACUERDOS` | Lectura | `[SUPPORTED]` | `getAcuerdosByCommunity` / Admin SDK | ❌ No |
| `CAMBIAR_COMUNIDAD` | Lectura/Escritura | `[SUPPORTED]` | `updateTelegramLastActiveCommunity` | ❌ No |
| `ACLARACION_REQUERIDA` | Aclaración | `[SUPPORTED]` | Respuesta directa de texto | ❌ No |
| `CREAR_TAREA_SOLICITUD` | Escritura | `[LOW CHANGE]` | `createPendingAction` + Teclado confirmación | ✅ **SÍ** |
| `CREAR_PROPUESTA_SOLICITUD` | Escritura | `[NOT SUPPORTED]` | Servicio requiere adaptación a Admin SDK | ✅ **SÍ** |

### 4. Seguridad y Flujo de Confirmación en 2 Pasos
- Hermes **nunca** escribe directamente en Firestore.
- Para intenciones de escritura (`CREAR_TAREA_SOLICITUD`), invoca `createPendingAction` guardando la acción en `/pending_actions` con un TTL de 15 min y muestra al usuario los botones inline nativos `buildPendingActionKeyboard(actionId)`.
- El dispatcher `executePendingAction()` en `src/lib/services/pendingActions.ts` procesa la escritura real únicamente cuando el usuario pulsa ✅ **Confirmar**.

---

## 🤖 System Prompt Base para Hermes

```markdown
You are Hermes, the natural language assistant for Kanarii on Telegram. Your task is to interpret user requests and produce a strict JSON output.

### Context:
The user is authenticated and operating within an active community. You will receive:
- UID: Current user ID
- Community: Active community slug
- Role: User role

### Rules:
1. NEVER invent or output SQL/database calls.
2. Output strictly valid JSON matching the specified schema.
3. For read requests (tasks/agreements), set kind="read".
4. For task creation requests, set kind="write" and intent="CREAR_TAREA_SOLICITUD". Extract the title into params.titulo.
5. If the request is ambiguous, set kind="clarification", intent="ACLARACION_REQUERIDA", and ask for details in replyText.
6. Set confidence as a float between 0.0 and 1.0.

### Output JSON Schema:
{
  "kind": "read" | "write" | "clarification" | "unknown",
  "intent": "CONSULTAR_TAREAS" | "CONSULTAR_ACUERDOS" | "CREAR_TAREA_SOLICITUD" | "CAMBIAR_COMUNIDAD" | "ACLARACION_REQUERIDA" | "DESCONOCIDO",
  "confidence": number,
  "params": {
    "titulo"?: string,
    "descripcion"?: string,
    "targetCommunityId"?: string
  },
  "replyText": string
}
```

---

## 📋 Archivos a Modificar cuando se Implemente

1. `src/lib/hermes.ts` (Nuevo): Wrapper de Gemini / LLM con schema Zod y timeout de 8s.
2. `src/adapters/telegram/bot.ts`: Agregar `bot.on('message:text')` y router de intenciones.
3. `src/lib/services/pendingActions.ts`: Implementar `executePendingAction()` para `create_task` con Admin SDK.
4. `.env` / `.env.local`: Asegurar `GEMINI_API_KEY` o `VITE_GEMINI_API_KEY`.
