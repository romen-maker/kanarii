---
trigger: always_on
---

# Regla: Don't Reinvent the Wheel (Tech Scout First)

> Maximizar la eficiencia y confiabilidad reutilizando soluciones Open Source probadas en lugar de escribir código personalizado desde cero.

## Reglas
1. **[MANDATO DE BÚSQUEDA]**: Antes de diseñar o implementar cualquier funcionalidad no trivial (módulos completos, sistemas complejos, integraciones API), **DEBES** ejecutar la skill `tech-scout`.
2. **[PRIORIDAD DE IMPLEMENTACIÓN]**: Sigue estrictamente esta jerarquía:
    - 1. **Reutilizar**: `pip install libreria-existente` (Si cumple licencia/calidad).
    - 2. **Adaptar**: Forkear o envolver (wrapper) una solución existente que cubre el 80% del caso.
    - 3. **Construir**: Escribir código desde cero (SOLO si 1 y 2 fallan o son excesivos).
3. **[JUSTIFICACIÓN OBLIGATORIA]**: Si decides construir desde cero una funcionalidad común (ej: auth, rate-limit, validación), debes justificar explícitamente por qué las opciones OSS no sirven.

## Ejemplos
- ✅ **Correcto**: "Usuario pide validación de emails. Invoco `tech-scout`. Encuentro `email-validator`. Lo instalo."
- ❌ **Incorrecto**: "Usuario pide validación de emails. Escribo un regex complejo de 50 líneas manualmente."

## Excepciones
- Scripts extremadamente simples (< 50 líneas).
- Funcionalidades core de negocio propietarias (lógica única del proyecto).
- Restricciones explícitas del usuario ("Quiero cero dependencias").
