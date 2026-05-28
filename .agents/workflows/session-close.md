---
description: Este flujo se usa cuando la tarea está terminada, validada y lista para archivarse o integrarse.
---

# session-close

Cierre formal de una sesión de trabajo.

Este flujo se usa cuando la tarea está terminada, validada y lista para archivarse o integrarse.
No se usa para seguir implementando cambios nuevos.

## Objetivo

- Cerrar el trabajo activo de forma limpia.
- Dejar registrado lo que cambió y lo que queda pendiente.
- Archivar la tarea activa.
- Actualizar el sprint activo.
- Eliminar locks y temporales de sesión.
- Dejar el repositorio listo para revisión, PR o integración según la política del proyecto.

## Archivos y rutas a revisar

Revisa solo las rutas genéricas o configurables que existan en el proyecto:

- `.agent-session.lock`
- `docs/sprints/`
- `.agents/tasks/`
- `.agents/tasks/_archived/`
- `docs/adrs/`
- `docs/firebase/`
- `scripts/`
- `scratch/`
- `.tmp/`
- `backup/`
- `.firebase/`

Si existen otros artefactos temporales o de validación, deben quedar:
- archivados en una ruta oficial,
- documentados,
- o eliminados antes del cierre.

## Protocolo

### 1. Confirmar el cierre
- Verifica que la tarea está terminada.
- Confirma que no quedan cambios funcionales pendientes.
- Si hay dudas abiertas, no cierres todavía.

### 2. Preparar documentación (antes del script)
Antes de llamar al script de cierre, edita manualmente:
1. **`docs/sprints/sprint-XX.md`** — marca la tarea como `✅ Completada`.
2. **`.agents/tasks/task-XXX.md`** — marca el criterio `- [ ] Sesión cerrada correctamente` como `- [x]`.

No ejecutes `git add` ni `git status` manualmente. El script lo gestiona.

### 3. Cierre atómico con script
Ejecuta **un único comando**:

```bash
bash scripts/agent/close-task.sh
```

El script lee la rama activa, deriva automáticamente el TASK_ID y el mensaje de commit desde el nombre de la rama (formato esperado: `feat/T-026-descripcion`), archiva el task file en `.agents/tasks/_archived/` con `git mv`, realiza un único commit atómico y elimina `.agent-session.lock` si existe.

**No ejecutes `git status`, `git add` ni `git commit` por separado.** Todo va en el mismo commit atómico.

Si el script falla:
- `❌ No se puede derivar el TASK_ID` → la rama no sigue el formato `feat/T-XXX-descripcion`.
- `❌ No encontrado: task-XXX.md` → el task file ya fue archivado o el ID es incorrecto.
- `❌ Nada en stage` → todos los cambios ya estaban commitados; revisa con `git log --oneline -3`.

### 4. Detectar qué documentación adicional debe cerrarse
- Si la sesión generó ADRs, revísalos en `docs/adrs/`.
- Si generó auditorías o referencias de Firebase, revísalos en `docs/firebase/`.
- Si generó scripts reutilizables, revísalos en `scripts/`.
- Si generó archivos temporales o scratch, decide si se eliminan o se convierten en archivos oficiales.
- Si hay documentación adicional que commitear, hacer un commit separado con `git add <archivo> && git commit -m "docs: ..."`.

### 5. Verificación final
- Ejecuta `git status` una sola vez para confirmar que el árbol está limpio.
- Resume el cierre en una nota breve.

## Integración con `main`

La integración a `main` no es obligatoria dentro del cierre de sesión.

Usa esta regla:

- Si el proyecto tiene política clara de merge o PR, deja la rama lista para ese paso.
- Si no hay política definida, deja la rama cerrada y documentada.
- No mezcles el cierre de sesión con una refactorización nueva.
- No fuerces merge a `main` por defecto.

## Resultado esperado

Al terminar, debe quedar claro:

- qué se cerró,
- qué se archivó,
- qué se documentó,
- qué se limpió.

## Integración y siguiente paso

El cierre de sesión no debe asumir una política de integración que no exista.

- No afirmar que la rama está lista para merge a `main` salvo que el proyecto tenga una política explícita documentada.
- No iniciar ni nombrar la siguiente tarea dentro del cierre.
- Si la integración futura es relevante, dejar una nota neutra del tipo:
  "La rama queda cerrada localmente y lista para la decisión de integración que defina el proyecto."
- El siguiente trabajo debe definirse en una sesión nueva o en la planificación del sprint, no en el cierre.

## Reglas

- No abrir trabajo nuevo durante el cierre.
- No dejar locks, temporales o scratch sin clasificar.
- No mezclar documentación permanente con residuos temporales.
- No fijar nombres concretos de archivos de tarea o sprint.
- No forzar merge a `main` si la política no está definida.
- **No ejecutar `git add` ni `git commit` manualmente durante el cierre — usar siempre `close-task.sh`.**
