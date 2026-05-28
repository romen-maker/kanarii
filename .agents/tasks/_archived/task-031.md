# Task-031: Máquina de estados S3 — transiciones integrando y en_objeciones

## Objetivo
Refactorizar la máquina de estados de las propuestas S3. La transición a `integrando` será manual y exclusiva del autor de la propuesta. El pase a `en_objeciones` será automático cuando haya cualquier objeción activa, incluso si está en `integrando` (transición bidireccional `integrando` <-> `en_objeciones`).

## Contexto técnico
- Transición a `integrando`: manual, solo por el autor de la propuesta, verificado con `uid === propuesta.autorId` (o el ID del creador correspondiente).
- Transición a `en_objeciones`: automática cuando se añade cualquier objeción activa (incluso si estaba en `integrando`).
- Bidireccionalidad: de `integrando` a `en_objeciones` automático si hay objeción, y manual de vuelta a `integrando` si se retiran objeciones (o el autor decide integrarlo manual).

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/propuestas.ts`
- `src/components/PropuestaDetail.tsx`
- `src/hooks/usePropuestaDetail.ts`
- `docs/sprints/sprint-07.md`

## Criterios de done
- [x] La transición a "integrando" es manual y requiere confirmación del autor de la propuesta (`uid === propuesta.autorId`).
- [x] La propuesta pasa automáticamente a "en_objeciones" si se detecta que tiene objeciones (basado en `activeObjectionsCount` u objeciones activas), incluso desde "integrando".
- [x] Compilación sin errores TypeScript (los archivos modificados compilan correctamente sin errores).
- [ ] Cierre correcto de la sesión.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-28T16:31:11+01:00
- [x] Rama creada: feat/T-031-maquina-estados-s3
- [x] Lock activo: true
- [x] Sesión cerrada correctamente
