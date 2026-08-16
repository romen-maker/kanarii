# Task-117: Instalar y configurar i18next + react-i18next, proveedor global, detección y persistencia de idioma en localStorage

## Objetivo
Instalar las dependencias de i18n (`i18next`, `react-i18next`, `i18next-browser-languagedetector`), configurar `src/i18n/index.ts`, los tipos globales de TypeScript `src/types/i18next.d.ts` y montar el provider en el punto de entrada de la aplicación (`src/main.tsx`).

## Contexto técnico
Investigación integrada desde `docs/sprints/sprint-26-research.md`.
Utilizaremos los diccionarios estáticos creados en T-116 (`src/locales/{es,en}/*.json`) cargados síncronamente en `src/i18n/index.ts`. La preferencia persistirá automáticamente en `localStorage` con fallback a `es` (por defecto) o `en`.

## Caja de archivos
Archivos autorizados para modificación:
- `package.json`
- `src/i18n/index.ts`
- `src/types/i18next.d.ts`
- `src/main.tsx`

## Criterios de done
- [ ] `i18next`, `react-i18next` e `i18next-browser-languagedetector` instalados en `package.json`.
- [ ] `src/i18n/index.ts` inicializado con los namespaces `common`, `welcome`, `auth`, `communities`, `passport`.
- [ ] `src/types/i18next.d.ts` configurado con `CustomTypeOptions` para autocomplete estricto de claves.
- [ ] Import de `./i18n` añadido en `src/main.tsx`.
- [ ] Compilación sin errores TypeScript (`npm run lint`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-16 15:55 (con ajustes de orden de resolución y clave localStorage)
- [x] Rama creada: feat/T-117-i18n-setup-provider
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
