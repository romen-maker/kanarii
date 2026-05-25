# Task-007: Implementar reglas de seguridad Firestore para colecciones `community_exits`, `profiles` y `fichas`

## Objetivo
Asegurar el acceso correcto y restringido a las colecciones de Firestore `community_exits` (registro de salidas de comunidad), `profiles` (perfiles públicos de usuarios) y `fichas` (fichas de miembros en comunidades) para evitar accesos no autorizados.

## Contexto técnico
- `firestore.rules` gestiona los permisos de Firestore.
- `community_exits`: Almacena el histórico de salidas de comunidad. Debería permitir lectura a los administradores de la comunidad correspondiente y creación/escritura al propio usuario que sale.
- `profiles`: Almacena el perfil público global de los usuarios (`profiles/{uid}`). Lectura permitida a usuarios autenticados; escritura permitida únicamente al propio usuario (`request.auth.uid == uid`).
- `fichas`: La regla actual de `fichas` permite lectura si eres el dueño de la ficha (`fichaId == request.auth.uid`) o si tienes rol en la comunidad de la ficha. Se debe asegurar que las fichas sean seguras y no tengan brechas en la asignación de comunidad.

## Caja de archivos
Archivos autorizados para modificación:
- `firestore.rules`

## Criterios de done
- [x] Definir reglas para `community_exits` que restrinjan la lectura a admins de la comunidad y del propio usuario, y la creación al propio usuario.
- [x] Definir reglas para `profiles` que permitan lectura a autenticados y escritura sólo al propio dueño (`uid`).
- [x] Refinar y validar reglas para `fichas` asegurando que no haya fugas de datos y que las condiciones de propiedad y rol comunitario se cumplan adecuadamente.
- [x] Compilación exitosa de las reglas y validación sin errores sintácticos.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-25 09:29
- [x] Rama creada: feat/T-007-security-rules-refinement
- [x] Lock activo: .agent-session.lock
- [ ] Sesión cerrada correctamente
