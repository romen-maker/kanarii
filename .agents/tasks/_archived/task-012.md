# Task-012: Configurar Firebase Emulator con JDK 21+ y habilitar tests locales de Firestore rules

## Objetivo
Configurar el entorno del Firebase Emulator Suite utilizando una versión local portable de JDK 21+ y habilitar la ejecución automática de pruebas unitarias para las reglas de seguridad de Firestore mediante `@firebase/rules-unit-testing`.

## Contexto técnico
- El sistema del usuario cuenta con OpenJDK 11. Para evitar requerir contraseñas de `sudo` e instalaciones globales que alteren el sistema del usuario, automatizaremos la descarga de JDK 21 en formato binario portable (tar.gz) dentro de `.tmp/jdk-21` y configuraremos dinámicamente `JAVA_HOME` y `PATH` al ejecutar el emulador.
- Usaremos la dependencia `@firebase/rules-unit-testing` ya definida en `package.json`.
- La configuración del emulador debe agregarse a `firebase.json` (emulador de firestore).
- Crearemos tests que cubran casos críticos en `/users/{uid}` y `/community_members/{membershipId}` para validar que las reglas restringen el acceso a usuarios no autorizados de forma correcta.

## Caja de archivos
Archivos autorizados para modificación:
- `firebase.json`
- `package.json`
- `scripts/run-rules-tests.sh` [NEW]
- `tests/firestore-rules.test.ts` [NEW]

## Criterios de done
- [ ] Script `scripts/run-rules-tests.sh` creado y configurado para descargar JDK 21 portable (si no existe localmente), configurar variables de entorno locales, arrancar el emulador, ejecutar los tests unitarios y detener el emulador.
- [ ] `firebase.json` actualizado para configurar el emulador de Firestore (puerto 8080) y la UI del emulador (puerto 4000).
- [ ] Creados tests de reglas de Firestore en `tests/firestore-rules.test.ts` usando `@firebase/rules-unit-testing` (incluyendo cobertura para `/users`, `/community_members` y `/comunidades` [admin edita, miembro solo lee]).
- [ ] Añadido script `npm run test:rules` en `package.json`.
- [ ] Pruebas unitarias de las reglas ejecutadas localmente y superadas con éxito.
- [ ] Compilación TypeScript libre de errores en los nuevos archivos.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-26 09:46
- [x] Rama creada: feat/T-012-emulator-rules-testing
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

