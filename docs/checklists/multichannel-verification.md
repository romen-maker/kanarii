# Checklist de Verificación y Arquitectura Multicanal (HTTP, Telegram, MCP)

> **Sprint 22** | Documento Inmutable de Contrato Arquitectónico Multicanal | Kanarii

---

## 1. Contrato de Seguridad e Identidad Multicanal

Todos los canales de entrada (HTTP Web App, Telegram Bot, Servidor MCP) deben validar y respetar las mismas reglas de seguridad de datos:

- [ ] **Validación Cuádruple de Identidad:**  
  1. `telegramUserId` / `userId` válido y autenticado.  
  2. Coincidencia entre el solicitante y el destinatario de la acción (`action.userId === req.userId`).  
  3. Comprobación de Token de confirmación (efímero, 5 min TTL para binning / 15 min para acciones sensibles).  
  4. Expiración explícita con feedback de error claro (`TOKEN_EXPIRED`).

- [ ] **Resolución Unificada de Roles (`community_members`):**  
  - **`admin`**: Acceso a configuración, cruce de perfiles y auditoría completa.  
  - **`member`**: Acceso a tareas, proyectos, propuestas y acuerdos de su comunidad.  
  - **`visitante`**: Cuentas no vinculadas o no registradas en la comunidad activa. Acceso bloqueado con error expresivo.

- [ ] **Auditoría Inmutable (`logAuditEvent`):**  
  Toda acción ejecutada a través de cualquier canal debe registrar un evento de auditoría con `userId`, `communityId`, `channel` ('http' | 'telegram' | 'mcp'), `agentId`, `sourceAction` y `status`.

---

## 2. Arquitectura de Flujo del Asistente Multicanal (6 Fases)

Cualquier extensión futura del asistente multicanal (integración con Google Drive, lectura multimodal, descomposición de proyectos) debe ajustarse obligatoriamente a esta secuencia determinista:

```
[1. Entrada Multimodal] → [2. Interpretación de Intención] → [3. Resumen al Usuario]
                                                                        ↓
[6. Ejecución Auditada] ← [5. Aprobación Explícita] ← [4. Propuesta de Acción]
```

1. **Entrada Multimodal (Text / Voice):**  
   Captura de la instrucción por cualquier canal (Texto web, comando/audio de Telegram, prompt MCP).
2. **Interpretación de Intención (Intent Parser):**  
   Clasificación determinista de la intención (ej: consultar tareas, crear propuesta, buscar documentos en Drive, solicitar colaboración).
3. **Resumen de lo Entendido (Feedback de Confirmación):**  
   El asistente presenta de forma transparente un resumen humano del objetivo interpretado.
4. **Propuesta de Acción (Action Proposal):**  
   Descomposición de la intención en acciones atómicas:
   - Resumen de propuestas de proyecto.
   - Descomposición en tareas atómicas.
   - Sugerencia de responsables según perfil (`Ficha`: habilidades, diseño humano, disponibilidad).
5. **Aprobación Explícita (Explicit Consent Guard):**  
   Generación de `PendingAction` con botones interactivos (`Confirmar` / `Cancelar`) enviados al mensaje privado del usuario antes de mutar cualquier estado.
6. **Ejecución Auditada (Deterministic Execution):**  
   Llamada a las funciones de `src/lib/services/` y registro inmediato de `logAuditEvent`.

---

## 3. Matriz de Verificación de Canales

| Canal | Autenticación | Resolución de Rol | Confirmación Sensible | Auditoría |
|---|---|---|---|---|
| **HTTP Web App** | Firebase Auth | `community_members` | Toast / Modal | `logAuditEvent` |
| **Telegram Bot** | `/user_telegram_identities` | `attachExecutionCtx()` | `InlineKeyboard` (PendingAction) | `logAuditEvent` |
| **Servidor MCP** | `validateMcpAccess` | `getMemberInfo` | `validateMcpAccess` | `logAuditEvent` |

---

*Última actualización: Julio 2026 — Sprint 22*
