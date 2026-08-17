# Task-127: Script auxiliar CLI de detección de copy hardcodeado en JSX en modo WARNING con allowlist (Fase 2)

## Objetivo
Implementar un script de asistencia CLI (`scripts/check-i18n-visible-literals.ts`) en modo WARNING que escanee componentes TSX/JSX en busca de copy visible hardcodeado, permitiendo una allowlist configurable de falsos positivos y sin bloquear el entorno de desarrollo ni CI.

## Contexto técnico
- Durante T-125 y T-125-FIX se detectó copy hardcodeado en JSX que no fue capturado por `check-i18n-keys.ts` (que solo audita paridad de claves en diccionarios `locales/es` ↔ `locales/en`).
- Se definió la Fase 2 de i18n guardrails para crear una herramienta de auditoría basada en CLI en modo `WARNING` (código de salida `0`).
- Debe aceptar argumentos CLI para escanear componentes o directorios específicos (ej: `npx tsx scripts/check-i18n-visible-literals.ts src/components/onboarding/WelcomeHeroSections.tsx`).
- Debe contar con una allowlist de excepciones permitidas segú `.agents/rules/i18n-enforcement.md` (`Kanarii`, iconos/símbolos, tokens técnicos, etc.).

## Caja de archivos
Archivos autorizados para modificación:
- `scripts/check-i18n-visible-literals.ts`
- `package.json`
- `.agents/tasks/task-127.md`

## Criterios de done
- [ ] Script `scripts/check-i18n-visible-literals.ts` creado y funcional.
- [ ] Operación en modo `WARNING` exclusivamente (salida limpia por stdout/stderr con exit code 0).
- [ ] Cobertura de allowlist para marcas, números dinámicos y símbolos permitidos.
- [ ] Prueba exitosa ejecutándolo sobre `WelcomeHeroSections.tsx`, `Welcome.tsx` y `SyncIndicator.tsx`.
- [ ] Compilación TypeScript sin errores.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-17 11:34
- [x] Rama creada: `feat/T-127-i18n-visible-literals-script`
- [x] Lock activo: `.agent-session.lock`
- [x] Script `scripts/check-i18n-visible-literals.ts` implementado con AST
- [x] Script `check:i18n-literals` añadido a `package.json`
- [x] Calibración realizada sobre los 3 componentes solicitados
- [x] Compilación y linting superados
- [x] Sesión cerrada correctamente
