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
