# AGENTS.md — Kanarii
> Contexto mínimo. Detalle en `.agents/GEMINI.md`.

## Stack
React 18 + TypeScript + Firebase (Firestore, Auth, App Hosting). Vite. ES2022.

## Architecture — 3 capas (OBLIGATORIO)
- UI → `src/components/` + `src/pages/`
- Estado → `src/hooks/`
- Datos → `src/lib/appService.ts` ← único punto de acceso a Firestore

## Reglas críticas
- Sin lógica Firestore en componentes ni páginas.
- Sin `window.confirm/alert/prompt` → usar `useToast` o modales.
- Todos los campos: camelCase inglés. Consultar `appService.ts` antes de crear campos nuevos.
- MVP primero. Lo nice-to-have va a `roadmap.md`.
- Código en inglés. Comunicación en español.

## Antes de escribir código (cada sesión)
1. Ejecutar `/session-start` → detecta lock, selecciona tarea, declara Caja.
2. Activar skill `implementar-feature-dry` → mapear qué existe antes de tocar nada.
3. Confirmación visual obligatoria antes de cualquier commit en `src/`.

## ⚠️ Recordatorio de modelo (acción humana requerida)
El agente no puede cambiar de modelo. Cambia tú manualmente según la tarea:
- **Pro** → feature nueva, refactor complejo, decisiones de arquitectura
- **Flash** → bug fix, lectura de código, edición de docs, preguntas rápidas
- **Perplexity (externo)** → investigación, planning, comparar opciones — ANTES de abrir Antigravity

## Gestión de sesión (sistema antisabotaje)
- **Inicio de semana (lunes):** ejecutar `/sprint-planning` → genera sprint file + prompt para Perplexity.
- **Inicio de sesión:** ejecutar `/session-start` → detecta sesiones colgadas, declara Caja, crea lock.
- **Fin de sesión:** ejecutar `/session-close` (parte de `/session-start`) → commit atómico, marca tarea, borra lock.
- **Una tarea por sesión** → nueva tarea = nueva sesión.
- **Ideas en vuelo:** el agente las captura en `docs/idea-inbox/` sin interrumpir. Se clasifican el lunes.
- **Sin task file = sin sesión.** Si no hay `task-XXX.md` → activar `doe-framework` primero.

## Archivos clave del sistema
- Reglas completas: `.agents/GEMINI.md`
- Checklist de done: `.agents/DEFINITION_OF_DONE.md`
- Skills activas: `.agents/skills/` (excluye `_archived/`)
- Skills inactivas (no cargar): `.agents/skills/_archived/`
- Inventario de skills: `.agents/context/skills-inventory.md`
- Sprint activo: `docs/sprints/`
- Ideas capturadas: `docs/idea-inbox/`
- Tareas en curso: `.agents/tasks/`
- Script de sesión: `scripts/agent/check-session.sh`
