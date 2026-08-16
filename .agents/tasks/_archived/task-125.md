# Task-125: Completar internacionalización de Welcome/Home y corregir composición de actividad

## Objetivo
Auditar y completar la internacionalización en Welcome/Home traduciendo la UI fija restante (accesos directos, gobernanza viva, animaciones pedagógicas, estructura S3, estado de tareas) y corrigiendo las frases de actividad mediante plantillas i18n con interpolación completa en lugar de concatenaciones rígidas.

## Contexto técnico
- Durante las pruebas del flujo EN de fundraising se detectaron textos fijos en español en bloques pedagógicos de Welcome y composiciones defectuosas/pegadas en el feed de actividades.
- Se debe asegurar la interpolación estructurada con plantillas i18n (`created the task "{{taskName}}" in "{{circleName}}"`) sin concatenación ni textos pegados.
- Se debe auditar cualquier duplicación del título/header `Admin Panel`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/pages/Welcome.tsx`
- `src/components/orientation/` (componentes hijos de orientación/welcome)
- `src/locales/es/welcome.json`
- `src/locales/en/welcome.json`
- `src/locales/es/common.json`
- `src/locales/en/common.json`

## Criterios de done
- [ ] UI fija de Welcome e hileras pedagógicas completamente traducida en ES/EN.
- [ ] Frases de actividad compuestas con plantillas i18n estructuradas e interpolación limpia.
- [ ] Duplicación de `Admin Panel` revisada y eliminada si es accidental.
- [ ] Auditoría del script `check-i18n-keys.ts` superada.
- [ ] Compilación sin errores TypeScript (`npx tsc --noEmit`), build y lint limpios.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-16 17:22 (APROBADO CON CAMBIOS MENORES)
- [x] Rama creada: fix/T-125-welcome-i18n-activity-fix
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
