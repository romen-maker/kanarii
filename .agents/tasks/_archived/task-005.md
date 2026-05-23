# Task-005: Asegurar permisos de lectura/escritura en actas y fichas en firestore.rules

## Objetivo
Implementar reglas de seguridad específicas para las colecciones `/actas` y `/fichas` en `firestore.rules`, limitando el acceso de lectura y escritura según la membresía del usuario y sus roles dentro de la comunidad correspondiente.

## Contexto técnico
- Actualmente, `firestore.rules` no define reglas explícitas para `/actas` ni `/fichas`, por lo que Firestore deniega todo acceso por defecto.
- Las actas (`/actas`) deben poder ser leídas por cualquier miembro o visitante de la comunidad, y creadas/actualizadas/borradas por administradores de la comunidad (u otros roles con permisos de escritura, según se requiera).
- Las fichas (`/fichas`) son perfiles de zona/miembro y deben seguir la lógica de privacidad: legibles por miembros y editables por sus creadores o administradores de la comunidad.
- Toda la validación debe basarse en las funciones auxiliares `hasMinRole` y `hasRole` definidas en `firestore.rules`.

## Caja de archivos
Archivos autorizados para modificación:
- `firestore.rules`

## Criterios de done
- [x] Definir reglas para `/actas/{actaId}` (lectura: miembros/visitantes, escritura: admins de la comunidad).
- [x] Definir reglas para `/fichas/{fichaId}` (lectura: miembros/visitantes, escritura: autor de la ficha o admins de la comunidad).
- [x] Validar que no haya regresiones en las reglas de seguridad existentes.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-23T10:49:15Z
- [x] Rama creada: feat/T-005-seguridad-actas-fichas
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

