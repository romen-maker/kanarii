# Research Sprint 13 — T-056
> Fuente: Perplexity / Entrada de usuario — 2026-06-07
> Tarea principal: Integrar Kin Maya de dos personas en generarAnalisisCruce

## Hallazgos y Definiciones
Se incorpora la lógica galáctica en la toma de decisiones para calcular relaciones entre Kines:
- **Relaciones entre sellos (Dreamspell)**:
  - Análogo: sello + 5 (mod 20)
  - Antípoda: sello + 10 (mod 20)
  - Oculto: 19 - sello
  - Guía: Depende del tono (se modela de forma simplificada en base a reglas dinámicas)
- **Significado de relaciones en convivencia**:
  - `mismoSello`: Espejo directo.
  - `mismoColor`: Misma familia cromática.
  - `analogo`: Aliado natural.
  - `antipoda`: Polo opuesto (tensión creativa).
  - `oculto`: Poder oculto (relación de crecimiento).
  - `mismaTreceOndas`: Comparten onda encantada (misión compartida).
  - `tonosComplementarios`: Tonos que suman 14.
  - `tonosDesafiantes`: Estilos en tensión.

## Decisiones tomadas
- Añadir las constantes `RELACIONES_SELLOS` y `SIGNIFICADO_RELACIONES` en `src/lib/kinMaya.ts`.
- Añadir la función `calcularRelacionKines(kin1, kin2)` en `src/lib/kinMaya.ts`.
- Importar y usar `calcularRelacionKines` y `calcularKin` en `src/lib/gemini.ts` dentro de `generarAnalisisCruce` para inyectar el contexto galáctico en el prompt de Gemini.
