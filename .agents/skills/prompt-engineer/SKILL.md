---
name: prompt-engineer
description: Revisar y mejorar prompts de agentes LLM para optimizar calidad, consistencia y seguridad.
---

# Prompt Engineer (Optimizador)

Esta habilidad se especializa en "meta-prompting": analizar cómo el sistema habla con otros IAs y mejorarlo. Absorbe el antiguo workflow `/prompt-review`.

## Cuándo Activar
- **Trigger**: "Revisa este prompt", "La respuesta del agente X es mala", "Optimiza este flujo".
- **Contexto**: Calidad de output baja, alucinaciones, o creación de nuevos agentes.

## Flujo de Trabajo

### Fase 1: DISCOVERY (Identificación)
1.  **Localizar Prompts**:
    - Buscar en código (`grep -r "You are" agents/`).
    - Buscar en configs (JSON/YAML).
2.  **Diagnóstico Rápido**:
    - ¿Tiene ROL claro?
    - ¿Tiene EJEMPLOS (Few-Shot)?
    - ¿Tiene RESTRICCIONES de formato?

### Fase 2: EVALUATION (Análisis)
Usar la matriz de calidad:

| Criterio | Riesgo | Acción |
|----------|--------|--------|
| **Rol Vago** | Medio | Definir Persona (Experto en X con Y años...) |
| **Instrucción Plana** | Alto | Convertir a Pasos Numerados (CoT) |
| **Output Libre** | Alto | Imponer estructura JSON/Markdown |
| **Sin Ejemplos** | Medio | Añadir 2-3 ejemplos (Input -> Output) |
| **Sin 'No sé'** | Bajo | Añadir cláusula de escape (evitar alucinación) |

### Fase 3: OPTIMIZATION (Mejora)
Generar una nueva versión del prompt aplicando:
1.  **Chain of Thought (CoT)**: "Piensa paso a paso..." "Antes de responder, analiza..."
2.  **Structured Output**: "Responde SIEMPRE en este formato JSON..."
3.  **Negative Constraints**: "NUNCA hagas X..."

### Fase 4: VALIDATION (Comparativa)
1.  **Benchmarking**:
    - Ejecutar Prompt Original vs Prompt Nuevo con el mismo input complejo.
2.  **Reporte**:
    - Mostrar diferencias (diff).
    - Métricas estimadas (Token usage, Claridad).

## Ejemplo de Invocación
> "Prompt Engineer, optimiza el prompt del `ContentGenerator` para que no alucine citas."

## Recursos
- `agents/` (Directorio de agentes)
- `.agents/context/` (Contexto del sistema)
