# Task-018: Migrar community_members antiguos

## Objetivo
Migrar los documentos antiguos de `community_members` para rellenar o corregir los campos `displayName`, `email` y `photoURL` a partir del documento de usuario correspondiente en `/users/{uid}`, evitando que se muestre el email en lugar del nombre en las fichas públicas.

## Contexto técnico
- Usaremos la infraestructura de `scripts/db-client.ts` para interactuar de forma segura con la API REST de Firestore.
- El script debe buscar todos los documentos de `community_members`.
- Para cada miembro, identificaremos su `userId` (que forma parte de la clave del documento, con estructura `communityId_userId`).
- Buscaremos el usuario correspondiente en la colección `users` usando `getDocument('users', userId)`.
- Si el usuario existe y contiene información de perfil (`displayName`, `email`, `photoURL`), actualizaremos el documento de `community_members` en caso de discrepancias o si `displayName` es igual al `email` (lo que indica que se está usando el email como fallback).
- El script soportará `--write` para efectuar cambios en la base de datos; por defecto se ejecutará en modo DRY RUN (solo lectura y reporte).

## Caja de archivos
Archivos autorizados para modificación:
- `scripts/backfill-members-profile.ts`

## Criterios de done
- [x] Implementar el script `scripts/backfill-members-profile.ts` que realiza la migración.
- [x] Soporte para ejecución en modo DRY RUN por defecto y escritura con `--write`.
- [x] Ejecutar el script contra el emulador local para verificar que sincroniza correctamente.
- [x] Compilación sin errores TypeScript en el script y el proyecto.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-27T08:02:08+01:00
- [x] Rama creada: feat/T-018-backfill-members-profile
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
