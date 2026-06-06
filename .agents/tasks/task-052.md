# Task-052: Pasaporte Comunitario completo: OG tags dinámicos, flujo "Conectar" real, widget Kin Maya en PasaporteVisual

## Objetivo
Completar la funcionalidad de Pasaporte Comunitario integrando OG tags dinámicos (para crawlers/bots mediante Cloud Function), cálculo y widget del Kin Maya en la UI, y el flujo interactivo "Conectar" real entre miembros de la comunidad.

## Contexto técnico
- **OG tags y Bots**: Los crawlers de redes sociales (WhatsApp, Telegram, etc.) no ejecutan JS. Necesitamos un bot-detector en Firebase Hosting que redirija la ruta de miembro (`/c/:slug/miembro/:userId`) a una Cloud Function `ogPassaporte` si el User-Agent es un bot.
- **Firebase Functions**: Es la primera vez que se integran Functions en el proyecto. Requiere configurar `"functions"` en `firebase.json` y estructurar el directorio `functions/`.
- **Datos de Perfil**: La información del pasaporte se extrae de `/profiles/{userId}` (primario) y `/community_members/{slug}_{userId}` (miembro de comunidad).
- **Kin Maya**: Se debe calcular a partir de `ficha.datosOnboarding?.fechaNacimiento` usando el helper existente `kinMaya.ts`.
- **Flujo Conectar**: Permitir que un miembro envíe una solicitud de conexión a otro, persistiendo en Firestore (ej. colección `connections` o similar).

## Caja de archivos
Archivos autorizados para modificación:
- `firebase.json`
- `src/pages/PasaporteComunitarioView.tsx`
- `src/components/perfil/PasaporteVisual.tsx`
- `src/lib/appService.ts`
- `functions/package.json` [NEW]
- `functions/tsconfig.json` [NEW]
- `functions/src/index.ts` [NEW]
- `docs/sprints/sprint-12.md`
- `docs/adrs/README.md`
- `docs/adrs/ADR-013-firebase-functions-para-og-tags.md` [NEW]

## Criterios de done
- [x] Configurar Firebase Functions en `firebase.json` y crear la estructura base en `functions/` (con TypeScript).
- [ ] Crear Cloud Function `ogPassaporte` que sirva HTML con metadatos OG dinámicos (nombre, foto, kin, rol) cuando el User-Agent sea un bot, leyendo `/profiles/{userId}` y `/community_members/{slug}_{userId}`.
- [ ] Configurar rewrite en `firebase.json` para redirigir bots en `/c/:slug/miembro/:userId` hacia la Cloud Function `ogPassaporte`.
- [ ] Implementar el widget del Kin Maya en `PasaporteVisual.tsx` (dentro de `src/components/perfil/`) calculándolo con `kinMaya.ts` en `PasaporteComunitarioView.tsx` a partir de `memberInfo.fechaNacimiento` y pasándolo como prop `kinMaya`.
- [ ] Implementar flujo "Conectar" real en UI y backend: botón que cree la conexión en Firestore (ej. en una colección o subcolección de miembro) y visualice el estado de la conexión.
- [ ] Registrar ADR-013 documentando el uso de Firebase Functions para OG tags.
- [ ] Compilación sin errores TypeScript en la app React y en Firebase Functions.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-06-06T08:55:33+01:00
- [x] Rama creada: feat/T-052-pasaporte-comunitario
- [x] Lock activo: .agent-session.lock
- [ ] Sesión cerrada correctamente
