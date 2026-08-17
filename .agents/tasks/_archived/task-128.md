# Task-128: Pluralización i18n del contador de miembros en nodos de Welcome

## Objetivo
Internacionalizar y pluralizar el contador de miembros en las tarjetas de espacios/nodos de `WelcomeHeroSections.tsx`, sustituyendo la cadena hardcodeada `{node.miembrosCount} miembros` por las claves pluralizadas `nodes.membersCount_one` y `nodes.membersCount_other`.

## Contexto técnico
- Durante la calibración de T-127 se detectó `src/components/onboarding/WelcomeHeroSections.tsx:332` (`{node.miembrosCount} miembros`) como un hardcode verdadero de UI fija.
- Se debe implementar la pluralización estándar con i18next `t('nodes.membersCount', { count: node.miembrosCount })` soportando adecuadamente el valor 0, 1 y N.
- `Tawăzawazt` en `Welcome.tsx` se clasifica como una excepción contextual de nombre propio canónico no traducible y se mantiene fuera de i18n y fuera de la allowlist global.

## Caja de archivos
Archivos autorizados para modificación:
- `src/components/onboarding/WelcomeHeroSections.tsx`
- `src/locales/es/welcome.json`
- `src/locales/en/welcome.json`
- `.agents/tasks/task-128.md`
- `docs/sprints/sprint-26.md`

## Criterios de done
- [x] Claves `membersCount_one` y `membersCount_other` añadidas en el bloque `nodes` de `es/welcome.json` y `en/welcome.json`.
- [x] Sustitución realizada en `WelcomeHeroSections.tsx` con comprobación `node.miembrosCount != null`.
- [x] `check-i18n-keys.ts` sin errores.
- [x] `check-i18n-visible-literals.ts` ejecutado sobre `WelcomeHeroSections.tsx` sin reportar el warning de miembros.
- [x] TypeScript, build y lint sin errores.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-17 11:43
- [x] Rama creada: `feat/T-128-welcome-members-count-i18n`
- [x] Lock activo: `.agent-session.lock`
- [x] Sesión cerrada correctamente
