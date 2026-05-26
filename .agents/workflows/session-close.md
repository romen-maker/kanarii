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

### 2. Revisar el estado del repositorio
- Ejecuta `git status`.
- Revisa los archivos modificados con `git diff --name-only`.
- Confirma que los cambios relevantes están commitados y separados por alcance.

### 3. Detectar qué documentación debe cerrarse
- Si la sesión generó ADRs, revísalos en `docs/adrs/`.
- Si generó auditorías o referencias de Firebase, revísalas en `docs/firebase/`.
- Si generó scripts reutilizables, revísalos en `scripts/`.
- Si generó archivos temporales o scratch, decide si se eliminan o se convierten en archivos oficiales.

### 4. Archivar la tarea activa
- Localiza la tarea activa en `.agents/tasks/`.
- Sigue estrictamente este orden para el archivado:
  1. Marca la tarea `- [ ] Sesión cerrada correctamente` como completada (`- [x]`) en el archivo de tarea activo.
  2. Ejecuta `git add` del archivo de tarea actualizado.
  3. DESPUÉS, mueve el archivo de tarea a `.agents/tasks/_archived/`.
- Solo debe quedar una tarea activa por sesión.
- Si ya fue archivada, verifica que no quede una copia activa pendiente.

### 5. Actualizar el sprint activo
- Localiza el sprint activo en `docs/sprints/`.
- Marca la tarea como completada o mueve su estado al equivalente de cierre.
- Mantén el historial consistente con el resultado final de la sesión.

### 6. Limpiar la sesión
- Elimina `.agent-session.lock` si existe.
- Limpia temporales de sesión que no deban persistir.
- No dejes residuo en `.tmp/`, `scratch/`, `backup/` ni `.firebase/` si eran artefactos de trabajo y no parte estable del proyecto.

### 7. Verificación final
- Ejecuta `git status` otra vez.
- Confirma que el árbol de trabajo está limpio o, si no lo está, que solo quedan cambios intencionales para revisión.
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
- qué se limpió,

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