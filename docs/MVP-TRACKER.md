# MVP Tracker

> **Fuente estratégica de progreso hacia MVP.**  
> Se actualiza en `/sprint-planning` a partir de `ROADMAP.md`, `docs/IMPLEMENTED.md` y sprints archivados.  
> Las tareas diarias viven en el `ROADMAP.md`. Este archivo mide el **valor entregado**, no el volumen de tickets.

---

## Reglas de contabilidad

- Solo cuentan capacidades etiquetadas como `MVP`.
- Tareas `post-MVP`, `deuda técnica` e `infra` **no aportan puntos** salvo que desbloqueen directamente una capacidad MVP marcada como bloqueada.
- El % de cada capacidad se asigna manualmente en `/sprint-planning` y se revisa con evidencia (task IDs o archivos clave).
- El script `update-mvp-tracker.sh` recalcula el **total global** automáticamente a partir de esta tabla; no modifica % individuales.

---

## Fórmula

```
Progreso MVP global = Σ (peso_capacidad × % capacidad) / 100
```

Ejemplo: C3 pesa 25, va al 85% → aporta 21.25 puntos al total.

---

## Tabla de capacidades

| ID | Capacidad | Peso | Estado | % cap. | Tareas clave | Pendiente para 100% |
|---|---|---:|---|---:|---|---|
| C1 | Acceso y membresía multi-comunidad | 15 | 🟢 | 95 | T-001, T-002, T-003, T-006, T-010, T-011, T-017, T-032 | Fix Safari cookies edge cases |
| C2 | Perfiles, fichas y tríada comunitaria | 15 | 🟢 | 90 | T-009, T-018, T-022, T-036, T-038, T-052, T-055, T-062, T-063, T-064 | Pulido menor pasaportes |
| C3 | Gobernanza S3 operativa end-to-end | 25 | 🟢 | 90 | T-019, T-020, T-027, T-031, T-033, T-034, T-030, T-065, T-066 | Prueba sesión real con ≥2 miembros |
| C4 | Marketplace y acuerdos | 15 | 🟡 | 90 | T-023, T-026, T-039, T-024, T-043, T-069, T-070 | Pulido menor de flujos de contraoferta |
| C5 | Onboarding y ayuda contextual | 10 | 🟢 | 95 | T-035, T-057, sprint-00 onboarding base | TourStepLayout.tsx wrapper (BAJO) |
| C6 | Robustez base: permisos, consistencia, offline | 20 | 🟡 | 90 | T-001, T-005, T-007, T-008, T-012, T-028, T-029, T-032, T-037, T-040, T-051, T-071 | Paginación cursor-based (MEDIO) |
| **TOTAL** | | **100** | | **91%** | | |

> 🧮 Cálculo: (15×95 + 15×90 + 25×90 + 15×90 + 10×95 + 20×90) / 100 = **91.25%** → redondeado a **91%**

---

## Criterios "Done para MVP" por capacidad

### C1 — Acceso y membresía multi-comunidad
- [x] Login estable en todos los navegadores principales.
- [x] Selector de comunidad funcional y persistente (sidebar).
- [x] Invitaciones y solicitudes sin bypass de membresía (T-010).
- [x] Roles básicos (admin / miembro / visitante) aplicados por comunidad (T-001).
- [x] displayName / photoURL consistentes en todos los contextos (T-006, T-009, T-017).
- [x] Fix bug fallback `currentCommunityId` en Safari/cookies bloqueadas (T-032).
- [ ] Validación edge cases Safari en sesiones simultáneas (seguimiento pendiente).

### C2 — Perfiles, fichas y tríada comunitaria
- [x] Perfil visible y consistente cross-device (T-009, T-018).
- [x] Ficha comunitaria editable y legible por todos los miembros.
- [x] Tríada (ofrendas, saberes, necesidades) persistente — bug fix TagArrayEditor (T-038), migración legacy (T-055).
- [x] Pasaporte visual usable con Tríada, OG tags y widget Kin Maya (T-052).
- [x] **T-062** (ALTO): Unificar superficies de perfil con `<ManualSeccionesViewer>` e integración híbrida (Sprint 15).
- [x] **T-063** (ALTO): Rediseño Pasaporte Comunitario como landing social compartible (Sprint 15).
- [x] **T-064** (ALTO): Pasaporte Universal /p/:uid (Sprint 15).

