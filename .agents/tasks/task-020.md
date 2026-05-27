# Task-020: Gestión de objeciones con hilos de aclaración (Solo Dudas)

## Objetivo
Implementar la interfaz de usuario para los hilos de aclaración de dudas (`ObjecionHilosPanel`) debajo de cada postura de tipo 'duda', y asegurar que solo el autor de la propuesta y el emisor de la duda puedan escribir mensajes de aclaración.

## Contexto técnico
El servicio de propuestas ya implementa `listenPropuestaHilos` y `createHiloMessage`.
- Se requiere que el tipo `PropuestaHilo` contenga `relatedMemberId?: string` (el creador de la duda) y `hiloType?: 'duda' | 'objecion'`.
- El componente `ObjecionHilosPanel.tsx` gestionará la suscripción y el envío de mensajes dentro del hilo de una duda.
- El componente `ClarificationThread.tsx` gestionará la suscripción y el envío de mensajes dentro del hilo de una duda.
- Permisos: Solo `propuesta.authorId` y `r.memberId` (el que planteó la duda) pueden enviar mensajes en el hilo. El resto de los miembros solo lee.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/_types.ts`
- `src/components/PropuestaDetail.tsx`
- `src/components/propuestas/ClarificationThread.tsx`

## Criterios de done
- [ ] Asegurar que `PropuestaHilo` en `_types.ts` incluye `relatedMemberId?: string` y `hiloType?: 'duda' | 'objecion'`.
- [ ] Crear el componente `ClarificationThread.tsx` para renderizar el chat y permitir enviar mensajes con los metadatos correspondientes (`hiloType: 'duda'`, `relatedMemberId`).
- [ ] Integrar el panel debajo de cada card de tipo 'duda' en `PropuestaDetail.tsx`.
- [ ] Filtrar los mensajes del hilo por `hilo.relatedMemberId === r.memberId` (donde `r` es la respuesta/duda en cuestión).
- [ ] Aplicar restricción de escritura: solo el autor de la propuesta y el emisor de la duda pueden escribir en el input.
- [ ] Compilación sin errores TypeScript.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-27 09:15
- [x] Rama creada: feat/T-020-hilos-aclaracion-dudas
- [x] Lock activo: .agent-session.lock
- [ ] Sesión cerrada correctamente
