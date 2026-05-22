# Flujo de Trabajo Kanarii — Sistema Antisabotaje

> Documento de referencia para cuando algo falla o necesitas entender cómo encajan las piezas.
> Última actualización: 22 mayo 2026.

---

## El principio de diseño

El sistema está construido sobre una premisa: **el agente protege el desarrollo de la inconsistencia humana, no al revés**. Cada ritual, workflow y rule existe para que puedas soltar ideas en vuelo, cerrar sesiones a medias o empezar el lunes con la cabeza en otro sitio — sin que eso rompa el avance.

---

## Mapa del sistema

```
ARTEFACTOS PERMANENTES (siempre activos via rules en caveman.md)
├── Protocolo de Integridad de Caja (box-enforcer)
│     Verifica git diff tras cada bloque de código.
│     Si hay archivo fuera de la Caja → autocrítica + revert automático.
└── Protocolo de Captura Silent (idea-capture)
      Intercepta desvíos durante la sesión.
      Escribe en docs/idea-inbox/YYYY-MM-DD.md sin interrumpir.
      Responde: "💡 Capturado en inbox. Seguimos."

ARTEFACTOS DE ESTADO
├── roadmap.md              — Fases y épicas del proyecto (fuente de verdad maestra)
├── docs/sprints/sprint-XX  — 3-5 tareas de la semana (fuente de verdad semanal)
├── .agent-session.lock     — Sesión activa (se crea al abrir, se destruye al cerrar)
└── docs/idea-inbox/        — Ideas en vuelo estructuradas (se vacía cada lunes)

WORKFLOWS (rituales de transición)
├── /sprint-planning        — Lunes: estado → sprint → prompt Perplexity → PAUSA
└── /session-start          — Inicio de sesión: rescate → tarea → investigación → Caja → lock

SKILLS (capacidades especializadas, se activan por contexto)
├── roadmap-a-tarea         — Convierte épica en tarea atómica (Modo Sprint)
├── doe-framework           — Diseña el task file si no existe
├── implementar-feature-dry — Ejecuta el código dentro de la Caja
├── structure-guardian      — Auditoría manual de arquitectura (uso puntual)
└── inbox-integrator        — Vacía idea-inbox → roadmap/backlog (lunes)
                              También procesa auditorías externas (ver sección abajo)
```

---

## Flujo semanal completo

### LUNES — /sprint-planning (~15 min, modelo Flash)

```
1. Detectar sesión colgada          → check-session.sh
2. Leer roadmap.md + sprint anterior
3. Vaciar docs/idea-inbox/          → clasificar: roadmap / backlog / descartar
                                       (pide confirmación antes de escribir)
4. Crear docs/sprints/sprint-XX.md  → 3-5 tareas S/M/L
5. Generar prompt para Perplexity   → bloque listo para copiar
6. ⏸ PAUSA                          → el agente espera tu investigación
```

**Después del paso 6 (tú):**
1. Copia el prompt → pégalo en Perplexity → investiga.
2. Vuelve con los hallazgos → ejecuta `/session-start` pegando la investigación.

---

### CADA SESIÓN — /session-start

```
FASE 0  Detección de sesión colgada
        ¿Existe .agent-session.lock?
        SÍ → Modo Rescate: commit de lo que haya, mover inbox al sprint file,
              marcar tarea como ⏸ Pausada, borrar lock → continuar a Fase 1.
        NO → continuar a Fase 1.

FASE 1  Lectura de contexto
        Leer sprint actual → identificar primera tarea ⬜ Pendiente o ⏸ Pausada.

FASE 2  Task file + investigación previa
        ¿Existe task-XXX.md?
        NO → activar doe-framework para crearlo.
        → Paso 3b: ¿Hay hallazgos de Perplexity pegados?
            SÍ → integrar en ## Contexto técnico del task file como decisiones tomadas.
            NO → preguntar "¿Tienes investigación previa? (S/N)"
                  S → esperar y luego integrar.
                  N → continuar sin contexto adicional.

FASE 3  Declarar la Caja
        Mostrar lista de archivos autorizados del task file.
        Activar skill relevante (por defecto: implementar-feature-dry).

FASE 4  Crear .agent-session.lock en la raíz.
```

---

### AL CERRAR SESIÓN — /session-close (Fase 5 de session-start)

> Si no lo ejecutas, la **Fase 0** de la próxima sesión lo hará automáticamente.

```
C1  Verificar Caja        → git diff vs authorized_files. Revertir si hay violación.
C2  Commit atómico        → git add -A && git commit -m "[tipo](T-XXX): descripción"
C3  Actualizar sprint     → ✅ Hecho o ⏸ Pausada con nota de dónde se quedó.
C4  Archivar task file    → mover a .agents/tasks/_archived/ si estado = DONE.
C5  Limpiar idea-inbox    → mover ideas del día al sprint file (clasificar el lunes).
C6  Borrar lock           → rm .agent-session.lock
```

---

## Auditorías externas

> **¿Cuándo aplica?** Cuando un agente externo (QwenCoder, revisión de PR, Gemini, Perplexity)
> entrega un informe técnico con hallazgos, riesgos o recomendaciones — no código ejecutable.

### Regla fundamental

Una auditoría externa **nunca entra directamente al sprint activo**. Siempre aterriza en
`docs/idea-inbox/` con prefijo `AUDIT-` y se procesa el siguiente lunes con `inbox-integrator`.
Esto protege el sprint en curso de interferencias no planificadas.

### Formato de captura de auditoría

Crear o añadir en `docs/idea-inbox/YYYY-MM-DD.md` una entrada por cada hallazgo relevante:

