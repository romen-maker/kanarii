# ADR-022 — Patrón de Doble Guarda en Reglas Firestore

**Estado:** Aceptado
**Fecha:** 2026-06-11
**Contexto:** T-064 / hotfix isGlobalAdmin en solicitudes

## Contexto

Durante la implementación del Pasaporte Universal (T-064), se detectó
que el rol global de administrador (`isGlobalAdmin()`) no estaba
incluido en las reglas de Firestore de varias colecciones de gestión,
provocando errores `permission-denied` silenciosos en listeners de
usuarios con rol global pero sin rol local en la comunidad activa.

## Decisión

Toda colección o subcolección con datos de gestión sensible debe
implementar la **doble guarda de administración**:
hasRole(communityId, 'admin') || isGlobalAdmin()

Esta regla aplica a: solicitudes, invitaciones, community_members,
joinRequests, acuerdos, actas y fichas.

## Convención para onSnapshot

Todo `onSnapshot` en servicios de frontend debe incluir un callback
de error explícito para evitar excepciones globales no controladas:

```typescript
return onSnapshot(q, (snap) => {
  callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
}, (err) => {
  console.error(`[NombreDelListener] error:`, err);
  callback([]);
});
```

## Advertencia de Rango (S3)

El rol `isGlobalAdmin()` otorga acceso transversal a todas las
comunidades. No es un rol técnico — es un rol de confianza que debe
ser asignado con deliberación explícita del círculo de Kanarii.
Quien lo ostente puede leer y modificar datos de cualquier comunidad.

## Consecuencias

- Los administradores globales pueden operar en cualquier comunidad
  sin necesitar membresía local.
- Cada nueva colección de gestión debe incluir esta doble guarda
  como parte del checklist de revisión de reglas.
- Los listeners deben ser robustos ante cambios futuros de reglas.
