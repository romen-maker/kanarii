# Task-005: Asegurar permisos de lectura/escritura en propuestas, acuerdos, servicios, actas y fichas

## Objetivo
Asegurar y validar las reglas de seguridad de Firestore para todas las colecciones principales (propuestas, acuerdos, servicios, actas y fichas), garantizando que las restricciones basadas en membresía y roles en cada comunidad se apliquen correctamente.

## Contexto técnico
- Las reglas de seguridad de Firestore se definen en `firestore.rules`.
- Se requiere validar y auditar las operaciones de lectura y escritura para cada colección en base a la membresía del usuario.

## Criterios de done
- [x] Asegurar permisos de lectura/escritura en propuestas (`/propuestas`).
- [x] Asegurar permisos de lectura/escritura en servicios (`/servicios`).
- [x] Asegurar permisos de lectura/escritura en acuerdos (`/acuerdos`).
- [ ] Asegurar permisos de lectura/escritura en actas (`/actas`).
- [ ] Asegurar permisos de lectura/escritura en fichas (`/fichas`).
- [ ] Validar y asegurar el campo `displayName` en `community_member`.

## Estado actual
- **Completado**: propuestas ✅, servicios ✅, acuerdos ✅.
- **Pendiente** (Pasa a deuda técnica en `roadmap.md` para el siguiente sprint): actas ❌, fichas ❌, `displayName` en `community_member` ❌.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-23 (Cierre parcial de auditoría)
- [x] Sesión cerrada correctamente
