# Sprint 26 — 2026-08-17 → 2026-08-21

## Estado
🟢 Completado (2026-08-16)

## Objetivo
Internacionalizar la experiencia de entrada y superficies públicas de Kanarii (ES/EN) para soportar la campaña de fundraising sin traducir la operativa profunda de miembros.

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-116 | Auditar textos hardcodeados y definir alcance exacto ES/EN por rutas y componentes | S | ✅ Completada | `.agents/tasks/task-116.md` |
| T-117 | Instalar y configurar `i18next` + `react-i18next`, proveedor global, detección y persistencia de idioma en `localStorage` | M | ✅ Completada | `.agents/tasks/task-117.md` |
| T-118 | Crear selector ES/EN accesible en cabecera/menú y aplicar el atributo `lang` dinámico al documento HTML | S | ✅ Completada | `.agents/tasks/task-118.md` |
| T-119 | Internacionalizar Welcome, Orientación, navegación, CTAs, login/registro y estados de acceso | M | ✅ Completada | `.agents/tasks/task-119.md` |
| T-120 | Internacionalizar páginas públicas de comunidades/nodos y pasaporte público; mantener contenido de usuario en su idioma original | M | ✅ Completada (Commit `6b2aa07`) | `.agents/tasks/task-120.md` |
| T-121 | Añadir tests/checklist de claves faltantes, fallback controlado y verificación manual del recorrido EN de fundraising | S | ✅ Completada (Commit `0cd33ad`) | `.agents/tasks/task-121.md` |
| T-122 | Actualizar `docs/pages-map.md`, guía de copy y documentación del sprint | S | ✅ Completada | `.agents/tasks/task-122.md` |
| T-123 | Internacionalización completa del motor astrológico (Carta Astral 12 signos/casas y Diseño Humano) | L | ✅ Completada | `.agents/tasks/task-123.md` |
| T-124 | Soporte multilingüe estructurado y regeneración por idioma para perfiles generados por Gemini | M | ✅ Completada | `.agents/tasks/task-124.md` |
| T-125 | Completar internacionalización de Welcome/Home y corregir composición de actividad | M | ✅ Completada | `.agents/tasks/task-125.md` |
| T-126 | Formalizar guardrails e infraestructura de reglas i18n para agentes Antigravity (Fase 1) | S | ✅ Completada | `.agents/tasks/_archived/task-126.md` |
| T-127 | Script auxiliar CLI de detección de copy hardcodeado en JSX en modo WARNING con allowlist (Fase 2) | M | ✅ Completada | `.agents/tasks/_archived/task-127.md` |
| T-128 | Pluralización i18n del contador de miembros en nodos de Welcome | S | ✅ Completada | `.agents/tasks/_archived/task-128.md` |

## Estrategia de Trazabilidad y Fallback de Perfiles Gemini (T-124)
- **Persistencia por Locale**: El objeto `perfilVisualByLocale?: { es?: FichaPerfilVisual; en?: FichaPerfilVisual }` permite almacenar en Firestore las interpretaciones generadas para cada idioma.
- **Retrocompatibilidad (Fallback Legacy)**: Al consultar o guardar un perfil, la aplicación utiliza `perfilVisualByLocale[locale] ?? perfilVisual`, garantizando que perfiles históricos creados sin subobjeto por idioma sigan leyéndose sin fisuras.
- **Trazabilidad de IA**: Cada sub-objeto generado incluye metadatos de trazabilidad (`generatedAt`, `model`, `promptVersion`, `locale`), permitiendo auditorías y regeneraciones por idioma aisladas.

## Notas de planning
- Sprint de urgencia de internacionalización incremental focalizado en la campaña de fundraising.
- Los sprints 24 y 25 quedan pausados temporalmente manteniendo sus tareas pendientes intactas para retomar tras el fundraising.
- No traduce contenido generado por miembros ni la operativa interna (Gobernanza S3, tareas, actas, Telegram).
- Utiliza la arquitectura canónica `react-i18next` con namespaces de traducción (`common`, `welcome`, `auth`, `communities`, `passport`).

## Observaciones para T-120 / T-121 (derivadas del cierre de T-119)
- **Separación de UI vs Contenido de Usuario**: En los bloques inferiores de Orientación/Welcome (feed de actividades, títulos/bios de miembros destacados) distinguir claramente la UI fija (que se debe traducir) de los títulos/propuestas/bios de los usuarios (que conservan su idioma original).
- **Refinamiento de Copy EN**: Revisar en T-121 la adecuación de términos como *"Full Galactic Blueprint"* para asegurar la máxima claridad ante una audiencia internacional.
