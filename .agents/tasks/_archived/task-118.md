# Task-118: Crear selector ES/EN accesible en cabecera/menú y aplicar el atributo lang dinámico al documento HTML

## Objetivo
Crear un componente selector de idioma (`LanguageSelector.tsx`) integrado en la cabecera/menú de la aplicación, que permita alternar libremente entre Español e Inglés, actualizar el estado de `i18next` (que se persiste automáticamente en `localStorage` bajo `kanarii.language`) y sincronizar el atributo `lang` del elemento `<html lang="...">` en el DOM.

## Contexto técnico
Investigación integrada desde `docs/sprints/sprint-26-research.md`.
Consumirá `useTranslation()` de `react-i18next`. Al cambiar el idioma mediante `i18n.changeLanguage()`, escuchará el evento `languageChanged` para actualizar el atributo `document.documentElement.lang`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/components/language/LanguageSelector.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/TopBar.tsx`

## Criterios de done
- [ ] Componente `LanguageSelector.tsx` accesible y estilizado con la paleta de tokens.
- [ ] Cambio de idioma reactivo ES/EN persistente en `localStorage` bajo la clave `kanarii.language`.
- [ ] Atributo `<html lang="es">` / `<html lang="en">` actualizado dinámicamente según el idioma activo.
- [ ] Integración visible en la cabecera (`TopBar.tsx` / `Header.tsx`).
- [ ] Compilación sin errores TypeScript (`npm run lint`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-16 15:58 (con sincronización global de html lang e i18n event listeners)
- [x] Rama creada: feat/T-118-language-selector-html-lang
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
