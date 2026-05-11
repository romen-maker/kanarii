---
name: tech-scout
description: Realiza investigación técnica para encontrar soluciones Open Source existentes antes de desarrollar desde cero.
---

# Tech Scout (Explorador Técnico)

Esta habilidad es tu departamento de I+D personal. Su misión es evitar reinventar la rueda buscando bibliotecas, herramientas o componentes de código abierto que ya resuelvan el problema planteado.

## Prerrequisitos
- Acceso a herramientas de búsqueda (`perplexity`, `search_web`, `search_repositories` de GitHub).

## Instrucciones

### 1. Análisis de Requerimientos
Antes de buscar, define:
- **Lenguaje**: (Python, JS, etc.)
- **Funcionalidad Clave**: ¿Qué debe hacer exactamente?
- **Licencia Permitida**: MIT, Apache 2.0, BSD (según `.agent/context/tools-policy.md`).

### 2. Ejecución de Búsqueda
Usa las herramientas disponibles en este orden de preferencia:

1.  **Perplexity** (Si disponible):
    - Prompt: "Find best open source [language] libraries for [task]. Prioritize active maintenance, MIT/Apache license. Compare top 3 options."
2.  **GitHub Search**:
    - Query: `topic:[task] language:[language] stars:>100 sort:updated`
3.  **Web Search**:
    - Query: "best python library for [task] 2025 open source"

### 3. Evaluación (Scorecard)
Para cada candidato prometedor, verifica:
- [ ] **Licencia**: ¿Es permisiva?
- [ ] **Actividad**: ¿Último commit hace < 6 meses?
- [ ] **Popularidad**: Estrellas/Descargas (proxy de estabilidad).
- [ ] **Documentación**: ¿Tiene README claro y ejemplos?

- [ ] **Documentación**: ¿Tiene README claro y ejemplos?

### 4. Validación Social (Reddit)
Antes de decidir, busca opiniones reales en la comunidad:
1. Usa `reddit-tracker` en modo búsqueda:
   ```bash
   .venv/bin/python .agent/skills/reddit-tracker/scripts/search_subreddit.py python "best library for [task]"
   ```
2. Busca hilos de "X vs Y" para ver quejas comunes o recomendaciones.
3. Si la comunidad odia una herramienta, anótalo como bandera roja.

### 5. Reporte de Resultados
Presenta al usuario (o al plan) una tabla comparativa:

| Solución | Licencia | Actividad | Pros | Contras | Recomendación |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `lib-A` | MIT | Alta | Rápida, Ligera | Poca doc | ✅ Opción #1 |
| `lib-B` | GPL | Media | Potente | Licencia vírica | ❌ Descartada |

### 6. Acción Post-Scout
- Si hay un ganador claro: **Proponer usarlo (`pip install`)**.
- Si no hay opciones viables: **Proceder a construir desde cero (Custom)**.
