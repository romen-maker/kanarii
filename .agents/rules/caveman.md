---
trigger: always_on
---

# Caveman Rule (Respuestas Concisas por Defecto)

> Optimización de tokens y concisión operativa para evitar rodeos conversacionales innecesarios durante el desarrollo en Kanarii.

## Reglas

1. **Sin Introducciones ni Conclusiones Redundantes**: Eliminar expresiones de cortesía vacías al inicio y al final de los mensajes (ej: "Claro, con gusto te ayudo", "Espero que esto te sirva").
2. **Sin Planificación Verbal en Tareas Simples**: No listar pasos intermedios obvios ni pedir confirmación innecesaria para tareas directas y claras que afecten a menos de 3 archivos.
3. **Sin Decoración Innecesaria**: Evitar el uso excesivo de emojis y negritas decorativas dentro de explicaciones puramente técnicas o bloques de código.
4. **Preservar el Core Arquitectónico**: Mantener el patrón **QUÉ / POR QUÉ / TRADE-OFF** para cambios arquitectónicos, confirmaciones visuales antes de commit en `src/`, y advertencias de seguridad/destructivas.

## Ejemplos

- ✅ **Correcto**:
  "Voy a extraer la lógica de ordenación a un hook `useSortedComunidades.ts`.
  ¿Por qué? Respeta la capa de estado (DRY) y limpia el componente `ComunidadesView.tsx`.
  [Código limpio del hook]"

- ❌ **Incorrecto**:
  "¡Hola! Claro que sí, entiendo que necesitas limpiar el componente. Primero voy a analizar el archivo, luego crearé un nuevo hook y en tercer lugar lo importaré. ¿Te parece bien que empiece con esto? ¡Vamos a por ello! 🚀"

## Excepciones

- Tareas que modifiquen `appService.ts`, hooks compartidos (`useXxx` que usen más de un componente), o el schema de Firestore — independientemente del número de archivos afectados.
- Tareas complejas que involucren **más de 3 archivos**, donde sí se debe presentar un plan estructurado (`implementation_plan.md` o resumen equivalente) antes de proceder.
- Emojis estructurales definidos en protocolos obligatorios (ej: flujos de reconducción de foco, alertas críticas ⚠️, checkmarks de tareas ✅).
- **Al proponer nombres de componentes, hooks o campos nuevos**: verificar `.agents/rules/naming-convention.md` antes de proponer. Cualquier nombre que no siga la tabla de convenciones es una violación arquitectónica — no un detalle de estilo.

---

## Contrato de Contexto (sprint-planning)

> Regla de navegación determinista. Elimina la fase de descubrimiento en /sprint-planning.

Al ejecutar `/sprint-planning`, las rutas de los archivos clave son fijas por convención del proyecto. **No uses `find`, `ls` ni lecturas manuales para localizarlos:**

| Archivo | Ruta exacta |
|---|---|
| Roadmap | `ROADMAP.md` (raíz, mayúsculas) |
| Sprint files | `docs/sprints/sprint-NN.md` |
| Idea inbox | `docs/idea-inbox/*.md` |
| External inbox | `external-inbox/` |

**Flujo obligatorio:**
1. Ejecutar `bash scripts/agent/check-sprint.sh` → usar su output como única fuente de verdad para el estado del proyecto.
2. Leer `ROADMAP.md` completo (la ruta exacta la confirma el script).
3. Leer solo los archivos específicos que el script señale como pendientes (inbox, spillover).

Si el script falla o reporta `❌ CRÍTICO`: detenerse e informar al usuario. **No intentar buscar alternativas ni improvisar rutas.**

---

## Protocolo de Integridad de Caja (box-enforcer)

> Previene la "inercia de refactorización": el agente modificando archivos fuera del scope declarado.

### Regla
Al inicio de cada sesión se declara la **Caja**: lista de archivos autorizados para modificación, definida en el `task-XXX.md` activo.

Después de **cada bloque de código generado**, el agente debe verificar mentalmente (via `git diff --name-only`) que solo se han tocado archivos dentro de la Caja.

**Si se detecta un archivo fuera de la Caja:**
1. ⚠️ Reportar inmediatamente: `"VIOLACIÓN DE CAJA: [archivo] no estaba autorizado."`
2. Revertir el cambio no autorizado antes de continuar.
3. Explicar en una línea por qué el agente salió de la Caja.

### Excepción crítica
Los reportes del Protocolo de Integridad de Caja son **alertas estructurales obligatorias**, no decoración. **Nunca se suprimen por optimización de tokens.** Esta excepción tiene prioridad sobre la Regla 2 (Sin Planificación Verbal).

### Autorización de emergencia
Si un archivo fuera de la Caja tiene un error bloqueante, el agente debe **pedir autorización explícita** antes de tocarlo: `"[archivo] está fuera de la Caja pero bloquea la tarea. ¿Autorizo modificación?"`

---

## Protocolo Captura Silent (idea-capture)

> Recoge desvíos e ideas en vuelo sin interrumpir el foco de la sesión.

### Regla
Cuando durante una sesión el usuario lance una idea, pregunta o sugerencia que no sea parte de la tarea activa en el `task-XXX.md`:

1. El agente **no debate, no analiza, no desvía** el flujo.
2. Escribe la idea en `docs/idea-inbox/YYYY-MM-DD.md` con esta estructura:

```markdown
- **Idea:** [descripción de la idea]
- **Impacto estimado:** [Poco / Mucho]
- **Contexto:** Trabajando en `[archivo activo]` → [descripción breve del momento]
- **Capturado:** [YYYY-MM-DD HH:MM]
```

3. Responde en **una sola línea**: `"💡 Capturado en idea-inbox. Seguimos."`
4. Continúa con la tarea sin más comentarios sobre la idea.

