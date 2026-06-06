# T-054 — Conectar vía Tablón con mención pre-rellenada

## Estado
✅ Completado — sprint-12

## Descripción
Completar el flujo de conexión entre usuarios a través de la funcionalidad del Tablón. Cuando un usuario hace clic en "Conectar vía Tablón" desde el Pasaporte Comunitario de otro miembro, se le debe redirigir al Tablón de la comunidad y abrir automáticamente el modal de creación de post con una mención pre-rellenada dirigida a dicho miembro.

## Criterios de done
- [x] En `PasaporteComunitarioView.tsx`, modificar `handleConnect` para pasar el nombre del miembro (`mappedUser.name`) a través de la propiedad de estado de navegación (`openNewPostWithMention`).
- [x] En `Tablon.tsx`, capturar el estado del router y, si `openNewPostWithMention` está presente, inicializar un mensaje por defecto con la mención y abrir el modal de creación de posts.
- [x] En `CreatePostModal.tsx`, aceptar una propiedad opcional `initialDescription` y utilizarla para inicializar el estado del formulario.
- [x] Sin usar window.confirm ni alert — usar useToast para feedback si es necesario.

## Archivos probablemente afectados
- `src/pages/PasaporteComunitarioView.tsx`
- `src/pages/Tablon.tsx`
- `src/components/CreatePostModal.tsx`

## Notas técnicas
- Pasar el nombre del miembro en el objeto `state` de `navigate('/tablon', { state: { openNewPostWithMention: name } })`.
- En `Tablon.tsx`, usar el hook `useLocation` para obtener el estado.
- Limpiar el estado de inicialización en el modal cuando se cierre o se envíe.

## Tamaño estimado: S
