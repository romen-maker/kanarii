# Tarea T-063: Rediseño del Pasaporte Comunitario de miembro y comunidad como landing social compartible

## Información General
- **Sprint**: Sprint 15
- **Tamaño**: M
- **Estado**: ⬜ Pendiente
- **Dependencias**: T-062

## Contexto Técnico
- Basado en la investigación técnica guardada en `docs/sprints/sprint-15-research.md`.
- Rediseño del Pasaporte Comunitario público (`PasaporteComunitarioView.tsx` y `PasaporteVisual.tsx`) para mostrar de forma atractiva los datos del arquetipo (Perfil Visual) y Diseño Humano, condicionado por la configuración de privacidad del miembro (T-062).
- El pasaporte de comunidad (`/c/:slug`) y de miembro (`/pasaporte/:uid` o `/c/:slug/miembro/:uid`) serán las landings de atracción primarias de Kanarii.

## Caja de Archivos (Scope Autorizado)
- `src/pages/PasaporteComunitarioView.tsx` (modificar)
- `src/components/perfil/PasaporteVisual.tsx` (modificar)
- `src/pages/ComunidadDetailView.tsx` (o equivalente) (modificar)

## Criterios de Aceptación (Definition of Done)
- [ ] UI rediseñada de PasaporteComunitarioView inspirada en cartas astrales / tarjetas de presentación digital (estética premium).
- [ ] La información del arquetipo y diseño humano se oculta o muestra dinámicamente según `privacidad` (respetando la colección pública `/pasaportes`).
- [ ] Enlace público compartible por WhatsApp/Telegram funciona y luce optimizado (meta tags si es posible).

## Registro de Cambios
- **Inicio**: —
- **Última modificación**: —
