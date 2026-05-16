---
description: Review and improve prompts for LLM agents
---

# Workflow: /prompt-review

**Ejecutar cuando:** Iteración de prompts, calidad baja, nuevo agente

## Proceso

### 1. Identificar Prompts

```
"¿Qué prompts revisar?"

- Agente específico → ContentGenerator, QualityValidator
- Rol específico → outline, sections, faqs
- Todos los prompts del proyecto
```

### 2. Localizar Prompts

```bash
# Buscar prompts en código
grep -r "You are\|Act as\|Your task" --include="*.py" agents/
```

Ubicaciones típicas:
- `agents/seo_writer/content_generator.py`
- `config/prompts/`
- Inline en funciones

### 3. Evaluar Cada Prompt

**Criterios de calidad:**

| Criterio | ❌ Malo | ✅ Bueno |
|----------|--------|---------|
| Rol | "Escribe algo" | "Eres experto SEO con 10 años..." |
| Instrucciones | Vagas | Paso a paso claro |
| Output format | Libre | JSON/Markdown estructurado |
| Few-shot | Sin ejemplos | 2-3 ejemplos concretos |
| Constraints | Sin límites | "Máx 500 palabras, evita..." |
| Error handling | Ignora | "Si no puedes, responde {}" |

### 4. Proponer Mejoras

```markdown
## Prompt Review: _generate_outline()

### Actual
```
Crea un outline para {keyword}
```

### Propuesto
```
Eres un estratega de contenido SEO con 10 años de experiencia.

Tu tarea: Crear un outline detallado para un artículo sobre: {keyword}

ESTRUCTURA OBLIGATORIA:
1. H1 (título con keyword)
2. Intro (2-3 frases, hook + thesis)
3. H2 sections (4-6 temas principales)
4. FAQ section (4-6 preguntas)
5. Conclusión con CTA

RESTRICCIONES:
- Cada H2 tendrá 400-600 palabras
- Keywords naturalmente distribuidas
- Evitar keyword stuffing

Responde en MARKDOWN estructurado.
```

### Mejora esperada
- Output más consistente
- Mejor adherencia a estructura
- Menos regeneraciones necesarias
```

### 5. Output

- Comparativa antes/después
- Métricas de mejora (si hay histórico)
- Prompts actualizados listos para usar

## Ejemplo

```
User: /prompt-review agents/seo_writer/

Agent:
"Analizando prompts en ContentGenerator...

Encontrados 4 prompts:
1. _generate_outline() → 🟡 Mejorable (sin few-shot)
2. _generate_sections() → 🟢 OK
3. _generate_products() → 🟡 Mejorable (output no estructurado)
4. _generate_faqs() → 🟢 OK

¿Quieres que proponga mejoras para los 2 prompts 🟡?"
```

## Métricas de Éxito

Después de aplicar mejoras:
- Tasa de regeneración: ↓ 30%
- E-E-A-T score promedio: ↑ 0.5 pts
- Consistencia de output: ↑ 40%
