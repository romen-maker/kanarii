# Task-130: Internacionalización de componentes interactivos de animación pedagógica del tour

## Objetivo
Auditar y traducir completamente a ES/EN la UI fija contenida dentro de los 8 componentes interactivos de animación pedagógica del tour, estructurando las claves bajo `tour.animations` en `welcome.json`.

## Contexto técnico
- Durante T-129 se internacionalizó la estructura principal de `/tour` (`KanariiTourPage.tsx`), detectando que las 8 animaciones integradas contenían copy hardcodeado en español.
- Componentes a auditar y traducir:
  1. `GovernanceFlowAnimation.tsx`
  2. `ComunidadesCirculosAnimation.tsx`
  3. `DoubleLinkAnimation.tsx`
  4. `ConsentElectionAnimation.tsx`
  5. `AsynchronousLogicAnimation.tsx`
  6. `RolesAnimation.tsx`
  7. `CruceAnimation.tsx`
  8. `FichaRolesAnimation.tsx`
- Investigación de abreviaturas/iconos:
  - En `ComunidadesCirculosAnimation.tsx`, las letras `M` y `E` corresponden a la estructura de enlaces dobles S3 (**M**iembro de círculo / **E**nlace de círculo o **M**ember / **E**xternal-link). Se documenta formalmente.
- Los diccionarios incluirán las claves estructuradas simétricamente en `es/welcome.json` y `en/welcome.json`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/components/onboarding/GovernanceFlowAnimation.tsx`
- `src/components/onboarding/ComunidadesCirculosAnimation.tsx`
- `src/components/onboarding/DoubleLinkAnimation.tsx`
- `src/components/onboarding/ConsentElectionAnimation.tsx`
- `src/components/onboarding/AsynchronousLogicAnimation.tsx`
- `src/components/onboarding/RolesAnimation.tsx`
- `src/components/onboarding/CruceAnimation.tsx`
- `src/components/onboarding/FichaRolesAnimation.tsx`
- `src/locales/es/welcome.json`
- `src/locales/en/welcome.json`
- `.agents/tasks/task-130.md`
- `docs/sprints/sprint-26.md`

## Criterios de done
- [x] Inventario completo de textos traducibles realizado.
- [x] Abreviaturas `M`/`E` y símbolos analizados y documentados.
- [x] Estructura `tour.animations` añadida simétricamente en `es/welcome.json` y `en/welcome.json`.
- [x] Reemplazo realizado en los 8 componentes utilizando `useTranslation('welcome')`.
- [x] Paridad comprobada con `check-i18n-keys.ts` al 100%.
- [x] Detección estática con `check-i18n-visible-literals.ts` ejecutado sobre las 8 animaciones con 0 warnings de UI fija.
- [x] TypeScript, build y lint sin errores.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-17 11:54
- [x] Rama creada: `feat/T-130-tour-animations-i18n`
- [x] Lock activo: `.agent-session.lock`
- [x] Sesión cerrada correctamente