```markdown
## AUDIT-NN — [Título del hallazgo]
- **Idea:** [Acción concreta en una línea]
- **Impacto estimado:** Poco / Mucho
- **Contexto:** [Fuente de la auditoría + verificación propia si existe]
- **Skill sugerida:** [skill de .agents/skills/ que debería ejecutarlo]
- **Archivos afectados:** [lista de archivos, máx. 5]
- **Capturado:** YYYY-MM-DD HH:MM
```

### Criterios de clasificación para inbox-integrator (lunes)

| Prioridad en auditoría | Destino en roadmap | Acción |
|---|---|---|
| Crítico / P0 (seguridad, datos) | `[CRÍTICO]` en sección 🚨 Seguridad | Añadir antes que cualquier tarea del sprint siguiente |
| Alto / P1 (arquitectura, flujos) | `[ALTO]` en sección correspondiente | Planificar en los próximos 2 sprints |
| Medio / P2 (calidad, DRY) | `[MEDIO]` en 🧹 Calidad interna | Backlog con fecha estimada |
| Bajo / P3 (limpieza, docs) | `[BAJO]` o backlog post-MVP | Sin fecha comprometida |
| Falso positivo verificado | `descartar` | Documentar por qué en el mismo inbox |

### Ejemplo real (auditoría QwenCoder, mayo 2026)

```markdown
## AUDIT-01 — Reglas Firestore faltantes
- **Idea:** Añadir reglas para `community_exits`, `profiles` y `fichas`
- **Impacto estimado:** Mucho
- **Contexto:** Verificado en firestore.rules — colecciones usadas sin regla explícita.
  Riesgo real: fallo silencioso de app, no brecha abierta (Firestore niega por defecto).
- **Skill sugerida:** `firebase-security-rules-auditor`
- **Archivos afectados:** `firestore.rules`
- **Capturado:** 2026-05-22 21:36
```

---

## Formato de captura de ideas en vuelo

Cuando lanzas una idea durante la sesión, el agente la escribe en `docs/idea-inbox/YYYY-MM-DD.md`:

```markdown
- **Idea:** [Tu idea]
- **Impacto estimado:** Poco / Mucho
- **Contexto:** Trabajando en `[archivo]` → [qué estabas haciendo]
- **Capturado:** YYYY-MM-DD HH:MM
```

---

## Formato de contexto técnico en el task file

Cuando integras hallazgos de Perplexity, el agente los escribe en `## Contexto técnico` del task file:

```markdown
## Contexto técnico
> Fuente: Perplexity [fecha]

- **Decisión:** [patrón o solución elegida]
- **Por qué:** [razón en 1 línea]
- **Constraint clave:** [limitación técnica relevante]
- **Referencia:** [URL o doc]
```

---

## Estructura del .agent-session.lock

```json
{
  "task": "task-XXX",
  "sprint": "sprint-XX",
  "opened": "2026-05-22T10:00:00Z",
  "status": "open",
  "authorized_files": ["src/hooks/useX.ts", "src/types/x.ts"]
}
```

Si necesitas forzar un reseteo manual: borra este archivo desde la raíz del proyecto.

---

## Guía de diagnóstico rápido

| Síntoma | Causa probable | Solución |
|---|---|---|
| El agente no arranca la sesión y pide confirmar algo raro | Sesión anterior colgada | Verifica si existe `.agent-session.lock`. Si sí, bórralo manualmente o deja que el Modo Rescate lo limpie. |
| El inbox se llena y nadie lo clasifica | Sprint planning no ejecutado el lunes | Ejecutar `/sprint-planning` — el paso 3 vacía y clasifica el inbox. |
| El agente toca archivos fuera de los autorizados | Inercia de refactorización | El Protocolo de Integridad de Caja (caveman.md) debe revertirlo automáticamente. Si no lo hizo, revisar que caveman.md esté activo como rule. |
| El task file no tiene contexto técnico y el agente improvisa | Investigación no integrada | En la siguiente sesión, ejecutar `/session-start` pegando los hallazgos. El paso 3b los integrará. |
| El sprint tiene tareas pero no se sabe cuál empezar | Sprint file desactualizado | Abrir sprint file activo en `docs/sprints/` y revisar columna Estado. |
| Una idea en vuelo no aparece en el inbox | idea-capture (rule en caveman.md) no activa | Verificar que caveman.md esté cargado como rule en el agente. |
| Llega una auditoría externa durante el sprint | Sin procedimiento claro | Ver sección **Auditorías externas** arriba. Nunca tocar el sprint directamente. |

---

## Árbol de archivos del sistema

```
/
├── .agent-session.lock          ← Estado de sesión (raíz para visibilidad máxima)
├── roadmap.md                   ← Fases y épicas
├── .agents/
│   ├── rules/
│   │   └── caveman.md           ← Rules permanentes: box-enforcer + idea-capture
│   ├── workflows/
│   │   ├── sprint-planning.md
│   │   └── session-start.md     ← Incluye /session-close como Fase 5
│   ├── skills/
│   │   ├── doe-framework/
│   │   ├── implementar-feature-dry/
│   │   ├── roadmap-a-tarea/
│   │   ├── structure-guardian/
│   │   └── inbox-integrator/    ← También procesa auditorías externas (AUDIT-)
│   └── tasks/
│       ├── task-XXX.md          ← Contrato de sesión activa
│       └── _archived/           ← Tasks completadas
└── docs/
    ├── flujo-de-trabajo.md      ← Este documento
    ├── sprints/
    │   └── sprint-XX.md         ← Fuente de verdad semanal
    └── idea-inbox/
        └── YYYY-MM-DD.md        ← Ideas en vuelo + auditorías externas (AUDIT-)
```