### Límite del protocolo
Si la idea lanzada **bloquea directamente la tarea activa** (no es un desvío sino un requisito), el agente lo señala: `"Esto afecta a la tarea actual. ¿Pausamos para redefinir la Caja?"`

### Límite crítico — Tarea completada
Cuando la tarea activa esté completada (todos los criterios de done marcados):
- El agente **SÍ captura** la idea en `docs/idea-inbox/` con el formato estándar.
- Responde en una línea: `"💡 Capturado en inbox. Ahora procedo al cierre."`
- **NO actúa sobre la idea** — no lee archivos relacionados, no prepara planes, no analiza.
- Si el usuario lanza una petición nueva en ese momento, aplicar FASE 5b de session-start.md.

---

## Planificación Lazy (lazy-planning)

> Elimina la fase de exploración de código antes de la aprobación del plan.

### Regla
Durante la **Fase 2 y Fase 3 de /session-start** (antes de recibir APROBADO), el agente infiere los archivos a modificar **exclusivamente desde la descripción del task file**. No es necesario leer ni buscar código para generar el plan.

### Reglas operativas

**Durante las Fases 0–2 (antes del plan aprobado):**

| | Acción | Detalle |
|---|---|---|
| ✅ | Leer SOLO el task file activo | `task-XXX.md` identificado en Fase 1 — ningún otro |
| ✅ | Leer el sprint file correspondiente | ej: `sprint-07.md` |
| ✅ | Leer research files citados | `sprint-XX-research.md` citado en el task file o sprint file |
| ✅ | Verificar existencia con `test -f` | Sin leer contenido |
| ❌ | Leer OTROS task files | `task-YYY.md` donde `YYY ≠ XXX` (la tarea activa) — aunque estén en `.agents/tasks/` |
| ❌ | `Listed directory` en `.agents/tasks/` | Incluye `_archived/` y cualquier subdirectorio |
| ❌ | `Listed directory` en `src/` o `lib/` | O cualquier directorio de código fuente |
| ❌ | `Searched for` en `src/` o `lib/` | Búsqueda en código fuente |
| ❌ | `Viewed` en archivos `.ts`/`.tsx`/`.js` | Salvo citados explícitamente por el usuario |
| ❌ | Leer `SKILL.md`, `_template.md`, `naming-convention.md` | Su contenido es conocimiento internalizado |
| ❌ | Leer cualquier `.md` fuera de task activo/sprint/research | Incluye otros task files del mismo sprint |
| ❌ | `git show`, `git log`, `git diff` para leer contenido | Comandos que revelan código de commits |
| ❌ | `firestore.rules`, `ROADMAP.md`, `package.json` no citados | Archivos de configuración fuera del scope |

> ⚠️ **Advertencia explícita**: Leer `task-028.md`, `task-030.md` u otros task files del sprint antes de la aprobación del plan es una **violación lazy-planning**, aunque el motivo sea "entender contexto". El contexto de otras tareas no justifica la lectura anticipada.

### Excepción
Si el task file menciona explícitamente un archivo y la descripción es ambigua sobre qué cambiar (ej: "refactorizar X para que haga Y" sin detallar la interfaz actual), el agente puede leer **solo ese archivo** y debe indicarlo: `"Leyendo [archivo] para clarificar la interfaz antes del plan."`

### Por qué
El 80% de las búsquedas pre-aprobación son confirmaciones de información que ya está en el task file o que el agente puede inferir del stack conocido. Leer código o task files ajenos antes de la aprobación gasta tokens en un escenario hipotético que el usuario puede rechazar.

### Mecanismo de control

La regla lazy-planning se hace cumplir mediante dos checkpoints obligatorios en `/session-start`:

1. **FASE 2.5 — Checkpoint lazy-planning**: Declaración explícita de qué archivos leyó el agente durante las Fases 0–2, incluyendo código fuente, documentos de referencia estáticos, y otros task files distintos al activo. Este checkpoint es **previo** al plan — el agente no puede generar el plan sin completarlo.
2. **FASE 3.5 — Campo de auditoría**: El campo `📂 ARCHIVOS LEÍDOS` del plan debe ser una copia exacta de lo declarado en el checkpoint. Cualquier discrepancia entre ambos campos es una **violación doble**.

**Consecuencias por tipo de violación:**

| Tipo | Qué ocurrió | Frase exacta para el usuario | Acción del agente |
|---|---|---|---|
| Checkpoint ausente | El agente saltó la Fase 2.5 | `"Checkpoint ausente. Repite Fase 2.5 con formato exacto."` | Retroceder a Fase 2.5, generar el bloque completo |
| Formato incorrecto | El bloque existe pero difiere del template | `"Checkpoint inválido. Usa formato exacto."` | Regenerar el bloque con el formato correcto |
| Violación doble | Campo de auditoría ≠ texto del checkpoint | `"Violación doble. Corrige para que sea idéntico."` | Corregir ambos campos antes de continuar |
| Mentira declarativa | Marcó Opción A pero el log muestra `Viewed`/`Listed` en archivos prohibidos | `"Violación grave de protocolo. Aborta y reinicia /session-start."` | Detenerse, listar archivos realmente leídos, esperar instrucción |

**Protocolo de respuesta ante violación:**
1. **Usuario detecta violación** → usar la frase exacta de la tabla.
2. **Agente recibe la señal** → detenerse inmediatamente, no ejecutar ninguna acción operativa.
3. **Agente informa** → listar archivos realmente leídos (si los hubo).
4. **Usuario decide** → continuar con advertencia registrada en el task file, o abortar sesión.

> 🔍 Para verificar manualmente si hubo violación, ejecuta:
> ```bash
> bash scripts/agent/check-lazy-planning.sh [T-XXX]
> ```
