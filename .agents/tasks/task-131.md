# Task-131: Internacionalización de FichaView y catálogo Kin determinista

## Objetivo
Internacionalizar toda la UI fija inventariada de la vista de ficha privada (`FichaView.tsx`) y de sus componentes directos dentro del alcance auditado, así como los textos deterministas del Kin Maya (`kinMaya.ts`) mediante el namespace `passport.json`, manteniendo intacta la representación de fechas actual y los datos del usuario.

## Cambio de Alcance (Sprint 26)
- **NO REFACTORIZAR FECHAS EN ESTE SPRINT**: La refactorización de fechas se ha pospuesto a la idea técnica en `docs/idea-inbox/2026-08-17-centralizar-formato-fechas-civiles-e-instantes.md`.
- Se conserva intacta la lógica actual de renderizado de `fechaNacimiento`, `fechaLlegada`, `fechaSalida`, `hora` y `updatedAt`. Solo se localizan los textos estructurales fijos que las rodean (`Nacimiento`, `Lugar`, `Género`, `a las`, `Ficha actualizada el`, etc.).

## Alcance Permitido
- `src/pages/FichaView.tsx`
- `src/components/layout/UserAvatarMenu.tsx`
- `src/locales/es/passport.json`
- `src/locales/en/passport.json`
- `src/locales/es/common.json`
- `src/locales/en/common.json`
- `src/lib/kinMaya.ts` (exclusivamente para añadir `selloIndex`, `colorIndex` y `tonoIndex` a la interfaz y return de `KinData`, sin modificar lógica de cálculo)
- `.agents/tasks/task-131.md`
- `docs/sprints/sprint-26.md`

---

## Inventario y Clasificación de Campos de FichaView

| Campo / Texto en `FichaView` | Línea en `FichaView.tsx` | Clasificación | Tratamiento i18n |
|---|---|---|---|
| `Tu Ficha Comunitaria` | L356 | **1. UI Fija** | `passport:myPassportTitle` |
| Banner *"¿Quieres descubrir tu Manual Galáctico Completo?"* | L365-L375 | **1. UI Fija** | `passport:galacticBanner.*` |
| `Nombre` de usuario (`datos.nombre`) | L386 | **4. Contenido de miembro** | **Conservar idioma original** |
| Roles de comunidad (`Propietario/a`, `Miembro`, `Voluntario/a`, `ya partió`, `hasta`) | L414-L428 | **1. UI Fija** | `passport:roles.[key]` |
| `Editar` | L440 | **1. UI Fija** | `passport:buttons.edit` |
| `Salir de la Comunidad` | L447 | **1. UI Fija** | `passport:buttons.leaveCommunity` |
| `Identidad base` | L459 | **1. UI Fija** | `passport:sections.baseIdentity` |
| `Nacimiento` | L463 | **1. UI Fija** | `passport:labels.birth` |
| `a las` | L464 | **1. UI Fija** | `passport:labels.atTime` |
| Valores de `fechaNacimiento` y `hora` | L464 | **5. Lógica de fecha conservada** | **Conservar expresión y representación actual** |
| `Lugar` | L467 | **1. UI Fija** | `passport:labels.place` |
| Valor de lugar (`datos.lugar`) | L468 | **4. Contenido de miembro** | **Conservar texto del usuario** |
| `Género` | L471 | **1. UI Fija** | `passport:labels.gender` |
| Valor de género (`datos.genero`) | L472 | **4. Contenido de miembro** | **Conservar valor guardado por el usuario** |
| `Firma Galáctica` | L482 | **1. UI Fija** | `passport:astral.galacticSignature` |
| Kin Maya determinista | L483-L484 | **2. Catálogo Kin determinista** | `passport:kin.format` con índices `kin.tones.*`, `kin.seals.*`, `kin.colors.*`, `kin.roles.*` de `calcularKin` |
| `Tríada Comunitaria` | L495 | **1. UI Fija** | `passport:sections.triad` |
| `Ofrendas (Lo que aporto)` | L501 | **1. UI Fija** | `passport:triad.offers` |
| Tags de ofrendas | L507 | **4. Contenido de miembro** | **Conservar textos del usuario** |
| `Saberes y Habilidades` | L519 | **1. UI Fija** | `passport:triad.skills` |
| Tags de saberes | L525 | **4. Contenido de miembro** | **Conservar textos del usuario** |
| `Necesidades (Lo que requiero)` | L537 | **1. UI Fija** | `passport:triad.needs` |
| Tags de necesidades | L543 | **4. Contenido de miembro** | **Conservar textos del usuario** |
| `Sin definir todavía.` | L511, L529, L547 | **1. UI Fija** | `passport:triad.empty` |
| `Rol y convivencia` | L558 | **1. UI Fija** | `passport:sections.roleAndCoexistence` |
| `Participación en Kanarii` | L562 | **1. UI Fija** | `passport:labels.kanariiRole` |
| Texto de rol comunitario (`datos.rol_comunidad`) | L563 | **4. Contenido de miembro** | **Conservar texto del usuario** |
| `Antigüedad` | L566 | **1. UI Fija** | `passport:labels.antiquity` |
| Valor de antigüedad con pluralización | L567 | **1. UI Fija** | `t('labels.membershipDuration', { count: datos.antiguedad_anos })` (`membershipDuration_one` / `membershipDuration_other`) |
| `Estado de tensión y cuidado` | L576 | **1. UI Fija** | `passport:sections.tension` |
| Texto de tensión (`datos.tension`) | L579 | **4. Contenido de miembro** | **Conservar texto del usuario** |
| `Ficha actualizada el` | L587 | **1. UI Fija** | `t('labels.updatedAt', { date: ... })` (preservando la lógica actual de fecha) |
| Perfil Gemini / Arquetipo histórico | Firestore | **3. Interpretación Gemini histórica** | **Conservar idioma de generación** (`perfilVisualByLocale[locale] ?? perfilVisual`) |

---

## Criterios de Done de T-131
- [ ] Inyección de `useTranslation('passport')` en `FichaView.tsx`.
- [ ] UI fija traducida al 100% en ES/EN sin modificar lógica de fechas ni escrituras Firestore.
- [ ] Kin Maya expuesto usando índices numéricos e i18n (`selloIndex`, `tonoIndex`, `colorIndex`).
- [ ] `docs/idea-inbox/2026-08-17-centralizar-formato-fechas-civiles-e-instantes.md` registrado.
- [ ] Verificaciones `check-i18n-keys`, `check-i18n-visible-literals`, `tsc`, `build` y `lint` superadas.
