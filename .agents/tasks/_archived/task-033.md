# Task-033: Sala de deliberación con timeline S3 y visualización de participantes

## Objetivo
Añadir presencia de participantes en tiempo real y contadores de respuestas sobre los pasos activos en el timeline sociocrático S3.

## Contexto técnico
- El hook `usePresenciaEnSala.ts` gestiona la presencia usando una subcolección Firestore `/propuestas/{id}/presencia/{userId}` con campos `{ nombre, photoURL, entradaEn: Timestamp }`.
- Se subscribe en tiempo real y realiza cleanup al desmontar.
- El componente `PropuestaDetail.tsx` usará este hook para pintar el strip de avatares: "En sala ahora: [avatar]...".
- El componente `S3Timeline.tsx` recibirá contadores opcionales (`consentimientos`, `objeciones`, `dudas`) y los mostrará encima del paso activo.

## Caja de archivos
Archivos autorizados para modificación:
- `src/hooks/usePresenciaEnSala.ts` (NUEVO)
- `src/components/S3Timeline.tsx` (MODIFICAR)
- `src/components/PropuestaDetail.tsx` (MODIFICAR)
- `src/lib/services/_types.ts` (MODIFICAR - solo si falta el tipo `PresenciaParticipante`)

## Criterios de done
- [x] Implementado `usePresenciaEnSala.ts` con suscripción real-time y cleanup de Firestore.
- [x] Tipo `PresenciaParticipante` definido en `_types.ts` si no existe previamente.
- [x] `S3Timeline.tsx` adaptado para mostrar contadores (`consentimientos`, `objeciones`, `dudas`) sobre el paso activo.
- [x] `PropuestaDetail.tsx` modificado para renderizar el strip de participantes presentes en la sala y pasar los contadores al timeline.
- [x] Verificación obligatoria: `npx tsc --noEmit` sin errores de compilación.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-28T20:42:34+01:00
- [x] Rama creada: feat/T-033-sala-deliberacion-s3
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

