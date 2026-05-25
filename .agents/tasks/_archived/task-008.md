# Task-008: Restringir escritura en subcolecciones hilos y respuestas de propuestas y posts por comunidad

## Objetivo
Restringir la lectura y escritura en las subcolecciones `/propuestas/{propuestaId}/hilos`, `/propuestas/{propuestaId}/respuestas` y `/posts/{postId}/respuestas` para que solo sean permitidas a miembros de la comunidad correspondiente, evitando el acceso cruzado (cross-community read/write).

## Contexto técnico
- `firestore.rules` contiene las reglas actuales de Firestore.
- Actualmente, las subcolecciones `hilos` y `respuestas` de propuestas, y `respuestas` de posts permiten lectura y escritura a cualquier usuario autenticado (`request.auth != null`), sin verificar pertenencia comunitaria.
- Evaluaremos el trade-off de usar llamadas `get()` al documento padre (`propuestas` o `posts`) en lugar de desnormalizar el `communityId`. Dado que Firestore Rules cachea las lecturas del mismo documento dentro de una misma transacción/petición, la llamada `get()` al documento padre es el enfoque MVP idóneo.
- `scripts/test-security-rules.ts` contiene el suite de tests de reglas. Añadiremos casos de prueba para validar que estas restricciones se cumplan.

## Caja de archivos
Archivos autorizados para modificación:
- `firestore.rules`
- `scripts/test-security-rules.ts`

## Criterios de done
- [x] Definir reglas de lectura y escritura para `/propuestas/{propuestaId}/hilos/{hiloId}` basadas en la pertenencia a la comunidad de la propuesta padre (usando `get()`).
- [x] Definir reglas de lectura y escritura para `/propuestas/{propuestaId}/respuestas/{respuestaId}` basadas en la pertenencia a la comunidad de la propuesta padre.
- [x] Definir reglas de lectura y escritura para `/posts/{postId}/respuestas/{respuestaId}` basadas en la pertenencia a la comunidad del post padre.
- [x] Añadir pruebas de integración en `scripts/test-security-rules.ts` que validen:
  - Que miembros autorizados de la comunidad pueden leer y escribir en hilos/respuestas.
  - Que usuarios ajenos a la comunidad tienen denegado el acceso.
  - Que usuarios no autenticados tienen denegado el acceso.
- [x] Pasar con éxito todas las pruebas de seguridad con `npm run test:security` o el comando correspondiente.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-25 10:00
- [x] Rama creada: feat/T-008-restrict-subcollections-security
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente


