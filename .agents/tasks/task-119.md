# Task-119: Internacionalizar Welcome, Orientación, navegación, CTAs, login/registro y estados de acceso

## Objetivo
Reemplazar todos los textos e interfaces hardcodeados por hooks `useTranslation()` en las pantallas de entrada y navegación principal: Welcome/Orientación, Tour, Consentimiento, Auth Modal, Sidebar y BottomNav, consumiendo los namespaces `common`, `welcome` y `auth`.

## Contexto técnico
Investigación integrada desde `docs/sprints/sprint-26-research.md`.
Utilizaremos `useTranslation('welcome')`, `useTranslation('common')` y `useTranslation('auth')`. Mantendremos los diccionarios limpios en `src/locales/{es,en}/`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/pages/Welcome.tsx`
- `src/components/onboarding/WelcomeHeroSections.tsx`
- `src/components/AuthGateModal.tsx`
- `src/components/Sidebar.tsx`
- `src/components/BottomNav.tsx`
- `src/locales/es/welcome.json`
- `src/locales/en/welcome.json`
- `src/locales/es/common.json`
- `src/locales/en/common.json`
- `src/locales/es/auth.json`
- `src/locales/en/auth.json`

## Criterios de done
- [ ] Textos de Welcome / Orientación traducibles al alternar el idioma.
- [ ] Auth Modal (Magic Link, Google Auth, inputs y botones) completamente traducido ES/EN.
- [ ] Menús de navegación (`Sidebar.tsx`, `BottomNav.tsx`) traducidos dinámicamente con `common.json`.
- [ ] Compilación sin errores TypeScript (`npm run lint`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-16 16:02 (con no traducción de contenido dinámico y configuración centralizada de navegación)
- [x] Rama creada: feat/T-119-i18n-welcome-auth-nav
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
