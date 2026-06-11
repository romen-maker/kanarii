# Inventario de Skills — Kanarii

> Fuente de verdad del estado de cada skill. Actualizar al activar, archivar o crear skills.
> Última actualización: 11 Jun 2026

---

## Skills Activas (cargadas por Antigravity)

| Skill | Propósito | Cuándo usar |
|---|---|---|
| `accesibilidad-comunitaria` | Inclusión digital para comunidades rurales — **scope específico de Kanarii**, no UX genérico. Edad amplia, dispositivos básicos. | Al terminar cualquier feature con UI |
| `architecture-audit` | Auditoría de arquitectura antes de refactors | Antes de cambios estructurales |
| `buscar-codigo-en-github` | Búsqueda de código en GitHub | Investigación de patrones externos |
| `creador-habilidades` | Crea nuevas skills siguiendo el estándar | Al crear skills nuevas |
| `debug-kanarii` | Debug de lógica de negocio frontend | Bug fixing |
| `developing-genkit-js` | Desarrollo con Firebase Genkit JS | Features de IA |
| `doc-maintainer` | Mantenimiento de documentación | Al actualizar docs |
| `doe-framework` | Crea task files antes de sesiones | Inicio de cualquier tarea |
| `feature-ux-kanarii` | Diseño de flujos UX genéricos | Features nuevas con UI (complementa, no reemplaza, accesibilidad-comunitaria) |
| `firebase-ai-logic-basics` | Lógica de IA con Firebase | Features de IA |
| `firebase-kanarii` | Firebase específico de Kanarii | Cualquier tarea con Firestore/Auth |
| `firebase-security-rules-auditor` | Auditoría de reglas de seguridad | Al modificar reglas Firestore |
| `git-gardener` | Higiene del repo: detecta y elimina ramas mergeadas, gone y stale bajo aprobación | Post-sprint, >15 ramas activas, limpieza manual |
| `implementar-feature-dry` | Implementación DRY de features | Toda sesión de código |
| `inbox-integrator` | Integra código externo desde `inbox/` | Al traer código de AI Studio u otras fuentes |
| `roadmap-a-tarea` | Descompone roadmap en tareas atómicas | Planning + sprint |
| `rule-creator` | Crea nuevas rules siguiendo el estándar | Al crear rules nuevas |
| `skill-manager` | Gestiona el ciclo de vida de skills | Activar/archivar skills |
| `structure-guardian` | Auditoría manual de arquitectura completa | Revisiones periódicas |
| `tech-scout` | Investigación de tecnologías externas | Antes de añadir dependencias |
| `test-e2e-kanarii` | Tests end-to end | QA de features críticas |
| `workflow-designer` | Crea, revisa y refactoriza workflows de Antigravity siguiendo el estándar | Al crear o revisar workflows en `.agents/workflows/` |

---

## Skills Archivadas (NO cargar — solo referencia histórica)

Ubicación: `.agents/skills/_archived/`

| Skill | Razón de archivo | Fecha | Reactivar cuando… |
|---|---|---|---|
| `agent-onboarding` | Sustituida por `/session-start` + `AGENTS.md` actualizado | May 2026 | Nunca (absorbida) |
| `agent-ready-web-contract` | Sustituida por `doe-framework` + `implementar-feature-dry` | May 2026 | Nunca (absorbida) |
| `chrome-devtools-first` | Absorbida por `debug-kanarii` | May 2026 | Nunca (absorbida) |
| `comparar-funciones-de-plataformas` | Cubierta por `tech-scout` + Perplexity | May 2026 | Nunca (absorbida) |
| `firebase-app-hosting-basics` | Setup inicial, no desarrollo activo | May 2026 | Si hay setup de hosting nuevo |
| `firebase-auth-basics` | Absorbida por `firebase-kanarii` | May 2026 | Nunca (absorbida) |
| `firebase-basics` | Absorbida por `firebase-kanarii` | May 2026 | Nunca (absorbida) |
| `firebase-crashlytics` | No en stack actual | May 2026 | Si se integra Crashlytics |
| `firebase-data-connect` | No en stack actual (usamos Firestore directo) | May 2026 | Si el stack cambia a Data Connect |
| `firebase-firestore` | Absorbida por `firebase-kanarii` | May 2026 | Nunca (absorbida) |
| `firebase-hosting-basics` | Setup inicial | May 2026 | Si hay setup de hosting nuevo |
| `firebase-remote-config-basics` | No en stack actual | May 2026 | Si se activa Remote Config |
| `i18n-es` | MVP monoidioma | May 2026 | Al añadir segundo idioma |
| `onboarding-miembro` | Feature en roadmap, no implementada | May 2026 | Al desarrollar onboarding de miembros |
| `opensource-maintainer` | Proyecto privado | May 2026 | Si el repo se hace pública |
| `prompt-engineer` | Absorbida por `/sprint-planning` + sistema de rules | May 2026 | Nunca (absorbida) |
| `visual-identity` | Bloqueada hasta MVP estable | May 2026 | Fase de polish y branding |
