# Workflow: Optimización Diaria de Tokens — Kanarii
> Flujo completo. Aplicar desde hoy en cada sesión de desarrollo.

---

## Visión general del flujo

```
Perplexity (investigación)
        ↓
  task-XXX.md (Directive)
        ↓
  Antigravity (Execution)
        ↓
  /compress → /clear
        ↓
  git commit + archiva task
```

---

## FASE 0 — Antes de abrir Antigravity

**Herramienta: Perplexity o texto plano. Duración: 5-10 min.**

1. Define la tarea usando el template `.agents/tasks/_template.md`:
   - ¿Qué debe funcionar al terminar? (una frase)
   - ¿Qué archivos están implicados? (lista solo los relevantes)
   - ¿Cuál es el criterio de done?
   - ¿Qué NO entra en esta tarea? (previene scope creep)

2. Si la tarea requiere investigación técnica, hazla en **Perplexity**
   antes de abrir Antigravity. Guarda el resultado en el task file.
   → Esto gasta 0 tokens de Antigravity.

3. Decide el modelo antes de abrir la sesión:
   - **Pro** → feature nueva, refactor > 3 archivos, decisión arquitectónica
   - **Flash** → bug fix concreto, edición de docs, pregunta rápida, lectura de código

**Señal de que estás listo:** tienes el task file escrito y sabes qué modelo usar.

---

## FASE 1 — Inicio de sesión en Antigravity

**Duración recomendada de sesión: máx. 45-60 min por tarea.**

```
Mensaje 1 (único):
"Activa skill implementar-feature-dry.
[Pega aquí el contenido completo de task-XXX.md]"
```

Reglas del primer mensaje:
- ✅ Pega el task file completo — no expliques lo que ya está escrito
- ✅ Activa la skill relevante en el mismo mensaje
- ❌ No empieces con «Hola, necesito que...»
- ❌ No des contexto que no está en el task file

---

## FASE 2 — Durante la sesión

### Control de contexto
| Señal | Acción |
|-------|--------|
| 15-20 mensajes acumulados | `/compress` — resume el historial |
| Cambias de tarea | `/clear` — sesión nueva |
| El agente lleva 3+ mensajes sin código | Interrumpe: «caveman mode» |
| El agente lee archivos no relacionados | Interrumpe: «solo estos archivos: [lista]» |
| 30+ mensajes sin `/compress` | ⚠️ Estás quemando tokens |

### Señales de sesión sana
- El agente propone plan → tú apruebas → el agente ejecuta
- Respuestas cortas con código directo (caveman.md activo)
- Una sola feature avanzando sin bifurcaciones

### Señales de sesión problemática
- El agente está "pensando en voz alta" durante varios mensajes
- Estás explicando contexto que ya está en AGENTS.md o GEMINI.md
- Han aparecido dos tareas distintas en la misma sesión

---

## FASE 3 — Cierre de sesión

```
1. Confirmación visual obligatoria antes del commit
   (regla visual-confirm-before-commit.md activa)

2. Si la tarea está DONE:
   - Actualiza task-XXX.md → estado: DONE
   - mv .agents/tasks/task-XXX.md .agents/tasks/_archived/

3. Si la tarea está IN_PROGRESS:
   - Actualiza task-XXX.md con el estado actual
   - Anota qué falta y qué decisiones se tomaron

4. git commit siguiendo el Git Workflow de GEMINI.md

5. /quit → revisa el resumen de uso si está disponible
```

---

## Modelo por tipo de tarea (referencia rápida)

| Tarea | Modelo | Dónde trabajar |
|-------|--------|----------------|
| Investigación, comparar opciones | — | Perplexity (externo, 0 tokens Antigravity) |
| Planning / arquitectura compleja | Pro | Antigravity, sesión corta |
| Feature nueva (> 3 archivos) | Pro | Antigravity |
| Refactor con lógica compleja | Pro | Antigravity |
| Bug fix concreto y localizado | Flash | Antigravity |
| Editar GEMINI.md / reglas / docs | Flash | Antigravity o editor directo |
| Leer y entender código existente | Flash | Antigravity |
| Testing / validación | Flash | Antigravity |
| Pregunta rápida de sintaxis/API | Flash | Antigravity |

---

## Gestión de skills por sesión

### Al inicio
Activa solo las skills que necesita esta tarea concreta.
No actives skills "por si acaso".

### Al final (auditoría semanal)
```bash
# Revisar skills activas
ls .agents/skills/

# Archivar las que no has usado esta semana
mv .agents/skills/nombre-skill .agents/skills/_archived/nombre-skill
```

### Criterio de archivo
- No usada en > 2 semanas → `_archived/`
- Skills Firebase genéricas si tienes `firebase-kanarii` → `_archived/`
- Skills de onboarding una vez el proyecto está maduro → `_archived/`

---

## Señales de alerta de optimización

Estás quemando tokens sin necesidad cuando:
- [ ] Empiezas una sesión sin task file escrito
- [ ] La sesión lleva > 30 mensajes sin `/compress`
- [ ] Estás en la segunda tarea de la misma sesión
- [ ] El agente está leyendo archivos no mencionados en el task file
- [ ] Tienes > 8 skills activas en `.agents/skills/`
- [ ] No has archivado ninguna skill en > 2 semanas

---

## Resumen del stack de optimización

```
AGENTS.md (raíz)           → Contexto mínimo siempre cargado
caveman.md (rule)          → Elimina verbosidad automáticamente
skill-manager (skill)      → Gestiona el ciclo de vida de skills
doe-framework (skill)      → Estructura tareas antes de abrir Antigravity
_archived/ (carpeta)       → Skills inactivas fuera del contexto de sesión
tasks/ (carpeta)           → Task files DOE — una tarea, un archivo
/compress (comando)        → Reduce contexto acumulado cada 15-20 msgs
/clear (comando)           → Sesión nueva entre tareas distintas
Perplexity (externo)       → Investigación y planning sin coste de tokens
```
