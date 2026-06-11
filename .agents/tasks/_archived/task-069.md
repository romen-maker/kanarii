# Task-069: Sistema leído/no leído en acuerdos

## Objetivo
Implementar un sistema de notificaciones / visualización de acuerdos no leídos por el solicitante en el Marketplace de Kanarii, utilizando un timestamp `solicitanteLastSeenAt` y centralizando el listener en un context provider `AcuerdosProvider` para optimizar lecturas.

## Contexto técnico
- Basado en los hallazgos de Perplexity documentados en `docs/sprints/sprint-16-research.md`.
- El modelo `Acuerdo` en `src/lib/services/_types.ts` recibirá los nuevos campos: `updatedAt` y `solicitanteLastSeenAt`.
- Se creará un context provider `AcuerdosProvider` y su hook correspondiente.
- Se actualizarán las Firestore Rules para proteger la edición del campo `solicitanteLastSeenAt`.
- Se optimizará la marcación de vistos mediante batch writes en la vista de acuerdos consumiendo los datos cacheados en el Context.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/_types.ts`
- `src/lib/services/acuerdos.ts`
- `src/contexts/AcuerdosContext.tsx`
- `src/hooks/useAcuerdosBadge.ts`
- `src/App.tsx`
- `firestore.rules`
- `src/components/Sidebar.tsx`
- `src/components/BottomNav.tsx`

## Criterios de done
- [x] Modelos de datos y tipos de `Acuerdo` actualizados con `solicitanteLastSeenAt` y `updatedAt`.
- [x] `AcuerdosContext` y `AcuerdosProvider` implementados en `src/contexts/AcuerdosContext.tsx`.
- [x] Hook `useAcuerdosBadge.ts` y `useAcuerdosCtx` expuestos y funcionales.
- [x] Integración de `AcuerdosProvider` en `src/App.tsx` para envolver los componentes del layout.
- [x] Sidebar y BottomNav adaptados para consumir el contador de acuerdos no vistos desde el contexto (eliminando listeners directos).
- [x] Función `marcarAcuerdosVistosDesdeCache` en `src/lib/services/acuerdos.ts` para actualizar en batch.
- [x] Integración de la marcación en la vista de acuerdos correspondiente (se llamará al montar).
- [x] Reglas en `firestore.rules` actualizadas para permitir actualizar `solicitanteLastSeenAt` solo si el usuario es el solicitante.
- [x] Compilación sin errores TypeScript y tests de reglas pasando.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-06-11 16:25:00
- [x] Rama creada: feat/T-069-acuerdos-unread-system
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
