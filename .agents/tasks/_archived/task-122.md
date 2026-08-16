# Task-122: Actualizar docs/pages-map.md, guía de copy y documentación del sprint

## Objetivo
Actualizar `docs/pages-map.md`, la guía de copy de internacionalización y la documentación del Sprint 26 tras la implementación completa de la internacionalización ES/EN para el fundraising. Actualizar también la fecha al final del documento.

## Contexto técnico
- Se completaron las tareas de internacionalización T-116 a T-121 introduciendo `react-i18next`, namespaces de traducción (`common`, `welcome`, `auth`, `communities`, `passport`), soporte determinista de Firma Galáctica y fallback seguro.
- `docs/pages-map.md` debe reflejar la nueva capacidad multilingüe (ES/EN) por ruta pública y el estado del selector global.
- Se debe actualizar la guía de copy y documentar las fronteras de internacionalización (UI fija vs Contenido de miembro) y actualizar la fecha final del documento.

## Caja de archivos
Archivos autorizados para modificación:
- `docs/pages-map.md`
- `docs/sprints/sprint-26.md`

## Criterios de done
- [ ] `docs/pages-map.md` actualizado con el soporte ES/EN por ruta y fecha al final del documento.
- [ ] Guía de copy y principios de internacionalización documentados.
- [ ] Sprint 26 actualizado y preparado para cierre.
- [ ] Compilación sin errores TypeScript (`npx tsc --noEmit`), build y lint limpios.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-16 17:07 (APROBADO CON CAMBIOS)
- [x] Rama creada: docs/T-122-update-pages-map-i18n
- [x] Lock activo: .agent-session.lock
- [ ] Sesión cerrada correctamente
