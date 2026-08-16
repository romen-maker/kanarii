# Sprint 26 — 2026-08-17 → 2026-08-21

## Estado
🟡 En curso

## Objetivo
Internacionalizar la experiencia de entrada y superficies públicas de Kanarii (ES/EN) para soportar la campaña de fundraising sin traducir la operativa profunda de miembros.

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-116 | Auditar textos hardcodeados y definir alcance exacto ES/EN por rutas y componentes | S | ✅ Completada | `.agents/tasks/task-116.md` |
| T-117 | Instalar y configurar `i18next` + `react-i18next`, proveedor global, detección y persistencia de idioma en `localStorage` | M | ✅ Completada | `.agents/tasks/task-117.md` |
| T-118 | Crear selector ES/EN accesible en cabecera/menú y aplicar el atributo `lang` dinámico al documento HTML | S | ✅ Completada | `.agents/tasks/task-118.md` |
| T-119 | Internacionalizar Welcome, Orientación, navegación, CTAs, login/registro y estados de acceso | M | ⬜ Pendiente | — |
| T-120 | Internacionalizar páginas públicas de comunidades/nodos y pasaporte público; mantener contenido de usuario en su idioma original | M | ⬜ Pendiente | — |
| T-121 | Añadir tests/checklist de claves faltantes, fallback controlado y verificación manual del recorrido EN de fundraising | S | ⬜ Pendiente | — |
| T-122 | Actualizar `docs/pages-map.md`, guía de copy y documentación del sprint | S | ⬜ Pendiente | — |

## Notas de planning
- Sprint de urgencia de internacionalización incremental focalizado en la campaña de fundraising.
- Los sprints 24 y 25 quedan pausados temporalmente manteniendo sus tareas pendientes intactas para retomar tras el fundraising.
- No traduce contenido generado por miembros ni la operativa interna (Gobernanza S3, tareas, actas, Telegram).
- Utiliza la arquitectura canónica `react-i18next` con namespaces de traducción (`common`, `welcome`, `auth`, `communities`, `passport`).
