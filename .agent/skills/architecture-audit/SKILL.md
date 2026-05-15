---
name: architecture-audit
description: Realiza auditorías técnicas del código de Kanarii para detectar violaciones de arquitectura, dependencias incorrectas, duplicidades y componentes fuera de su capa. Actívala antes de un refactor o cuando un archivo supere las 300 líneas.
---

# Skill: Architecture Audit (Experto en Limpieza)

Realiza auditorías técnicas profundas para asegurar que el código sigue los estándares de arquitectura de Kanarii.

## Cuándo usar
- Antes de empezar un refactor.
- Cuando una página crece demasiado (> 300 líneas).
- Para verificar el cumplimiento de las reglas DRY y de capas.

## Proceso de Auditoría
1. **Mapeo de Dependencias**: Identificar imports de `appService` o `firestore` en archivos de `src/pages`.
2. **Análisis de Lógica**: Buscar `useState` y `useEffect` que manejen datos de negocio en lugar de delegar a hooks.
3. **Detección de Duplicidad**: Encontrar patrones de mutación (try/catch + toast) que no usen `useEntityActions`.
4. **Validación Visual**: Verificar que se usen componentes de `src/components/ui` (como `EntityCard`) en lugar de implementaciones locales.

## Output del Skill
El resultado debe ser un reporte detallado (como el del plan de implementación) que incluya:
- Tabla de violaciones por archivo.
- Gravedad del incumplimiento.
- Plan de acción sugerido con pasos atómicos.

## Comando de Activación
- `/audit` o "Haz una auditoría de arquitectura de [componente/directorio]".

---

*Última actualización: 15 May 2026*
