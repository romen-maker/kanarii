# Research Sprint 26
> Fuente: Perplexity / Usuario — 2026-08-16
> Tarea principal: Internacionalización ES/EN para campaña de fundraising (i18next + react-i18next)

## Hallazgos clave
- React 19 + Vite 6 exige carga síncrona/estática inicial de recursos i18n para evitar re-renders por importación dinámica en render.
- La persistencia de idioma en `localStorage` con fallback a navegador se gestiona de forma transparente con `i18next-browser-languagedetector`.
- La separación por namespaces por dominio (`common`, `welcome`, `auth`, `communities`, `passport`) permite modularidad limpia y tipado estricto vía módulo `i18next.d.ts`.

## Decisiones tomadas
- **Librería**: `i18next` + `react-i18next` + `i18next-browser-languagedetector`.
- **Estructura**: `src/i18n/index.ts`, `src/types/i18next.d.ts` y `src/locales/{es,en}/*.json`.
- **Persistencia**: `localStorage` por defecto vía plugin detector.
- **Fallback**: Inglés (`en`) como idioma de fallback seguro para evitar textos vacíos en fundraising.

## Descartado
- Carga dinámica asíncrona de traducciones mediante `import()` dentro de componentes por problemas de doble render en React 19.
