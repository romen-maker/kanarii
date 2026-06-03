# Task-041: Estandarizar cabeceras con PageHeader y layout con PageContainer

## Objetivo
Estandarizar el diseño visual de la aplicación implementando y aplicando los componentes reutilizables `PageHeader` (para títulos de página consistentes con soporte para acciones/botones) y `PageContainer` (para el espaciado, márgenes y estructura de layout uniforme en todas las vistas).

## Contexto técnico
- Reducir deuda técnica visual y mejorar consistencia de layout.
- Crear componentes en `src/components/ui/`.
- Aplicar a las vistas principales: `MarketplaceView.tsx`, `CalendarioView.tsx`, `ComunidadesView.tsx`, `ActasPanel.tsx`.
- Resolver bug móvil de `SectionHelp` usando la propiedad `inline`.

## Caja de archivos
Archivos autorizados para modificación:
- src/components/ui/PageHeader.tsx
- src/components/ui/PageContainer.tsx
- src/components/help/SectionHelp.tsx
- src/pages/MarketplaceView.tsx
- src/pages/CalendarioView.tsx
- src/pages/ComunidadesView.tsx
- src/pages/ActasPanel.tsx
- src/pages/ProyectosView.tsx
- src/pages/TareasPanel.tsx
- src/pages/Tablon.tsx
- src/pages/PropuestasView.tsx
- src/pages/FichaView.tsx

## Criterios de done
- [x] Componente `PageHeader.tsx` implementado en `src/components/ui/` con soporte para título, subtítulo, icono Lucide, slot de acciones, y helpNode.
- [x] Componente `PageContainer.tsx` implementado en `src/components/ui/` con márgenes responsivos y estructura de layout unificada.
- [x] Añadida la prop `inline?: boolean` a `SectionHelp.tsx` para no flotar en móviles en el header.
- [x] `MarketplaceView.tsx` refactorizado para usar `PageHeader` y `PageContainer`.
- [x] `CalendarioView.tsx` refactorizado para usar `PageHeader` y `PageContainer`.
- [x] `ComunidadesView.tsx` refactorizado para usar `PageHeader` y `PageContainer`.
- [x] `ActasPanel.tsx` refactorizado para usar `PageHeader` y `PageContainer` y subir el botón de acción de administración.
- [x] `ProyectosView.tsx` corregido aplicando `inline={true}` al `SectionHelp` para mejorar la visualización en móvil.
- [x] `TareasPanel.tsx` (TareasView) refactorizado para usar `PageHeader` y `PageContainer` (subtítulo restaurado).
- [x] `PropuestasView.tsx` (Gobernanza) refactorizado para usar `PageHeader` y `PageContainer` con icono `Scale`.
- [x] `Tablon.tsx` (TablónView) refactorizado para usar `PageHeader` y `PageContainer`.
- [x] Estandarizados los iconos en `PageHeader` de cada página para coincidir con la barra de navegación (`CheckSquare` para Tareas, `FileText` para Actas, `Handshake` para Marketplace).
- [x] Consistencia de icono en vista de Ficha (cambiar Leaf por User en `src/pages/FichaView.tsx`).
- [x] Compilación exitosa (`npx tsc --noEmit`) sin errores de TypeScript en los archivos modificados.
- [ ] Validación visual de los cambios por parte del usuario.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido
- [x] Confirmación visual e integración a main realizada
- [x] Sesión cerrada correctamente

