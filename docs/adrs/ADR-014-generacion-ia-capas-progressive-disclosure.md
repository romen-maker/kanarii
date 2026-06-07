# ADR-014: Generación de Contenido IA en Capas (Progressive Disclosure)

**Estado:** Propuesta  
**Fecha:** 2026-06-07  
**Autores:** Investigación colectiva (Perplexity + NotebookLM + revisión manual del código)  
**Relacionado con:** ADR-002 (Firestore), ADR-007 (modularización appService), gemini.ts

---

## Contexto y Problema

El archivo `src/lib/gemini.ts` tiene actualmente dos funciones monolíticas:

- `generarManual()` — genera las 5 secciones del Manual Galáctico en un único prompt de ~2500 tokens de salida esperada.
- `generarAnalisisCruce()` — pide a Gemini un JSON estructurado (`AnalisisCruceStructured`) **y** una narrativa Markdown larga en el mismo prompt, separándolos después con un regex frágil. Si Gemini omite los backticks, el parse falla con `structured: null as any`.

Esto genera tres problemas documentados:

1. **Sobrecarga cognitiva**: el usuario recibe un muro de texto de golpe sin jerarquía de lectura.
2. **Riesgo de alucinación**: prompts y outputs largos aumentan la probabilidad de pérdida de formato y divagación, especialmente en la parte estructurada del cruce.
3. **Gasto ineficiente de tokens**: se paga por generar secciones narrativas largas que el usuario puede no leer en esa sesión.

---

## Decisión

Adoptar una **arquitectura de generación en capas** inspirada en el patrón de Progressive Disclosure, diferenciada por componente:

### Manual Galáctico — 3 Capas

```
Capa 0 — Determinista (0ms, sin Gemini)
  Datos calculados localmente: nombre_kin, sello, tono, onda_encantada,
  arquetipo (ya en perfilVisual), fortalezas, sombras.
  Siempre disponible. Renderiza inmediatamente al abrir ManualViewer.

Capa 1 — Píldoras JSON (Gemini, persistido en Firestore)
  Nueva función: generarResumenManual()
  Output: objeto JSON con 2 frases impactantes por cada una de las 5 pestañas.
  Se genera UNA vez. Se guarda como campo plano en /fichas/{uid}.resumenManual
  junto a un campo /fichas/{uid}.resumenManualHash (ver ADR-015).
  Si el hash coincide con el perfil actual → se sirve sin llamar a Gemini.
  kinMayaContext se inyecta AQUÍ y solo aquí.

Capa 2 — Narrativa completa por pestaña (Gemini, efímera)
  Nueva función: generarSeccionManual(tab, resumenContext)
  Se llama solo cuando el usuario pulsa "Leer desarrollo completo" en una pestaña.
  Recibe el JSON de Capa 1 como contexto para garantizar coherencia.
  NO se persiste en Firestore.
  SÍ se cachea en estado React (Map<tab, string>) durante la sesión activa
  para evitar re-generación al cambiar de pestaña.
  kinMayaContext NO se inyecta aquí (ya está en Capa 1).
```

### Cruce — 2 Capas

```
Capa 0 — Determinista (0ms, sin Gemini)
  Porcentaje de sinergia, tipo_relacion_kin, canales_compartidos.
  Calculado por cruzarMiembros(). Renderiza inmediatamente.

Capa 1 — Insights JSON (Gemini, persistido en Firestore)
  Nueva función: generarCruceInsights(perfil1, perfil2, resultadoDeterminista)
  Output: { arquetipo_relacional, clima_grupal_alerta, mapa_rangos,
            canales_enriquecidos, cnv_ganchos[], sombras_resumen[] }
  Se persiste en /cruces/{id}.insights + /cruces/{id}.insightsHash.
  kinMayaContext se inyecta AQUÍ si aplica.

Capa 2 — Narrativa completa (Gemini, efímera, on-demand)
  Nueva función: generarCruceNarrativa(insightsJSON)
  Recibe el JSON de Capa 1 como contexto.
  El prompt instruye explícitamente: "Usa ESTRICTAMENTE los gancho_proyectivo
  y necesidad definidos en el JSON. No inventes nuevas áreas de fricción."
  Se cachea en estado React durante la sesión. No va a Firestore.
```

---

## Manual Galáctico — Descarga en PDF

Se añade la posibilidad de que el usuario descargue su Manual como PDF una vez
que todas las secciones de Capa 2 estén generadas en sesión.

- **Implementación**: `html2canvas` + `jsPDF` sobre el contenido ya renderizado en DOM.
  Sin pasar por Firebase Storage — descarga directa en el navegador.
- **Campo opcional en Firestore**: `/fichas/{uid}.manualPdfUrl` (string | null).
  Input editable en ManualViewer para que el usuario pegue el link donde guardó
  su PDF (Drive, Notion, etc.). La app no gestiona el almacenamiento del PDF.
- **Efecto sobre la efimeridad**: el PDF actúa como caché personal del usuario.
  Si tiene su PDF guardado, no necesita regenerar la Capa 2.

---

## Alternativas Consideradas

| Alternativa | Razón de descarte |
|---|---|
| Mantener prompts monolíticos | Parser regex frágil, sobrecarga cognitiva, gasto de tokens |
| Generar Capa 2 completa al registrarse | Coste innecesario para secciones que el usuario no lee |
| Guardar Capa 2 en Firestore | Textos largos caros de almacenar; se quedan obsoletos si cambia el perfil |
| Subcolecciones nuevas para Capa 1 | Lecturas extra innecesarias; ADR-002 favorece documentos planos |

---

## Consecuencias

**Positivas:**
- El usuario siempre tiene algo útil en pantalla (<1s para Capa 0, ~3s para Capa 1).
- Coste de tokens reducido ~60% en sesiones donde no se profundiza en narrativas.
- El parse del cruce pasa de regex frágil a función dedicada con schema explícito.
- `kinMayaContext` solo se inyecta en Capa 1 → tokens a la mitad en Capa 2.

**A gestionar:**
- La lógica de invalidación de Capa 1 requiere `getFichaHash()` (ver ADR-015).
- La caché de sesión (Map en estado React) se pierde al recargar la página — comportamiento esperado y documentado.
- El botón de descarga PDF solo aparece cuando todas las pestañas de Capa 2 están cargadas en sesión.

---

## Advertencia de Rango

La Capa 1 define el "resumen oficial" del perfil de una persona. Quien tenga rol
`admin` puede forzar una regeneración. Esto crea una asimetría: el admin puede
redefinir el arquetipo con el que una persona se presenta ante la comunidad.
Se recomienda que la regeneración manual sea siempre iniciada por el propio usuario
o por consenso del círculo, no unilateralmente por el admin.
