# Task-116: Auditar textos hardcodeados y definir alcance exacto ES/EN por rutas y componentes

## Objetivo
Mapear y auditar todos los textos e interfaces hardcodeadas en la capa pública y de entrada de Kanarii (Welcome, Auth, Tour, Pasaporte público y Comunidad pública) para preparar los diccionarios de traducción iniciales.

## Contexto técnico
Investigación integrada desde `docs/sprints/sprint-26-research.md`.
La app utiliza React 19 + Vite 6 y no tiene infraestructura de i18n previa. Los diccionarios se dividirán por namespaces: `common`, `welcome`, `auth`, `communities`, `passport`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/locales/es/common.json`
- `src/locales/en/common.json`
- `src/locales/es/welcome.json`
- `src/locales/en/welcome.json`
- `src/locales/es/auth.json`
- `src/locales/en/auth.json`
- `src/locales/es/communities.json`
- `src/locales/en/communities.json`
- `src/locales/es/passport.json`
- `src/locales/en/passport.json`
- `docs/i18n-audit-fundraising.md`

## Criterios de done
- [ ] Mapeo completo de textos hardcodeados en superficies de fundraising documentado.
- [ ] Archivos base JSON en `src/locales/es/` y `src/locales/en/` creados con estructura clave-valor homogénea.
- [ ] Compilación sin errores TypeScript.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-16 15:50
- [x] Rama creada: feat/T-116-audit-i18n-json-base
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
