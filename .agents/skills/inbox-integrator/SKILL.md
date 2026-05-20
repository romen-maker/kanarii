---
name: inbox-integrator
description: Protocolo para integrar código externo depositado en inbox/ al codebase de Kanarii. Úsala cuando el usuario ponga archivos en inbox/ generados por AI Studio, Gemini CLI, Kimi u otro agente externo.
---

# Inbox Integrator — Protocolo de Integración de Código Externo

Esta habilidad gestiona la entrada de código generado fuera de Antigravity al codebase de Kanarii.
**El inbox no tiene autoridad sobre la arquitectura. Propone. La arquitectura de Kanarii decide.**

---

## Cuándo activar

Cuando el usuario diga:
- "Tengo código en inbox/"
- "Acabo de pegar lo de AI Studio"
- "Mira lo que me generó Gemini CLI"
- "Integra el inbox"

---

## Fase 1: Leer el Manifiesto

**Primero y siempre: leer `inbox/[feature]/manifest.md`.**

Si no existe el manifiesto, **detente** y pide al usuario que lo cree usando la plantilla en `inbox/TEMPLATE.manifest.md`. No intentes integrar a ciegas.

Del manifiesto extrae:
- Objetivo funcional de la feature.
- Origen del código (AI Studio, Gemini CLI, etc.).
- Archivos entregados y su propósito declarado.
- Dependencias nuevas propuestas.
- Dónde el autor cree que debería vivir en el proyecto.
- Qué partes son para copiar y cuáles son solo referencia.

---

## Fase 2: Auditoría de Arquitectura

Antes de mover un solo archivo, analiza cada archivo del inbox contra las reglas de Kanarii:

### ✅ Check 1 — Separación de capas
Para cada archivo recibido, clasifícalo:
| Capa | Dónde vive en Kanarii | Señal de alerta |
|---|---|---|
| Acceso a datos | `src/lib/appService.ts` | Importa `firebase/firestore` |
| Estado/lógica | `src/hooks/use*.ts` | Mezcla UI con fetch |
| Presentación | `src/components/` | Contiene lógica de negocio |
| Composición | `src/pages/` | Importa `appService` directamente |

Si un archivo externo **mezcla capas**, no lo copies tal cual. Marca qué partes hay que extraer.

### ✅ Check 2 — Consistencia de nomenclatura
Abre `src/lib/appService.ts` y verifica:
- ¿Los campos nuevos siguen la convención `camelCase` en inglés?
- ¿Hay campos equivalentes en otras colecciones? Si `authorId` ya existe, no usar `creatorId`.

### ✅ Check 3 — No duplicar hooks ni servicios
- ¿Ya existe un hook `use[Entidad].ts` en `src/hooks/`? → Extender, no crear nuevo.
- ¿Ya hay operaciones similares en `appService.ts`? → Reutilizar.

### ✅ Check 4 — Dependencias nuevas
- Si el código propone librerías nuevas: activar skill `tech-scout` antes de `npm install`.

---

## Fase 3: Plan de Integración

Presenta al usuario un plan con este formato ANTES de tocar nada:

📦 INBOX: [nombre-feature]
📍 Origen: [AI Studio / Gemini CLI / otro]

🔍 AUDITORÍA:

[archivo.tsx] → Mezcla capas: separar lógica Firestore → appService.ts

[hook.ts] → Compatible. Renombrar [campo] por consistencia.

[component.tsx] → Reutilizable tal cual en src/components/ui/

📋 PLAN:

Crear fetchXxx() en appService.ts con la lógica de Firestore extraída.

Adaptar hook: eliminar import firebase directo, usar appService.

Copiar componente UI a src/components/ui/ con renombrado mínimo.

Crear página/panel en src/pages/ que orqueste hook + componente.

📦 DEPENDENCIAS NUEVAS: ninguna / [lista → pendiente tech-scout]

⚠️ TRADE-OFFS:

[Lo que se reescribe y por qué]

[Lo que se descarta del inbox y por qué]

text

**DETENERSE**: Espera aprobación del usuario antes de tocar archivos.

---

## Fase 4: Integración Bottom-Up

Siempre en este orden:
1. `src/lib/appService.ts` — métodos de datos nuevos.
2. `src/hooks/` — hook de entidad o de acción.
3. `src/components/ui/` — componentes de presentación.
4. `src/pages/` — página o panel de composición ("tonta", solo orquesta).

---

## Fase 5: Limpieza del Inbox

Una vez integrado y verificado:
1. Pide confirmación visual: *"¿Has revisado el resultado en el preview local?"*
2. Tras confirmación, elimina los archivos del inbox procesado.
3. Registra en `manifest.md` el estado final (fecha, archivos resultantes, cambios).

---

## Restricciones críticas

- **El inbox nunca tiene autoridad**: el código externo que viola la arquitectura se reescribe, no se importa.
- **No adivines**: si el manifiesto es ambiguo, pregunta antes de integrar.
- **No instales dependencias** sin pasar por `tech-scout`.
- **Confirmar visualmente** antes de cualquier commit que toque `src/`.

## Integración con otras skills
- Activar siempre junto con `implementar-feature-dry`.
- Si dudas de UX: `feature-ux-kanarii` primero.
- Si la feature es grande (>5 archivos): `roadmap-a-tarea` para dividir.
- Para dependencias nuevas: `tech-scout`.

---

*Última actualización: 20 May 2026*