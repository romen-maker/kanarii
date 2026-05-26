# Task-014: Añadir .limit(50) a todos los hooks de listas

## Objetivo
Limitar a 50 los resultados devueltos por las consultas de listas de entidades principales en la base de datos de Firestore. Esto optimiza el consumo de lecturas de Firestore y mejora el rendimiento de la aplicación en listas potencialmente largas (tareas, propuestas, actas, proyectos, eventos, posts, servicios, acuerdos, miembros/perfiles y comunidades).

## Contexto técnico
La aplicación utiliza centralizadamente `src/lib/appService.ts` para realizar todas las consultas y suscripciones a Firestore.
Para limitar las listas, debemos importar `limit` de `firebase/firestore` y aplicarlo a los queries de listas estándar, a las funciones de escucha `listen...` y a las funciones asíncronas de obtención de listas.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/appService.ts`

## Criterios de done
- [x] Importar `limit` de `firebase/firestore` en `src/lib/appService.ts`.
- [x] Definir la constante `DEFAULT_LIST_LIMIT = 50` en `src/lib/appService.ts`.
- [x] Modificar los queries estándar en `src/lib/appService.ts` para que utilicen `limit(DEFAULT_LIST_LIMIT)`.
- [x] Modificar las funciones `listenProyectos`, `listenFichas`, `listenTareas`, `listenComunidades`, `listenInvitaciones` y `listenSolicitudes` para añadir `limit(DEFAULT_LIST_LIMIT)` a sus respectivas consultas.
- [x] Modificar las funciones `getComunidades`, `getComunidadesPublicas` y `getAcuerdosByUser` para añadir `limit(DEFAULT_LIST_LIMIT)` a sus consultas.
- [x] Compilación sin errores TypeScript.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-26T13:13:33+01:00
- [x] Rama creada: feat/T-014-limit-lists
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
