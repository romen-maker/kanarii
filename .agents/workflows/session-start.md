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
3. Si no existe → activar `doe-framework` para crearlo siguiendo la plantilla `.agents/tasks/_template.md`.
4. Integrar investigación previa si el usuario la aportó.
5. Si no hay investigación, preguntar si desea añadirla antes de planificar.
6. No avanzar hasta que el task file esté completo.

> ⚠️ IMPORTANTE: Completar o leer el task file NO autoriza la ejecución.
> El task file describe QUÉ hay que hacer y qué archivos están en la Caja.
> La aprobación explícita del plan en Fase 3.5 es la única autorización para actuar.
> Son pasos distintos e independientes.

---

## FASE 3 — Declaración de la Caja

1. Leer `## Caja de archivos` del task file.
2. Mostrar archivos autorizados.
3. Identificar skill relevante, pero **no activarla aún** si implica ejecución operativa.

---

## FASE 3.5 — Plan para aprobación (OBLIGATORIA Y BLOQUEANTE)

El agente DEBE generar y mostrar el siguiente bloque completo **antes de realizar
cualquier acción operativa**. Este bloque es obligatorio. No hay excepción posible.

El bloque debe aparecer exactamente con esta estructura y el token `⏳ ESPERANDO`
al final — es la señal que indica que el agente está en pausa activa:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 PLAN PENDIENTE DE APROBACIÓN — T-XXX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TAREA: [nombre de la tarea]
🌿 RAMA PROPUESTA: feat/T-XXX-descripcion-corta

📁 ARCHIVOS QUE SE VAN A MODIFICAR:
  - src/ruta/archivo1.ts  → [qué se cambia y por qué]
  - src/ruta/archivo2.tsx → [qué se cambia y por qué]

📌 PASOS DEL PLAN (en orden):
  1. [paso concreto]
  2. [paso concreto]
  3. [paso concreto]

⚠️  RIESGOS DETECTADOS:
  - [riesgo con impacto estimado, o "Ninguno detectado"]

🖥️  VERIFICACIÓN UI REQUERIDA: [Sin revisión / Mínima / Obligatoria]
  Pantallas: [...]
  Comportamientos a comprobar: [...]

⏳ ESPERANDO: responde APROBADO, APROBADO CON CAMBIOS: [...] o CANCELAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Regla dura (no negociable)

Hasta recibir `APROBADO` o `APROBADO CON CAMBIOS` en este chat, el agente tiene
prohibido de forma absoluta:

- ❌ Crear `.agent-session.lock`
- ❌ Crear o cambiar de rama (`git checkout`, `git branch`)
- ❌ Editar, crear o borrar cualquier archivo del proyecto
- ❌ Ejecutar `git add`, `git commit`, `git push`
- ❌ Ejecutar `npm`, `yarn`, `pnpm` o cualquier comando que modifique estado
- ❌ Ejecutar comandos que escriban en disco

✅ Está permitido leer archivos, hacer búsquedas y listar directorios para
construir o refinar el plan.

Si el agente detecta que ha ejecutado cualquier acción operativa sin haber
recibido `APROBADO`, debe:
1. Detenerse inmediatamente.
2. Informar al usuario de qué ejecutó.
3. Proponer el rollback correspondiente.
4. Presentar el plan de nuevo y esperar aprobación.

### Respuestas válidas del usuario
- `APROBADO` → ejecutar el plan tal cual
- `APROBADO CON CAMBIOS: [descripción]` → ajustar el plan y confirmar los cambios antes de ejecutar
- `CANCELAR` → cerrar la sesión sin ninguna acción

---

## FASE 4 — Apertura del lock

**Solo tras aprobación explícita.**

Primer paso operativo: crear/cambiar a la rama aprobada. Si el agente detecta
que está en `main` o `master` y no puede crear la rama, debe detenerse y avisar.

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

El `branch` registrado en el lock debe coincidir con la rama de trabajo aprobada.
Si no coincide, la ejecución se detiene hasta corregirlo.

Mostrar: `"🔒 Sesión abierta. Lock creado. Ejecución autorizada para [T-XXX]."`

---

## FASE 5 — Ejecución controlada

1. Activar la skill relevante.
2. Ejecutar únicamente el plan aprobado, paso a paso en el orden declarado.
3. Si surge necesidad de salir de la caja o cambiar el enfoque:
   - Detener ejecución.
   - Presentar mini-plan de cambio con el mismo formato de la Fase 3.5.
   - Esperar nueva aprobación antes de continuar.

---

## FASE 6 — Cierre de sesión (/session-close)

### C1. Verificación de la Caja
Ejecutar `git diff --name-only` y comparar con `authorized_files`.
Si hay archivos fuera de la caja: informar al usuario y esperar instrucción.

### C2. Commit atómico
```bash
git add -A
git commit -m "[tipo](T-XXX): [descripción breve de lo hecho]"
```

### C3. Actualización del sprint file
- Si completa → `✅ Hecho`
- Si no → `⏸ Pausada` con nota de continuidad

### C4. Actualización del task file
Marcar en `## Estado de aprobación` los checkboxes de cierre.
Si estado = `DONE`:
```bash
mv .agents/tasks/task-XXX.md .agents/tasks/_archived/task-XXX.md
```

### C5. Limpieza del idea-inbox
Mover ideas surgidas durante la sesión al sprint file activo.

### C6. Borrar el lock
```bash
rm .agent-session.lock
```

Mostrar: `"✅ Sesión cerrada correctamente. Hasta la próxima."`
