# Task-129: Internacionalización completa de la página del Tour pedagógico (/tour)

## Objetivo
Internacionalizar la página `/tour` (`KanariiTourPage.tsx`), integrando el selector de idioma `<LanguageSelector />` en la cabecera fija y traduciendo la UI de todos los estados del recorrido (`intro`, `menu`, `tour`, `individual`, `final`) bajo el sub-bloque `tour` en `welcome.json`.

## Contexto técnico
- La página `/tour` no contaba con `<LanguageSelector />` ni utilizaba `useTranslation()`.
- Los 8 módulos pedagógicos deben ofrecer traducciones simétricas ES/EN especificadas en el plan.
- Los subcomponentes de animaciones integrados en `tour` e `individual` se inventarían. En T-129 se corrige la propiedad del componente `KanariiTourPage.tsx` y se registran posibles hallazgos en subcomponentes para tareas independientes.
- El cambio de idioma ES ↔ EN debe ser reactivo y preservar el estado del tour (`view`, `tourStep`, `selectedModule`) sin reiniciar el progreso.

## Caja de archivos
Archivos autorizados para modificación:
- `src/pages/KanariiTourPage.tsx`
- `src/locales/es/welcome.json`
- `src/locales/en/welcome.json`
- `.agents/tasks/task-129.md`
- `docs/sprints/sprint-26.md`

## Criterios de done
- [x] Sub-bloque `tour` añadido simétricamente en `es/welcome.json` y `en/welcome.json`.
- [x] Integración de `<LanguageSelector />` en la cabecera fija superior derecha junto al botón de retorno.
- [x] Traducción mediante `useTranslation('welcome')` en todos los estados del tour (`intro`, `menu`, `tour`, `individual`, `final`).
- [x] Preservación del estado del tour al cambiar idioma (sin reinicio).
- [x] `check-i18n-keys.ts` verificado al 100%.
- [x] `check-i18n-visible-literals.ts` ejecutado en `KanariiTourPage.tsx` sin warnings de UI fija.
- [x] TypeScript, build y lint superados limpiamente.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-17 11:50
- [x] Rama creada: `feat/T-129-tour-i18n`
- [x] Lock activo: `.agent-session.lock`
- [x] Sesión cerrada correctamente
