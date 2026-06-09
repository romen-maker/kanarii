# Tarea T-062: Unificación y Auditoría de Superficies de Perfil y Manual de Usuario

## Información General
- **Sprint**: Sprint 15
- **Tamaño**: L
- **Estado**: 🟢 Completada
- **Dependencias**: Ninguna

## Contexto Técnico
- Basado en el informe detallado de auditoría del manual (ADR-020) y la investigación técnica guardada en `docs/sprints/sprint-15-research.md`.
- Se implementará el normalizador de manuales (`manualNormalizer.ts`) para soportar tanto el nuevo formato modular/lazy (`resumenManual.secciones`) como el formato antiguo monolítico (`manualGenerado` con regex).
- El manual se cargará/generará de forma lazy en el cliente y se guardará temporalmente en `sessionStorage` con la clave `manual_${uid}_${seccionId}`.
- Se implementará un selector de privacidad en la ficha de usuario y se sincronizará el pasaporte público en `/pasaportes/{uid}` desde el cliente.

## Caja de Archivos (Scope Autorizado)
- `src/lib/manualNormalizer.ts` (nuevo)
- `src/components/ManualSeccionesViewer.tsx` (nuevo)
- `src/components/AdminPanel/AdminPanelModals.tsx` (modificar)
- `src/pages/FichaView.tsx` (modificar)
- `src/hooks/useFicha.ts` (modificar)
- `src/lib/appService.ts` (modificar)
- `src/lib/pasaporte.ts` (nuevo)
- `firestore.rules` (modificar)
- `docs/adrs/ADR-020-unificacion-superficies-perfil-manual.md` (modificar)
- `src/lib/services/fichas.ts` (modificar - emergencia por guardado de privacidad)

## Criterios de Aceptación (Definition of Done)
- [x] Componente unificado `<ManualSeccionesViewer>` renderiza las pestañas de forma idéntica con soporte híbrido.
- [x] La ficha comunitaria (`FichaView.tsx`) usa el componente unificado y delega el guardado lazy a sessionStorage.
- [x] El expediente del administrador (`AdminPanelModals.tsx`) usa el componente unificado con `modoAdmin={true}` para ver las secciones sin generarlas de forma lazy.
- [x] Configuración de privacidad implementada con toggles en la ficha e integrada en la base de datos (con valores por defecto).
- [x] Sincronización del pasaporte público en `/pasaportes/{uid}` desde el cliente al cambiar la configuración de privacidad.
- [x] Firestore Rules actualizadas para permitir lectura pública de `/pasaportes/{uid}` y lectura total de fichas solo al propio usuario o admin.
- [x] El manual de decisiones de arquitectura (ADR-020) actualizado documentando el flujo de privacidad y la futura migración a Cloud Functions.

## Registro de Cambios
- **Inicio**: 08/06/2026
- **Última modificación**: 08/06/2026 - Completados todos los criterios e integración del visor y privacidad.
