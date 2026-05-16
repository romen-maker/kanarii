---
description: Apply RULE #1 when user proposes non-MVP idea
---

# Workflow: /focus - Reconducir al Foco MVP

**Ejecutar cuando:** Usuario propone idea que NO es MVP prioritario

## Pattern de Reconducción (5 pasos)

### 1. ✅ Validar la Idea
```
"Excelente idea para [beneficio de la idea]"
```

### 2. ❌ Explicar Por Qué NO es MVP
```
"Pero NO es MVP ahora porque:
- [Razón 1: falta prerequisito]
- [Razón 2: no impacta objetivo MVP]
- [Razón 3: podemos hacerlo después de validar]"
```

### 3. 📋 Documentar Dónde Se Guarda

**Evaluar dónde va:**
- **Sprint cercano (3-4):** Añadir a roadmap.md → "Ideas Backlog"
- **Futuro lejano (5+):** Añadir a roadmap.md → "Ideas Backlog"
- **Decisión arquitectónica:** Crear `docs/decisions/ADR-XXXX.md`

```
"📋 Voy a documentar esta idea en roadmap.md:
- Sprint X: [Nombre de la idea] - [descripción breve]"
```

### 4. 🎯 Reconducir al Foco

**Leer roadmap.md para saber foco actual:**
```
"🎯 Ahora volvamos al foco: [tarea prioritaria del sprint actual]"
```

### 5. ❓ Pedir Confirmación
```
"¿De acuerdo?"
```

## Ejemplo Completo

```
User: "Deberíamos hacer sprints semanales, reportes diarios, y un buzón de docs"

Agent:
"Excelentes ideas para mejorar la gestión del proyecto. Analicemos:

✅ Sprints semanales → Buena idea, pero primero terminemos Sprint 2
✅ Reportes diarios → Valioso para tracking, implementar cuando workflow funcione
✅ Buzón docs → Necesario para RAG, pero después de validar MVP

📋 Voy a documentar estas ideas en roadmap.md:
- Sprint 3: Sprints semanales + reportes diarios
- Sprint 4: Buzón de entrada de docs (pre-RAG)

🎯 Ahora volvamos al foco: arreglar workflow n8n para generar primer artículo.

¿De acuerdo?"
```

## Cuándo NO Usar Este Workflow

**NO reconducir si:**
- La idea ES MVP (revisar roadmap.md)
- Es un bug crítico que bloquea
- Es clarificación sobre tarea actual
- Es una decisión técnica necesaria para avanzar

## Archivos a Modificar

- `docs/roadmap.md` (añadir a Ideas Backlog)
- `docs/decisions/` (si es decisión arquitectónica)

## Archivos a Leer

- `docs/roadmap.md` (identificar sprint actual y foco)
- `.agents/ANTIGRAVITY_SYSTEM_PROMPT.md` (ejemplos de reconducción)
