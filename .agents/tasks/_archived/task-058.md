# Task-058: Notificaciones de menciones en Tablón — Opción A: campo menciones[] en post + listener en Sidebar para badge

## Objetivo
Implementar las notificaciones de menciones en el Tablón de la comunidad de acuerdo con la Opción A: añadir el campo `menciones[]` en los posts del tablón y configurar un listener en el componente Sidebar para reflejar un indicador visual (badge) si el usuario activo tiene menciones no leídas.

## Contexto técnico
- En el Tablón de anuncios, cuando un usuario crea un post y menciona a otros miembros (p. ej. usando `@nombre` o seleccionando miembros), se debe extraer el ID de los miembros mencionados.
- El post guardado en Firestore debe poseer un campo `menciones[]` que contenga un array con los UIDs de los usuarios mencionados.
- El componente `Sidebar` (o el componente que contenga la navegación principal de la app) debe suscribirse a los posts del tablón de la comunidad activa para detectar si hay menciones dirigidas al usuario actual que estén sin leer o que sean recientes.
- Se debe mostrar un indicador visual (badge con número o punto rojo) en la sección correspondiente (p. ej. "Tablón") si el usuario tiene alguna mención activa.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/posts.ts` (servicios de tablón/posts en Firestore)
- `src/components/Sidebar.tsx` (o el archivo de navegación de la barra lateral en `src/components/` o `src/pages/`)
- `src/pages/TablonView.tsx` (vista del tablón para gestionar creación de posts con menciones)

## Criterios de done
- [x] ADR-016 creado documentando la decisión técnica y la colisión de ADR-013.
- [x] Interfaz `NotificacionKanarii` y campo `unreadNotifCount` en `CommunityMember` implementados en `_types.ts`.
- [x] Servicio `notificaciones.ts` con transacción segura al marcar como leída.
- [x] Hook `useNotificaciones.ts` con suscripción directa vía `onSnapshot`.
- [x] Componente `NotifBadge` creado para renderizar un punto rojo si hay notificaciones sin leer.
- [x] Integración de `NotifBadge` en Sidebar junto al link de "Tablón".
- [x] Reglas en `firestore.rules` configuradas para la subcolección `notificaciones`.
- [x] Compilación y linter sin errores asociados.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-06-07 12:52
- [x] Rama creada: feat/T-058-sistema-notificaciones-base
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente


