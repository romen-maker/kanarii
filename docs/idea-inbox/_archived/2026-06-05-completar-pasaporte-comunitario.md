# Idea: Completar el Pasaporte Comunitario (T-022 incompleto) - OG tags, flujo Conectar y widget Kin Maya

- **Idea:** Completar el Pasaporte Comunitario añadiendo OG tags dinámicos para compartir externamente, implementar el flujo de solicitud real para el botón "Conectar" cuando el visitante no es miembro, e integrar el widget de Kin Maya del usuario en el pasaporte.
- **Impacto estimado:** Medio
- **Contexto:** El Pasaporte existe y funciona. FichaView ya tiene botones de navegación y copia de URL. Pero la auditoría del código real revela que hay varios gaps para hacerlo "compartible de verdad".
- **Capturado:** 2026-06-05

---

## Gaps Pendientes y Soluciones

### GAP 1 — Avatar real
- **Estado de auditoría:** DESCARTADO: ya existe en `src/pages/PasaporteComunitarioView.tsx` (línea 109, mapea `avatarUrl` usando `memberInfo.photoURL` o fallback) y `src/components/perfil/PasaporteVisual.tsx` (líneas 50-61, renderiza la imagen o fallback a iniciales).

### GAP 2 — Botón "Conectar" sin flujo real (CONFIRMADO)
- **Evidencia en código:** En `PasaporteComunitarioView.tsx` (líneas 53-58), `handleConnect` solo ejecuta `setCommunityId(slug)` y navega a `/tablon`.
- **Problema:** Si el visitante no es miembro de la comunidad, obtiene acceso visual inmediato de contexto en la app, pero no tiene membresía ni registro real en la misma.
- **Solución:** Detectar si el visitante ya es miembro; de lo contrario, disparar el flujo de solicitud de ingreso (`AdminSolicitudesView`) antes de permitir el acceso.

### GAP 3 — Sin OG tags dinámicos (CONFIRMADO)
- **Evidencia en código:** `PasaporteComunitarioView.tsx` carece de `<Helmet>`, `<meta>` u otra lógica de inyección de etiquetas Open Graph (OG).
- **Problema:** Al compartir el enlace del pasaporte externamente, no se visualiza información descriptiva (título, descripción, imagen).
- **Solución:** Utilizar `react-helmet-async` (o similar) para inyectar dinámicamente `<meta property="og:title">`, `og:description` (con el rol o Kin del miembro) y `og:image`.

### GAP ADICIONAL — Integración del Kin Maya en el Pasaporte (CONFIRMADO)
- **Evidencia en código:** `PasaporteVisual.tsx` no renderiza ni importa la lógica del Kin Maya (`src/lib/kinMaya.ts`).
- **Solución:** Integrar el widget del Kin Maya del miembro en el diseño del pasaporte para mostrar su firma galáctica e inyectar su rol natural comunitario dentro del pasaporte visual.

---

- **Nota para sprint planning:** Esta idea completa el trabajo iniciado en sprints anteriores sobre el perfil comunitario. Tiene baja deuda técnica (no hay que crear páginas nuevas) y alta visibilidad para usuarios externos. Priorizar en el próximo sprint junto con la expansión del Kin Maya.
