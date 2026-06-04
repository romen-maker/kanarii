# Sprint 11 — 2026-06-03 → 2026-06-07

## Estado
🟡 En curso

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-042 | Despliegue Kanarii en `kanarii.romensuarez.com` (Coolify + Cloudflare + SSL + auto-deploy) | M | ✅ Hecho | .agents/tasks/task-042.md |
| T-043 | Migración datos Triada: script batch `saberes: string` → `string[]` + actualizar UI onboarding | M | ⬜ Pendiente | — |
| T-044 | Reducir usos de `any` en interfaces core (`datosBrutos`, `perfilVisual`, `configuracion`) con interfaces tipadas | M | ⬜ Pendiente | — |
| T-045 | Estandarizar validación formularios con componente `<FieldError />` reutilizable | S | ⬜ Pendiente | — |
| T-046 | Integración Kin Maya (Dreamspell): cálculo, widget en FichaView e inyección en prompts Gemini | M | ✅ Hecho | .agents/tasks/task-046.md |


## Notas de planning
- Sprint anterior (sprint-10) completado y archivado limpiamente.
- T-042 es bloqueante: sin deploy no se puede validar la app en producción ni el futuro Pasaporte público (T-022).
- T-043 prepara la migración de datos legacy necesaria para que la Triada funcione correctamente con datos reales.
- T-044 y T-045 son calidad interna — tareas independientes que pueden hacerse en paralelo.
- Pasaporte Comunitario público (T-022, tarea L) queda para sprint-12 tras validar el deploy.
- Fix aplicado en `check-sprint.sh`: `ls` → `find` para detectar sprints archivados.
