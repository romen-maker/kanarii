---
description: Inicia una sesión de desarrollo. Detecta sesiones colgadas, selecciona la tarea activa, declara la Caja de archivos y activa el modo ejecución. Incluye el protocolo de cierre /session-close como paso final.
---

# Workflow: /session-start

> Ejecutar al inicio de cada sesión de desarrollo, antes de escribir cualquier línea de código.

---

## FASE 0 — Detección de sesión anterior (Modo Rescate)

Ejecutar siempre como primer paso:
```bash
bash scripts/agent/check-session.sh
```

**Si devuelve `NO_ACTIVE_SESSION`** → ir a Fase 1.

**Si devuelve un JSON** → hay una sesión sin cerrar. Ejecutar Modo Rescate:
1. Leer el JSON: identificar `task`, `sprint`, `opened`.
2. Avisar al usuario: `"⚠️ Sesión anterior sin cerrar: [task] abierta desde [opened]. Preparando cierre automático para aprobación."`
3. **No hacer commit automático aún.** Incluir el rescate dentro del plan para aprobación.
4. Detectar cambios staged/unstaged e ideas pendientes.
5. Continuar a Fase 1 y reflejar este rescate en el plan.

---

## FASE 1 — Lectura de contexto

1. Leer el sprint file más reciente en `docs/sprints/`.
2. Identificar la primera tarea con estado `⬜ Pendiente` o `⏸ Pausada`.
3. Mostrar: `"Tarea activa detectada: [T-XXX] — [descripción]"`.

---

## FASE 2 — Creación o carga del task file

1. Comprobar si existe `.agents/tasks/task-XXX.md`.
2. Si existe → leerlo.
3. Si no existe → activar `doe-framework` para crearlo siguiendo la plantilla en `.agents/tasks/_template.md`.
4. Integrar investigación previa si el usuario la aportó.
5. Si no hay investigación, preguntar si desea añadirla antes de planificar.
6. No avanzar hasta que el task file esté completo.

> ⚠️ **IMPORTANTE:** Un task file completo NO autoriza la ejecución.
> El task file describe **QUÉ** hay que hacer y **qué archivos** están en la Caja.
> La aprobación explícita del plan en Fase 3.5 autoriza **CUÁNDO y CÓMO** hacerlo.
> Son pasos distintos e insustituibles. Continuar a Fase 3.

---

## FASE 3 — Declaración de la Caja

1. Leer `## Caja de archivos` del task file.
2. Mostrar archivos autorizados.
3. Identificar skill relevante, pero **no activarla aún** si implica ejecución operativa.

---

## FASE 3.5 — Plan para aprobación (OBLIGATORIA Y BLOQUEANTE)

El agente **DEBE** generar y mostrar el bloque completo siguiente antes de realizar
**cualquier acción operativa**. No hay excepción posible.

Generar el bloque con este formato exacto:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 PLAN PENDIENTE DE APROBACIÓN — T-XXX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TAREA: [nombre completo de la tarea]
🌿 RAMA PROPUESTA: [feat|fix|refactor|docs|chore]/T-XXX-descripcion-corta

📁 ARCHIVOS QUE SE VAN A MODIFICAR:
  - src/ruta/archivo1.ts  → [qué cambia y por qué]
  - src/ruta/archivo2.tsx → [qué cambia y por qué]

📌 PASOS DEL PLAN (en orden de ejecución):
  1. [acción concreta]
  2. [acción concreta]
  3. [acción concreta]

⚠️ RIESGOS DETECTADOS:
  - [riesgo con impacto estimado, o "Ninguno identificado"]

🖥️ VERIFICACIÓN UI REQUERIDA: [Sin revisión / Mínima / Obligatoria]
  Pantallas: [lista o "N/A"]
  Comportamientos a comprobar: [lista o "N/A"]

⏳ ESPERANDO TU RESPUESTA: APROBADO | APROBADO CON CAMBIOS: [...] | CANCELAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Regla dura (no negociable)

Hasta recibir `APROBADO` o `APROBADO CON CAMBIOS` en este chat, está **estrictamente prohibido**:

- Crear `.agent-session.lock`
- Crear, cambiar o modificar cualquier rama git
- Editar cualquier archivo del proyecto (código, docs, tasks, scripts)
- Ejecutar `git add`, `git commit`, `git checkout -b` o cualquier comando que modifique estado
- Ejecutar `npm run`, `npx`, ni validaciones de build

**Está permitido** leer archivos, hacer búsquedas y consultas de solo lectura para construir el plan.

Si el agente detecta que ha ejecutado alguna acción operativa sin `APROBADO` explícito,
debe detenerse inmediatamente, informar al usuario de lo ocurrido con detalle,
y presentar el plan de nuevo desde cero esperando nueva aprobación.

### Respuestas válidas

- `APROBADO` → continuar exactamente con el plan presentado
- `APROBADO CON CAMBIOS: [descripción]` → ajustar el plan según los cambios indicados y confirmar antes de ejecutar
- `CANCELAR` → cerrar sesión sin modificar nada

### Convención de nombres de rama

`feat/T-XXX-descripcion-corta` · nuevas funcionalidades
`fix/T-XXX-descripcion-corta` · correcciones de bugs
`refactor/T-XXX-descripcion-corta` · refactors sin cambio funcional
`docs/T-XXX-descripcion-corta` · documentación
`chore/T-XXX-descripcion-corta` · mantenimiento e infraestructura

---

## FASE 4 — Apertura del lock

**Solo tras aprobación explícita.** El primer paso operativo es crear la rama aprobada.

Crear `.agent-session.lock`:
```json
{
  "task": "task-XXX",
  "sprint": "sprint-XX",
  "branch": "feat/T-XXX-descripcion-corta",
  "opened": "[ISO 8601 timestamp]",
  "status": "open",
  "approved_plan": true,
  "authorized_files": [
    "src/hooks/useAssembly.ts",
    "src/types/assembly.ts"
  ]
}
```

El `branch` registrado en el lock debe coincidir con la rama aprobada en Fase 3.5.
Si la rama activa no coincide, o si el agente sigue en `main`/`master`, detener ejecución y avisar al usuario.

Mostrar: `"🔒 Sesión abierta. Lock creado. Ejecución autorizada para [T-XXX]."`

---

## FASE 5 — Ejecución controlada

1. Activar la skill relevante.
2. Ejecutar únicamente el plan aprobado.
3. Si surge necesidad de salir de la caja o cambiar el enfoque:
   - detener ejecución,
   - presentar mini-plan de cambio con el mismo formato de Fase 3.5,
   - esperar nueva aprobación antes de continuar.

---

## FASE 6 — Cierre de sesión (/session-close)

### C1. Verificación de la Caja
Ejecutar `git diff --name-only` y comparar con `authorized_files`.

### C2. Commit atómico
```bash
git add -A
git commit -m "[tipo](T-XXX): [descripción breve de lo hecho]"
```

### C3. Actualización del sprint file
- Si completa → `✅ Hecho`
- Si no → `⏸ Pausada` con nota de continuidad

### C4. Archivado del task file
Si estado = `DONE`:
```bash
mv .agents/tasks/task-XXX.md .agents/tasks/_archived/task-XXX.md
```

### C5. Limpieza del idea-inbox
Mover ideas al sprint file activo.

### C6. Borrar el lock
```bash
rm .agent-session.lock
```

Mostrar: `"✅ Sesión cerrada correctamente. Hasta la próxima."`
