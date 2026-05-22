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
1. Activar skill `implementar-feature-dry` → mapear qué existe antes de tocar nada.
2. Proponer plan → esperar aprobación.
3. Confirmación visual obligatoria antes de cualquier commit en `src/`.

## ⚠️ Recordatorio de modelo (acción humana requerida)
El agente no puede cambiar de modelo. Cambia tú manualmente según la tarea:
- **Pro** → feature nueva, refactor complejo, decisiones de arquitectura
- **Flash** → bug fix, lectura de código, edición de docs, preguntas rápidas
- **Perplexity (externo)** → investigación, planning, comparar opciones — ANTES de abrir Antigravity

## Gestión de sesión
- **Una tarea por sesión** → nueva tarea = nueva sesión.
- Una tarea = lo que cabe en un `task-XXX.md` con criterio de done claro.
- Si en medio de una sesión aparece una segunda tarea, termina o pausa
  la actual antes de abrirla.
- Al iniciar una sesión nueva, recordar al usuario: ¿tienes el task file
  escrito? Si no → escríbelo antes de continuar (ver `doe-framework`). 

## Archivos clave
- Reglas completas: `.agents/GEMINI.md`
- Checklist de done: `.agents/DEFINITION_OF_DONE.md`
- Skills activas: `.agents/skills/` | Inactivas: `.agents/skills/_archived/`
- Gestión de skills: activar skill `skill-manager`
- Tareas pendientes: `.agents/tasks/`