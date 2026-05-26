# Task-011: Mejorar UX de navegación de comunidades: Mover selector de comunidad a la parte superior del sidebar

## Objetivo
Optimizar la experiencia de navegación multi-comunidad reubicando el selector de comunidad desde la parte inferior (junto al perfil) hacia la parte superior del sidebar (debajo del logo/título), haciendo que sea más visible y accesible para el usuario.

## Contexto técnico
- El componente del sidebar es `src/components/Sidebar.tsx`.
- Actualmente, el selector de comunidad se renderiza dentro de la sección del perfil en la parte inferior, usando `userComunidades` y el método `setCommunityId` de `useComunidad()`.
- Al reubicarlo en la parte superior, debemos asegurarnos de que la reactividad y el cambio de estado de la comunidad activa funcionen perfectamente y no rompan el layout ni la navegación.

## Caja de archivos
Archivos autorizados para modificación:
- `src/components/Sidebar.tsx`
- `src/pages/ComunidadesView.tsx`
- `src/contexts/ComunidadContext.tsx`
- `src/components/BottomNav.tsx`

## Criterios de done
- [x] Mover el selector de comunidad (o nombre de la comunidad única) de la parte inferior a la parte superior de `src/components/Sidebar.tsx` (debajo de la sección de cabecera "Kanarii").
- [x] Estilizar el selector de comunidad en la parte superior para que sea prominente, pulido, con bordes definidos o un contenedor que encaje en la estética del sidebar.
- [x] Si el usuario tiene una única comunidad, mostrar su nombre de forma estática pero estilizada en el mismo espacio superior (con un icono descriptivo).
- [x] Limpiar la sección del perfil de usuario en la parte inferior para que solo muestre el avatar, nombre del usuario y el botón de cerrar sesión, sin el selector duplicado.
- [x] Verificar que al unirse a una comunidad nueva (por invitación o solicitud aprobada), el selector cambia automáticamente a la nueva comunidad sin recargar la página. Si no es reactivo, corregir la lógica de setCommunityId tras el alta de membresía.
- [x] Implementar el selector de comunidad en la navegación móvil dentro de la bottom sheet (menú "Más") de `src/components/BottomNav.tsx`.
- [x] Comprobar que no hay errores de TypeScript al compilar.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-26 10:05
- [x] Rama creada: feat/T-011-community-selector-sidebar
- [x] Lock activo: yes
- [x] Sesión cerrada correctamente
