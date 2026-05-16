---
name: tech-scout
description: Busca, evalúa y compara librerías, paquetes npm y SDKs antes de añadir dependencias al proyecto. Úsala cuando el usuario pregunte qué librería usar, quiera comparar opciones o necesite validar una dependencia nueva.
---

# Tech Scout (Explorador de Dependencias)

Esta habilidad es tu departamento de I+D personal. Su misión es evitar reinventar la rueda buscando bibliotecas, herramientas o SDKs dentro del ecosistema npm que ya resuelvan el problema planteado, asegurando compatibilidad con el stack de Kanarii.

## Prerrequisitos
- Acceso a herramientas de búsqueda (`perplexity`, `search_web`).

## Instrucciones

### 1. Análisis de Requerimientos
Antes de buscar, define los criterios técnicos del stack:
- **Lenguaje**: TypeScript (TS).
- **Framework**: React.
- **Ecosistema**: Vite + Firebase (Firestore/Auth).
- **Funcionalidad Clave**: ¿Qué debe hacer exactamente?

### 2. Ejecución de Búsqueda
Usa las herramientas disponibles en este orden de preferencia:

1.  **Perplexity**:
    - Prompt: "Find best npm packages for [task] in a React + Vite + Firebase environment. Prioritize active maintenance and TypeScript support. Compare top 3 options."
2.  **Web Search (Reddit & StackOverflow)**:
    - Query: "best react library for [task] reddit"
    - Query: "[library-A] vs [library-B] react 2025"
3.  **Búsqueda Técnica (NPM Trends / Bundlephobia)**:
    - Investiga el volumen de descargas y el peso del bundle si la información no es clara en los pasos anteriores.

### 3. Evaluación (Matriz de Calidad)
Para cada candidato, evalúa los siguientes puntos:

| Criterio | Requerimiento MVP |
| :--- | :--- |
| **Compatibilidad** | Soporte para React, Vite (ESM) y Firebase. |
| **TypeScript** | Tipado nativo (preferido) o `@types` de calidad. |
| **Peso (Bundle)** | Tamaño ligero para no penalizar el rendimiento móvil. |
| **Actividad** | Commits frecuentes y buena gestión de issues. |
| **Licencia** | Permisiva (MIT, Apache 2.0). |
| **Riesgo Lock-in** | Nivel de dependencia de servicios externos no-Firebase. |

### 4. Validación Social
Busca opiniones reales para detectar "banderas rojas":
- Hilos de Reddit sobre problemas de performance o bugs conocidos.
- Dificultades de integración reportadas en StackOverflow.
- Facilidad de uso y calidad de la documentación.

### 5. Reporte de Resultados
Presenta al usuario una tabla comparativa clara:

| Librería | Licencia | Peso | Compatibilidad | Pros | Contras | Recomendación |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `lib-A` | MIT | 5kb | Alta | Nativa TS, Ligera | Pocos temas | ✅ Opción #1 |
| `lib-B` | Apache | 45kb | Media | Muy potente | Pesada, no-ESM | ⚠️ Solo si necesitas X |

### 6. Acción Post-Scout
- Si hay un ganador claro: **Proponer usarlo (`npm install [package]`)**.
- Si no hay opciones viables: **Proceder a construir una solución personalizada (Custom)**.

---

*Última actualización: 15 May 2026*
