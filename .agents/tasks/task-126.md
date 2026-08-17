# Task-126: Formalizar guardrails de i18n para agentes en Kanarii (Fase 1)

## Estado
✅ Completada

## Propósito
Convertir los aprendizajes del Sprint 26 en reglas, skills y validaciones mantenibles para evitar regresiones de internacionalización en futuros agentes, definiendo las fronteras entre UI fija y contenido dinámico de miembros.

## Reglas e Infraestructura Incorporadas (Fase 1)
- `.agents/rules/i18n-enforcement.md`: Regla canónica especializada de i18n con fronteras explícitas, excepciones permitidas y protocolo de cierre.
- `.agents/skills/implementar-feature-dry/SKILL.md`: Checklist de pre-implementación y protocolo de verificación runtime i18n antes de solicitar confirmación visual.
- `.agents/GEMINI.md`: Referencia corta minimalista en los Principios Core.

## Límites de Fase 1
- Ámbito estrictamente de documentación e instrucciones de comportamiento del agente (`.agents/`).
- Sin cambios en código de aplicación (`src/`), diccionarios de producto (`src/locales/`) ni Firestore.

## Diseño Diferido de Fase 2 (Futura automatización mecanizada)
- Creación del script `scripts/check-i18n-visible-literals.ts` como herramienta auxiliar CLI en modo `WARNING` (código de salida `0`).
- Diseñado para recibir rutas/archivos modificados a revisar, detectar hardcodes conocidos (ej: *"Miembro activo"*, *"Conectado y al día"*), permitir una allowlist configurable de falsos positivos y mantenerse fuera de CI hasta su validación tras varios sprints.

## Checklist de Cierre
- [x] Plan aprobado recibido
- [x] Rama creada: `feat/T-126-i18n-guardrails`
- [x] Lock activo: `.agent-session.lock`
- [x] Regla canónica `.agents/rules/i18n-enforcement.md` creada
- [x] Skill `.agents/skills/implementar-feature-dry/SKILL.md` actualizada
- [x] Referencia en `.agents/GEMINI.md` añadida
- [x] Diff de los 3 archivos revisado y aprobado visualmente
- [x] Sesión cerrada correctamente
