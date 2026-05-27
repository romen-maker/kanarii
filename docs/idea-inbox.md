# Idea Inbox 💡

Captura rápida de ideas, mejoras y bugs detectados entre sprints.
Este archivo es procesado durante el sprint planning para convertir entradas en tareas formales o descartarlas.

---

## Pendiente de procesar

### [BUG] Redirect a comunidad tras usar código de invitación
- **Detectado**: 23/05/2026 — validación manual del flujo de invitaciones
- **Comportamiento actual**: tras usar un código válido e incorporarse, el usuario no es redirigido automáticamente a la comunidad.
- **Comportamiento esperado**: `usar código → membresía creada → navigate(/c/${communityId})`
- **Impacto**: UX — el nuevo miembro no sabe que ya pertenece a la comunidad ni puede acceder a sus datos inmediatamente.
- **Prioridad sugerida**: ALTO
- **Área**: componente de validación de invitación (probablemente `src/pages` o `src/components`)

### [BUG] Lista de miembros muestra email en lugar de nombre
- **Detectado**: 23/05/2026 — captura de pantalla comunidad "La Alpispa"
- **Comportamiento actual**: en la pestaña Miembros, el campo de nombre muestra el email (`romenusabo3@gm...`, `casacuevaruraltre...`).
- **Causa probable**: el documento `community_member` se crea al aceptar la invitación sin copiar `displayName` desde el perfil de usuario (`users/{uid}`).
- **Impacto**: visual + confianza — la identidad de los miembros no es legible.
- **Prioridad sugerida**: ALTO
- **Área**: función de creación de `community_member` al procesar invitación. Ver también deuda de T-005 en `.agents/tasks/_archived/task-005.md`.
- **Fix relacionado en roadmap**: "Migrar `community_member` docs antiguos para rellenar `displayName`/`email`/`photoURL`"

### [FEATURE] T-022 — Pasaporte Comunitario (PasaporteComunitarioView)
- **Detectado**: 27/05/2026 — sesión de investigación S3/UX Sprint 05
- **Descripción**: nueva vista pública del perfil de usuario como "pasaporte" comunitario, alejada del concepto de currículum corporativo.
- **Principios de diseño (no negociables)**:
  - **Triada Comunitaria**: mostrar tres bloques separados y en este orden: `ofrendas[]` (lo que doy), `saberes[]` (lo que sé), `necesidades[]` (lo que busco)
  - **Sin jerarquías visibles**: mostrar círculos y rol como contexto, nunca como rango
  - **Sin contadores numéricos públicos**: no mostrar "5 propuestas", "10 tareas" — genera gamificación tóxica contraria al Principio de Equivalencia S3. Si se muestran métricas, usar Radar Chart visual (escucha / acción / estructura / cuidado) sin números
  - **Sin DM privado**: el CTA principal es "Conectar vía Tablón" (redirige a Marketplace/Tablón pre-rellenando mención al usuario). Para visitantes no logueados: solo botón "Solicitar unirse a la comunidad"
- **Referentes**: Peerdom, Loomio
- **Prioridad sugerida**: ALTO
- **Área**: nueva página `src/pages/PasaporteComunitarioView.tsx` + actualizar routing
- **Dependencia**: T-023 (migración modelo de datos) debe estar lista para que la Triada funcione correctamente; puede arrancar con modelo viejo en paralelo

### [REFACTOR] T-023 — Migración limpia modelo de datos: Triada Comunitaria
- **Detectado**: 27/05/2026 — sesión de investigación Sprint 05
- **Descripción**: el modelo actual mezcla ofrendas, saberes y necesidades en texto libre (`datosPersona.saberes_recorrido`). Necesita refactorizarse en tres arrays separados.
- **Pasos requeridos** (en orden estricto):
  1. **Actualizar `_types.ts`**: añadir `ofrendas: string[]`, `saberes: string[]`, `necesidades: string[]` a `DatosPersona`
  2. **Script de migración con dry-run**: leer `/profiles/{uid}`, parsear texto libre actual y distribuir en los tres arrays, aplicar con `--write` explícito (igual que T-018)
  3. **Actualizar formulario de onboarding**: campos de texto libre → inputs de tags para cada concepto
  4. **Actualizar modal de edición de ficha y FichaPreview**: leer y escribir los nuevos arrays en lugar del campo de texto libre
- **Riesgo**: toca onboarding, perfil y vista de ficha — sprint propio recomendado
- **Prioridad sugerida**: MEDIO — T-022 puede arrancar con modelo viejo
- **Área**: `_types.ts`, `scripts/`, onboarding, `FichaView.tsx`, `FichaPreview.tsx`, modal de edición

### [ADR] ADR-006 — Client-side vs Cloud Functions para transiciones S3
- **Detectado**: 27/05/2026 — investigación T-019
- **Decisión a documentar**: mantener transiciones de estado S3 en client-side con batch atómico. Razones: offline-first, coste cero, sin over-engineering para el tamaño actual. Cloud Functions solo si se necesitan notificaciones push o caducado automático de propuestas (post-MVP).
- **Advertencia de rango**: quórum al 50% y clasificación de respuestas positivas (consentimiento + preocupación) son decisiones de gobernanza — validar con la comunidad de Arteara antes de activar cierre automático en producción.

### [ADR] ADR-007 — Modelo de resolución de objeciones: "Objetor retira"
- **Detectado**: 27/05/2026 — investigación T-020
- **Decisión a documentar**: la objeción desaparece cuando el objetor cambia su voto (no cuando el autor la marca como resuelta). Evita el patrón de "poder-sobre". Ya implementado en `registerPropuestaResponse` — solo falta documentarlo formalmente.

### [ADR] ADR-008 — Pasaporte Comunitario: Principio de Equivalencia en UI
- **Detectado**: 27/05/2026 — investigación T-022
- **Decisión a documentar**: sin contadores numéricos públicos, sin DM privado, Triada Comunitaria (ofrendas/saberes/necesidades) como estructura base del perfil público. Referentes: Peerdom, Loomio.

---

## Procesadas

_Vacío — primera versión de este archivo._
