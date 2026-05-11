---
description: Initialize agent for new session
---

# Workflow: /start - Inicio de Sesión

**Ejecutar cuando:** Nueva conversación o agente sin contexto

---

## 📚 PASO 1: Leer Contexto Completo (OBLIGATORIO)

Leer en este orden:

1. **`.agent/GEMINI.md`** (rules globales - CRÍTICO: RULE #0 + RULE #1)
2. **`.agent/ANTIGRAVITY_SYSTEM_PROMPT.md`** (prompt system completo)
3. **`.agent/AGENT_ONBOARDING.md`** (arquitectura del proyecto)
4. `.agent/context/` (infraestructura, servicios)
5. `docs/vision/` (visión alto nivel)
6. **`docs/roadmap.md`** → Identificar:
   - **Sprint actual** (sección "Fase Actual")
   - **Objetivo del sprint**
   - **Tareas pendientes** (sin checkear)
   - **Foco actual** (primera tarea sin `[x]`)

**Si hay `.agent` local del proyecto:**
- `projects/[proyecto]/.agent/context.md`

---

## 🎯 PASO 2: Presentar Foco del Sprint (PROACTIVO)

**NO preguntar "¿qué quieres hacer?"**
**SÍ presentar el foco del sprint:**

```
¡Hola Romén!

📍 Workspace: [raíz / kanairos / client_tds]

📅 Sprint X: [Nombre del Sprint]
🎯 Objetivo: [Objetivo del sprint]

Foco actual: [Tarea prioritaria del roadmap]
Completado: [X/Y tareas]

Referencias:
- RULE #1 (mantener foco): .agent/GEMINI.md
- Git workflow: .agent/workflows/git-branching.md
- Arquitectura: .agent/AGENT_ONBOARDING.md

¿Continuamos con [tarea prioritaria]?
```

---

## ⚠️ PASO 3: Si Usuario Propone Algo Fuera del Sprint

**Aplicar RULE #1 con valoración crítica** (patrón de 5 pasos):

1. 👂 **Escuchar y analizar:** Entender la propuesta completa
2. 🔍 **Valoración crítica:** 
   - ¿Es buena idea? → Explicar por qué SÍ o NO
   - ¿Está en Sprint actual? → Verificar roadmap
   - ¿Es MVP? → Aplicar criterios MVP
3. 📋 **Documentar SI PROCEDE:** 
   - Ideas buenas NO-MVP → `roadmap.md → Backlog/Sprint Y`
   - Ideas que NO aportan → Explicar por qué NO
4. 🎯 **Reconducir al foco:** "Volvamos a: [tarea sprint actual]"
5. ❓ **Pedir confirmación:** "¿De acuerdo?"

**Ejemplo:**
```
User: "Deberíamos crear estructura multi-contexto"

Agent:
"Analicemos la propuesta:

🔍 Valoración:
- ¿Es buena idea? SÍ - mejora organización de proyectos
- ¿Está en Sprint 2? NO - Sprint 2 es Content Generator
- ¿Es MVP? NO - necesitamos validar contenido primero

📋 Voy a documentar en roadmap.md → Sprint 3: Infraestructura

🎯 Volvamos al foco Sprint 2: content_generator.py

¿De acuerdo?"
```

**Si la idea NO es buena:**
```
User: "Deberíamos usar [tecnología innecesaria]"

Agent:
"Analicemos:

🔍 Valoración:
- NO es buena idea porque:
  * Ya tenemos [solución actual] que funciona
  * Añade complejidad sin beneficio claro
  * NO está alineada con MVP

❌ No la documento en roadmap.

🎯 Volvamos al foco: [tarea actual]
```

---

## 📋 PASO 4: Confirmar con Usuario

Esperar confirmación antes de empezar a trabajar.

---

## 🚨 PASO 5: Verificar Rama Git (ANTES DE HACER CAMBIOS)

**Solo DESPUÉS de confirmar qué vamos a trabajar:**

```bash
git branch --show-current
```

**¿Estamos en `main`?**
- ❌ **SÍ** → DETENER. Crear branch:
  ```bash
  git checkout -b feat/[descripcion-tarea]
  ```
  **NO hacer NINGÚN cambio hasta crear branch.**
  
- ✅ **NO** (en branch) → Continuar

**Referencia:** `.agent/workflows/git-branching.md`, RULE #0 en `GEMINI.md:213`

---

## 🐍 PASO 6: Activar Entorno Virtual

**SIEMPRE activar venv antes de hacer cambios de código:**

```bash
# Verificar si existe venv
ls -la | grep -E "venv|.venv"

# Si existe, activar
source .venv/bin/activate

# Verificar que está activado
which python
```

**Output esperado:** `/home/romen/Proyectos/Agencia_IA/.venv/bin/python`

**Si no existe venv:**
```
"⚠️ No detecto entorno virtual.

¿Necesitas que cree uno? O ya usas python global?"
```

---

## 📋 PASO 7: Estar Listo Para

- Responder preguntas sobre arquitectura
- **Aplicar RULE #1** si usuario se distrae
- Cargar contexto adicional si necesario
- **NUNCA trabajar fuera del sprint sin valorar críticamente primero**

---

## Archivos Críticos a Leer SIEMPRE

**Obligatorios (en orden):**
1. `.agent/GEMINI.md` → RULE #0 + RULE #1
2. `.agent/ANTIGRAVITY_SYSTEM_PROMPT.md` → Prompt system completo
3. `.agent/AGENT_ONBOARDING.md` → Arquitectura
4. `docs/roadmap.md` → Sprint actual + foco
5. `.agent/workflows/git-branching.md` → Workflow Git
6. `.agent/context/ (todos)

**Condicionales:**
- `docs/vision/` (visión alto nivel)
- `projects/[nombre]/.agent/context.md` (si workspace de proyecto)

---

## ✅ Checklist Interno del Agente

Antes de hacer CUALQUIER cambio:

- [ ] ¿Leí GEMINI.md y entiendo RULE #0 + RULE #1?
- [ ] ¿Leí ANTIGRAVITY_SYSTEM_PROMPT.md?
- [ ] ¿Leí AGENT_ONBOARDING.md?
- [ ] ¿Identifiqué sprint actual y foco?
- [ ] ¿Presenté el foco proactivamente?
- [ ] ¿Usuario confirmó qué vamos a trabajar?
- [ ] ¿Verifiqué que estamos en branch (no main)?
- [ ] ¿Listo para aplicar RULE #1 con valoración crítica?