### C3 — Gobernanza S3 operativa end-to-end
- [x] Wizard de creación: tensión/driver → propuesta → ejecución y revisión.
- [x] Sala de deliberación con timeline S3 y visualización de participantes.
- [x] Modal con 4 opciones de respuesta S3 (Consentimiento, Preocupación, Duda, Objeción).
- [x] Flujo de aclaración de objeciones con activeObjectionsCount (T-031).
- [x] Transición automática en_deliberacion → en_objeciones; integrando solo manual por autor (T-031).
- [x] Directorio de decisiones con filtros por estado y badge "requiere atención" (T-027).
- [x] Fix bug carga infinita deliberación (T-030).
- [x] Badge visual "acuerdo cálido" diferenciado en PropuestaDetail (Sprint 15 — T-066).
- [x] Estandarizar campo `reason` a `purpose` en propuestas (Sprint 15 — T-065).
- [ ] Prueba en sesión real con ≥2 miembros externos documentada.

### C4 — Marketplace y acuerdos
- [x] Catálogo de servicios y recursos navegable (ServicioDetailModal).
- [x] Creación y cierre de acuerdos funcional.
- [x] Vista de detalle con historial y CTA de enmienda (T-039).
- [x] Directorio global accesible.
- [x] Sistema leído/no leído en acuerdos (campo `vistoPorSolicitante`) (MEDIO).
- [x] Badge nav reactivo para solicitante en acuerdos con status cambiado (MEDIO).

### C5 — Onboarding y ayuda contextual
- [x] Flujo onboarding completo sin bloqueos hasta entrar en comunidad.
- [x] Animaciones implementadas: todas las 7+2 de KanariiOnboarding (T-035).
- [x] Tagline oficial actualizado en copy de bienvenida (T-057).
- [x] SectionHelp presente en páginas clave.
- [ ] `TourStepLayout.tsx` como wrapper común con escape hatch y progress tracker (BAJO).

### C6 — Robustez base: permisos, consistencia, offline
- [x] Firestore Rules multi-comunidad con roles (T-001, T-007, T-008).
- [x] Reglas para `actas`, `fichas`, `community_exits`, `profiles`, `hilos`, `respuestas` (T-005, T-007, T-008).
- [x] Sin accesos residuales tras logout — limpiar contexto comunidad activa (T-028).
- [x] Validación `communityId` generalizada a todos los hooks (T-013, T-029).
- [x] Indicador offline visible + cambios pendientes (T-040).
- [x] Persistencia offline Firestore con IndexedDB (T-037).
- [x] PWA con `vite-plugin-pwa` + `registerType: autoUpdate` (T-051).
- [x] Tests Firestore rules con Firebase Emulator (T-012).
- [ ] Paginación cursor-based (`startAfter`) para listas largas (MEDIO).
- [x] Auditar listeners y queries duplicados en Sidebar/BottomNav (MEDIO).

---

## Historial de actualizaciones

| Fecha | Sprint | % global | Cambios reseñables |
|---|---|---:|---|
| 2026-06-11 | sprint-16 | 88% | C2 80→90% (T-062/063/064), C3 85→90% (T-065/066). Sprint 15 cerrado 6/6 ✅. |
| 2026-06-11 | sprint-16 | 91% | C4 80→90% (T-069/070), C6 80→90% (T-071). Implementado sistema unread y auditados listeners. |
| 2026-06-11 | — | 91% | Actualizado automáticamente por update-mvp-tracker.sh |
| 2026-07-30 | — | 91% | Actualizado automáticamente por update-mvp-tracker.sh |
| 2026-07-30 | — | 91% | Actualizado automáticamente por update-mvp-tracker.sh |
| 2026-07-30 | — | 91% | Actualizado automáticamente por update-mvp-tracker.sh |
| 2026-07-30 | — | 91% | Actualizado automáticamente por update-mvp-tracker.sh |
| 2026-07-30 | — | 91% | Actualizado automáticamente por update-mvp-tracker.sh |
