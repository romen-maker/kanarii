# CLI & AI Studio Onboarding 🤖

Guía de inicio rápido para Gemini CLI, Qwen Code y AI Studio.
Copia el prompt de tu herramienta al arrancar la sesión.

---

## 🖥️ Prompt Base — Gemini CLI / Qwen Code

Estoy trabajando en Kanarii, una app React + TypeScript + Firebase para
comunidades intencionales basada en Sociocracia 3.0.

Antes de hacer cualquier cosa:
1. Lee .agents/AGENT_ONBOARDING.md — qué es el proyecto y su arquitectura.
2. Lee .agents/GEMINI.md — reglas de comportamiento (idioma, DRY, git).
3. Lee .agents/DEFINITION_OF_DONE.md — cuándo algo está terminado.
4. Consulta roadmap.md si necesitas contexto del estado actual.

Reglas que DEBES respetar siempre:
- Comunica en español, código en inglés.
- Nunca importes Firestore directamente en componentes: todo va por src/lib/appService.ts.
- Arquitectura DRY en 3 capas: pages (UI) / hooks (estado) / appService (datos).
- Trabaja en rama feat/ o fix/, nunca en main directamente.
- Nunca hagas commit de cambios visuales sin confirmación explícita mía.
- Antes de implementar, explica el plan (QUÉ, POR QUÉ, TRADE-OFF) y espera aprobación.
- Ejecuta `npx tsc --noEmit` antes de cada commit.

La tarea que voy a pedirte es: [DESCRIBE AQUÍ LA TAREA]

---

## 🌐 Prompt Base — Google AI Studio

Eres un asistente de desarrollo para Kanarii, una app React + TypeScript
+ Firebase para comunidades intencionales basada en Sociocracia 3.0.

Contexto de arquitectura (memoriza esto):
- Stack: Vite + React + TypeScript + Firebase + Tailwind + motion/react
- Arquitectura DRY obligatoria:
  * pages/  → solo composición visual, sin lógica de datos
  * hooks/  → estado y lógica de negocio
  * lib/appService.ts → único acceso a Firestore
- Prohibido: imports directos de Firestore en componentes, window.alert()
- Interfaces y campos: inglés camelCase
- Comunicación: español natural; código: inglés

Uso de AI Studio en este flujo:
- Genera componentes NUEVOS desde cero (sin contexto del repo existente)
- El código generado se descarga, revisa y se integra en el repo local
- NO uses AI Studio para editar archivos existentes con lógica acoplada al sistema

Patrones al generar código:
- Componentes presentacionales puros (sin llamadas a Firestore)
- Props tipadas con interfaces TypeScript bien definidas
- Named exports siempre
- Si necesita datos externos → los recibe como props, no hace fetch interno
- Tailwind para estilos, motion/react para animaciones

La tarea que necesito es: [DESCRIBE AQUÍ LA TAREA]

---

## 🛠️ Cuándo usar cada herramienta

| Herramienta | Usar para | No usar para |
|---|---|---|
| **AI Studio** | Componentes nuevos desde 0, animaciones, UI sin estado | Editar código existente, lógica Firestore, hooks |
| **Gemini CLI** | Refactors sobre archivos existentes, fixes, explorar repo con contexto | Features grandes desde 0 |
| **Qwen Code CLI** | Igual que Gemini CLI, 2.000 req/día gratis | Igual que Gemini CLI |
| **Antigravity** | Integración compleja, lógica con contexto profundo del sistema | Tareas que resuelve un CLI en 5 min |

---

## 🔄 Flujo Multi-Agente

```
AI Studio
  ↓ genera componente nuevo (descarga ZIP o copia)
  ↓ copias a src/components/ o src/pages/
CLI (Gemini o Qwen Code)
  ↓ integra: registra ruta en App.tsx,
    añade tipos, conecta con appService si hace falta
Antigravity
  ↓ solo para partes que requieren contexto profundo
    del sistema (hooks complejos, migraciones de datos)
```

---

## ⚠️ Error más común: Prop Drilling sin Layout Wrapper

Si un elemento de UI se repite en N componentes (tracker, escape hatch, badge),
**NO lo pases como prop a cada componente**. Crea un Layout Wrapper.

Deuda técnica existente: `TourStepLayout.tsx` (pendiente en roadmap).
Si tocas el tour de onboarding, aplica ese patrón primero.

---

*Última actualización: 20 May 2026*