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

Ejemplo: C3 pesa 25, va al 80% → aporta 20 puntos al total.

---

## Tabla de capacidades

| ID | Capacidad | Peso | Estado | % cap. | Tareas clave | Validación humana |
|---|---|---:|---|---:|---|---|
| C1 | Acceso y membresía multi-comunidad | 15 | 🟡 | 0 | — | — |
| C2 | Perfiles, fichas y tríada comunitaria | 15 | 🟡 | 0 | — | — |
| C3 | Gobernanza S3 operativa end-to-end | 25 | 🟡 | 0 | — | — |
| C4 | Marketplace y acuerdos | 15 | 🟡 | 0 | — | — |
| C5 | Onboarding y ayuda contextual | 10 | 🟡 | 0 | — | — |
| C6 | Robustez base: permisos, consistencia, offline | 20 | 🟡 | 0 | — | — |
| **TOTAL** | | **100** | | **0%** | | |

---

## Criterios "Done para MVP" por capacidad

### C1 — Acceso y membresía multi-comunidad
- [ ] Login estable en todos los navegadores principales.
- [ ] Selector de comunidad funcional y persistente.
- [ ] Invitaciones y solicitudes sin bypass de membresía.
- [ ] Roles básicos (admin / miembro / visitante) aplicados por comunidad.
- [ ] displayName / photoURL consistentes en todos los contextos.

### C2 — Perfiles, fichas y tríada comunitaria
- [ ] Perfil visible y consistente cross-device.
- [ ] Ficha comunitaria editable y legible por todos los miembros.
- [ ] Tríada (ofrendas, saberes, necesidades) persistente sin pérdida de datos.
- [ ] Pasaporte visual usable como presentación de perfil.

### C3 — Gobernanza S3 operativa end-to-end
- [ ] Crear propuesta con wizard funcional.
- [ ] Deliberar: timeline S3 visible y participantes identificados.
- [ ] Responder con las 4 opciones S3 (apoyo, objeción, aclaración, abstención).
- [ ] Flujo de aclaración de objeciones funcional.
- [ ] Transición de estados automática (en_deliberacion → en_objeciones → integrando → acuerdo).
- [ ] Directorio de decisiones con filtros por estado.
- [ ] Probado en sesión real con al menos 2 miembros.

### C4 — Marketplace y acuerdos
- [ ] Catálogo de servicios y recursos navegable.
- [ ] Creación y cierre de acuerdos funcional.
- [ ] Vista de detalle con historial y CTA de enmienda.
- [ ] Directorio global accesible.

### C5 — Onboarding y ayuda contextual
- [ ] Flujo onboarding completo sin bloqueos hasta entrar en comunidad.
- [ ] SectionHelp presente en páginas clave.
- [ ] Animaciones y guías no bloquean la navegación.

### C6 — Robustez base: permisos, consistencia, offline
- [ ] Firestore Rules cubren todas las colecciones principales.
- [ ] Sin accesos residuales tras logout.
- [ ] Indicador offline visible y funcional.
- [ ] Feedback de error claro en flujos críticos (auth, invitación, propuesta).
- [ ] Tests de Firestore rules automatizados con Firebase Emulator.

---

## Historial de actualizaciones

| Fecha | Sprint | % global | Cambios reseñables |
|---|---|---:|---|
| 2026-06-11 | — | 0% | Skeleton inicial. Pendiente de seed con historial real. |
