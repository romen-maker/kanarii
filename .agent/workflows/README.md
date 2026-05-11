# Agent Workflows

Workflows son prompts guardados que el agente puede seguir. Para activar un workflow, escribe `/` en el chat.

---

## 📋 Workflows Disponibles

### `/start` - Inicializar Sesión
**Cuándo usar:** Nueva conversación o agente sin contexto

**Qué hace:**
- Lee `ANTIGRAVITY_SYSTEM_PROMPT.md` y `roadmap.md`
- Identifica sprint actual y foco prioritario
- Contextualiza al agente automáticamente

**Ejemplo:**
```
User: /start

Agent: ¡Hola! Estamos en Sprint 2: Content Generator
Foco actual: Arreglar workflow n8n
¿Continuamos?
```

---

### `/roadmap` - Ver Estado del Sprint
**Cuándo usar:** Quieres ver progreso del proyecto

**Qué hace:**
- Lee `roadmap.md`
- Muestra tareas completadas vs pendientes
- Indica próxima prioridad

**Ejemplo:**
```
User: /roadmap

Agent: 📊 Sprint 2: Content Generator
✅ Completado: 11/15 tareas
Próxima prioridad: Fix n8n workflow
```

---

### `/focus` - Reconducir al Foco
**Cuándo usar:** Propones idea fuera de MVP

**Qué hace:**
- Aplica RULE #1 (patrón de 5 pasos)
- Valida tu idea
- Explica por qué NO es MVP
- Documenta en roadmap.md
- Te reconoce al foco actual

**Ejemplo:**
```
User: Hagamos sprints semanales

Agent: Excelente idea, pero NO es MVP porque...
📋 Lo documento en roadmap.md → Sprint 3
🎯 Volvamos al foco: workflow n8n
¿De acuerdo?
```

---

### `/tools` - Proponer Herramientas
**Cuándo usar:** Necesitas nueva herramienta

**Qué hace:**
- Aplica RULE #3 y `.agent/context/tools-policy.md`
- Propone 3 opciones (OSS / Free SaaS / Premium)
- Pregunta qué herramientas premium tienes
- Documenta decisión

**Ejemplo:**
```
User: Necesito base de datos vectorial

Agent: Propongo 3 opciones:
1. ChromaDB (OSS, self-hosted)
2. Qdrant Cloud (tier gratuito)
3. ¿Tienes Pinecone?
¿Cuál prefieres?
```

---

### `/tests` - Ejecutar Tests
**Cuándo usar:** Antes de merge, después de añadir funcionalidad

**Qué hace:**
- Ejecuta `pytest tests/ -v`
- Reporta resultados y cobertura
- Evalúa si faltan tests
- Propone crear tests nuevos

**Ejemplo:**
```
User: /tests

Agent: 📊 Resultados:
✅ Pasados: 15/15
Cobertura: 78%
⚠️ Falta test para /seo/generate-article
¿Lo creo ahora?
```

---

### `/feature-complete` - Completar Feature Branch
**Cuándo usar:** Feature está lista para merge a main

**Qué hace:**
- Lee `DEFINITION_OF_DONE.md`
- Ejecuta checklist completo:
  - Code quality ✅
  - Tests (propone crear si faltan) ⚠️
  - Documentation ✅
  - Git hygiene ✅
- Pre-merge checks
- Merge a main con confirmación
- Recuerda que main auto-despliega

**Ejemplo:**
```
User: /feature-complete

Agent: Revisando feat/content-generator...
✅ Code quality OK
⚠️ Faltan tests para ContentGenerator
📋 Propongo crear tests antes de mergear
¿Procedo?
```

---

## 🔄 Flujo de Trabajo Típico

### Inicio de Sesión
```
1. /start → Contextualizar
2. /roadmap → Ver estado
```

### Durante Desarrollo
```
3. Trabajar en tarea
4. Si propones idea → Agent usa /focus automáticamente
5. Si necesitas herramienta → /tools
```

### Antes de Merge
```
6. /tests → Verificar que pasan
7. /feature-complete → Completar checklist
8. Merge a main (auto-deploy)
```

---

## 📝 Crear Nuevo Workflow

Los workflows son archivos Markdown en `.agent/workflows/` con este formato:

```markdown
---
description: Short description of when to use this
---

# Workflow: /nombre - Título

**Ejecutar cuando:** [situación]

## Acciones

1. Paso 1
2. Paso 2
...

## Ejemplo

[Ejemplo de uso]

## Archivos a Leer/Modificar

- [Archivos relevantes]
```

**Límite:** 12,000 caracteres por workflow

---

## 🎯 Workflows vs System Prompt

**ANTIGRAVITY_SYSTEM_PROMPT.md:**
- Documento completo de referencia (19k chars)
- Contexto del proyecto específico
- Ejemplos detallados

**Workflows:**
- Comandos accionables (<12k chars cada uno)
- Leen el system prompt cuando lo necesitan
- Reutilizables y memorizables

**Ventaja:** Zero duplicación, workflows cortos que referencian el doc completo.

---

*Última actualización: 15 Dic 2025*
