# Research Sprint 14
> Fuente: Perplexity — 2026-06-07
> Tarea principal: Arquitectura IA en capas — separar JSON estructurado (Capa 1) de narrativa on-demand (Capa 2)

## Hallazgos clave

### 1. ResponseSchema en `@google/genai`
- `gemini-2.0-flash` y `gemini-2.5-flash` soportan `responseMimeType: "application/json"` + `responseSchema`.
- Desde finales de 2025: soporte JSON Schema completo (`anyOf`, `$ref`, `minimum/maximum`, `additionalProperties`).
- El schema se procesa como tokens de entrada.
- `enum` solo soporta `Type.STRING` nativamente.
- Validadores como `minLength`/`maxLength` se ignoran silenciosamente.
- `anyOf` con >3 variantes degrada adherencia al schema.
- Optimal en flujos de un solo turno (no tool calls).

### 2. Patrón de generación Cruce (doble flujo)
- **Capa 1**: `generarCruceInsights()` → JSON con `responseSchema` + `responseMimeType: "application/json"`. Incluye `kinMayaContext`.
- **Capa 2**: `generarCruceNarrativa()` → Markdown libre, recibe el JSON de Capa 1 como contexto. Sin `kinMayaContext` (ya embebido en insights).
- Advertencia latencia: mostrar JSON estructurado reactivamente mientras narrativa se genera.

### 3. Patrón lazy generation para Manual
- Estrategia: `perfilVisual` (ya destilado) como base en vez de `datosBrutos` → ahorra ~75% tokens.
- 5 secciones atómicas: `adn_astral`, `anatomia_poder`, `espejo_tribu`, `sintonia_cnv`, `mantenimiento_crisis`.
- Cache plano en `/fichas/{uid}` con campos `resumenManual` (mapa sección→contenido) y `resumenManualHash`.

### 4. Hashing determinista en browser
- `btoa(JSON.stringify())` descartado: el orden de propiedades en objetos JS no es determinista → hashes distintos por mismos datos.
- Recomendado: algoritmo `djb2` sobre array ordenado de campos explícitos.
- Incluir `perfilVisual.arquetipo` en el hash para invalidar automáticamente el manual si cambia el perfil visual.

## Decisiones tomadas
- **Decisión:** Usar `responseSchema` con `Type.*` del SDK `@google/genai` para Capa 1 de Cruce.
- **Por qué:** Elimina regex frágil, garantiza JSON tipado.
- **Constraint clave:** Schema cuenta como tokens de entrada.

- **Decisión:** `djb2` en vez de `btoa` para `getFichaHash`.
- **Por qué:** Determinismo garantizado con campos ordenados explícitamente.
- **Constraint clave:** `getFichaHash` ya existe con `btoa` → refactorizar.

- **Decisión:** Cache plano en `/fichas/{uid}` con `resumenManual` + `resumenManualHash`.
- **Por qué:** ADR-014 prohíbe subcolecciones innecesarias.
- **Constraint clave:** Invalidación completa si hash cambia.

- **Decisión:** `perfilVisual` como fuente de prompts de sección, no `datosBrutos`.
- **Por qué:** Reduce tokens ~75% y mantiene coherencia entre perfil visual y manual.

## Descartado
- `btoa(JSON.stringify())` para hashing — no determinista por orden de props.
- `crypto.subtle` — requiere async y es overkill para este caso.
- Subcolección `/fichas/{uid}/manual_secciones` — violación ADR-014.
- `anyOf` con >3 variantes en responseSchema — degradación de calidad.
- Enviar `datosBrutos` completos en cada prompt de sección — exceso de tokens.
