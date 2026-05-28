# Task-034: Modal inline con 4 opciones de respuesta S3 y flujos de aclaración/objeción

## Objetivo
Implementar un modal inline en la sala de deliberación que permita a los participantes responder a una propuesta con una de las 4 opciones de la Sociocracia (S3) —Consentimiento, Objeción, Preocupación, Aclaración/Pregunta— y gestionar los flujos de aclaración y objeción correspondientes.

## Contexto técnico
- La sala de deliberación y la visualización de propuestas ya existen en `src/components/PropuestaDetail.tsx` y `src/components/S3Timeline.tsx`.
- Las respuestas S3 se deben registrar de forma estructurada para cada propuesta en Firestore.
- El flujo de deliberación S3 requiere que si un participante presenta una Aclaración o una Objeción, se le pida un texto descriptivo para que quede registrado en el timeline de la deliberación.

## Caja de archivos
Archivos autorizados para modificación:
- `src/components/PropuestaDetail.tsx`
- `src/components/propuestas/ClarificationThread.tsx`

## Criterios de done
- [x] Integrar el trigger y renderizado de un modal inline en `PropuestaDetail.tsx` para emitir una respuesta S3. (Ya existía en ResponseModal)
- [x] El modal debe presentar 4 opciones diferenciadas visualmente: Consentimiento, Objeción, Preocupación, Aclaración/Pregunta. (Ya existía)
- [x] Si se selecciona Objeción o Aclaración, obligar a introducir un texto descriptivo antes de enviar. (Ya existía)
- [x] Registrar la respuesta del usuario en Firestore (actualizando la propuesta o mediante una colección de respuestas). (Ya existía)
- [x] Mostrar en `S3Timeline.tsx` las respuestas y aclaraciones/objeciones enviadas en tiempo real. (Ya existía)
- [x] Hilos de debate también para objeciones en la sala de deliberación (Scope reducido T-034).
- [x] Compilación sin errores TypeScript.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-28T22:33:43+01:00
- [x] Rama creada: feat/T-034-modal-respuesta-s3
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
