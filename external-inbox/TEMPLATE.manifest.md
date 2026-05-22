# Manifiesto de Integración — [Nombre de la Feature]

> Copia este archivo a `inbox/[nombre-feature]/manifest.md` y rellénalo antes de pedir la integración a Antigravity.

---

## Objetivo funcional
<!-- ¿Qué hace esta feature? ¿Qué problema resuelve para el usuario de Kanarii? -->

## Origen del código
<!-- AI Studio / Gemini CLI / Kimi / Qwen / otro -->
<!-- Modelo usado: -->

## Archivos entregados
- `archivo.tsx` — descripción breve
- `hook.ts` — descripción breve

## Dónde debería vivir en Kanarii
- Datos: `src/lib/appService.ts` → función `fetchXxx()`
- Estado: `src/hooks/useXxx.ts`
- UI: `src/components/ui/XxxCard.tsx`
- Página: `src/pages/XxxPage.tsx`

## Dependencias nuevas propuestas
- ninguna

## Qué partes son para copiar y cuáles son referencia
- `archivo.tsx` → copiar (solo ajustar naming)
- `hook.ts` → referencia (tiene lógica Firestore directa, hay que extraerla)

## Contexto adicional para el agente
<!-- Decisiones tomadas, alternativas descartadas, limitaciones del modelo que lo generó... -->

## Estado
- Generado: [fecha]
- Integrado: pendiente