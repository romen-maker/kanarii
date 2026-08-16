# Task-120: Internacionalizar páginas públicas de comunidades/nodos y pasaporte público

## Objetivo
Internacionalizar la UI fija de las páginas públicas de comunidades/nodos (`/c/:slug`) y pasaporte público (`/p/:uid`), asegurando que las etiquetas, botones y títulos del sistema se traduzcan mediante `useTranslation()` consumiendo los namespaces `communities` y `passport`, mientras que el contenido generado por usuarios (bios, títulos de propuestas, acuerdos, ofrendas, saberes) mantiene estrictamente su idioma original.

## Contexto técnico
- Integrado desde `docs/sprints/sprint-26-research.md`.
- Observación de cierre T-119: Diferenciar estrictamente UI fija de contenido de usuario.
- Usar `useTranslation('communities')` y `useTranslation('passport')`.
- Archivos JSON en `src/locales/{es,en}/communities.json` y `src/locales/{es,en}/passport.json`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/pages/FichaComunidadView.tsx`
- `src/pages/PasaporteUniversalView.tsx`
- `src/pages/PasaporteComunitarioView.tsx`
- `src/locales/es/communities.json`
- `src/locales/en/communities.json`
- `src/locales/es/passport.json`
- `src/locales/en/passport.json`

## Convenciones de Copy y Glosario EN (Aprobado)
- **Nodo / Comunidad**: `Community Node` (para nodos comunitarios), `Community Space` (para espacios).
- **Pasaporte**: `Community Passport` (para pasaporte comunitario), `Member Profile` (para ficha de usuario).
- **Tríada**:
  - Saberes / Knowledge: `Skills & Knowledge`
  - Ofrendas / Offerings: `Offerings`
  - Necesidades / Needs: `Needs`

## Criterios de done
- [ ] UI fija de FichaComunidadView (`/c/:slug`) internacionalizada en ES/EN.
- [ ] UI fija de PasaporteUniversalView y PasaporteComunitarioView (`/p/:uid`) internacionalizada en ES/EN.
- [ ] Los datos introducidos por miembros (saberes, necesidades, bios, descripción de nodos/comunidades) no se traducen ni alteran.
- [ ] Verificación UI en modo público/incógnito sin autenticación para `/c/:slug` y `/p/:uid`.
- [ ] Compilación sin errores TypeScript (`npx tsc --noEmit`), build limpia (`npm run build`) y lint.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-16 16:35 (con cambios de glosario y verificación pública/incógnito)
- [x] Rama creada: feat/T-120-i18n-communities-passport
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
