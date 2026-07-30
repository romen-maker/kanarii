# Task-073: Servicio de Identidad Vinculada Telegram & Token Efímero (`identities.ts`)

## Objetivo
Implementar las funciones de servicio en `src/lib/services/identities.ts` para gestionar la generación de tokens efímeros de vinculación (expiración a los 5 minutos), la resolución y activación del vínculo entre un `telegramUserId` y un `userId` de Kanarii (`status: 'pending' | 'linked' | 'revoked'`), y la revocación explícita del enlace.

## Contexto técnico
- En T-072 definimos `UserTelegramIdentity` y `TelegramLinkStatus` en `src/lib/services/contracts.ts` y registramos `colUserTelegramIdentities` en `src/lib/services/_core.ts`.
- `identities.ts` expondrá los métodos:
  - `generateTelegramBindToken(userId: string, lastActiveCommunityId: string): Promise<string>`
  - `verifyAndLinkTelegram(token: string, telegramUserId: number, telegramUsername?: string): Promise<UserTelegramIdentity>`
  - `getTelegramIdentityByUserId(userId: string): Promise<UserTelegramIdentity | null>`
  - `getTelegramIdentityByTelegramId(telegramUserId: number): Promise<UserTelegramIdentity | null>`
  - `revokeTelegramLink(userId: string): Promise<void>`

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/identities.ts`
- `src/lib/services/index.ts`

## Criterios de done
- [x] Implementado `src/lib/services/identities.ts` con soporte para token efímero (5 min TTL) y actualización atómica del estado (`pending` -> `linked` / `revoked`).
- [x] Sin exportar desde `src/lib/services/index.ts` aún (siguiendo instrucción explícita).
- [x] Manejo de errores claro (`TOKEN_EXPIRED`, `TOKEN_INVALID`, `TELEGRAM_USER_ID_REQUIRED`, `IDENTITY_NOT_FOUND`).
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T07:31:03Z
- [x] Rama creada: feat/T-073-servicio-identidad-telegram
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
