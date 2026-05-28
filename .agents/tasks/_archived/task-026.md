# Task-026: Vista de detalle de Acuerdo en Marketplace: panel/modal con info, historial y CTA de enmienda

## Objetivo
Proveer una vista detallada para los acuerdos dentro del Marketplace de Kanarii, permitiendo al usuario visualizar la información completa, su historial y proveer un botón/CTA para proponer una enmienda a dicho acuerdo.

## Contexto técnico
- El proyecto utiliza React y TypeScript.
- La vista principal de Marketplace es `src/pages/MarketplaceView.tsx`.
- Contamos con el hook `src/hooks/useAcuerdos.ts` y el servicio `src/lib/services/acuerdos.ts`.
- Debemos respetar la Arquitectura DRY (`dry-architecture.md`): las páginas son tontas en cuanto a lógica de negocio directa y llaman a hooks; no importan Firestore.
- Si es necesario guardar estados de UI, usar state local. Para lógica compleja, encapsular en hooks de acción.

## Caja de archivos
Archivos autorizados para modificación:
- `src/pages/MarketplaceView.tsx`
- `src/components/acuerdos/AcuerdoDetailModal.tsx`
- `src/lib/services/_types.ts`
- `src/components/CreateProposalWizard.tsx`

## Criterios de done
- [ ] Implementar un modal o panel de detalle al hacer clic en un acuerdo en Marketplace.
- [ ] Mostrar información detallada del acuerdo (título, descripción, creador, fecha, estado, etc.).
- [ ] Mostrar historial de cambios/versiones o enmiendas previas del acuerdo si las hay.
- [ ] Agregar un botón de CTA "Proponer Enmienda" que abra el flujo/formulario correspondiente (o linkee a la creación de una propuesta de enmienda).
- [ ] Compilación sin errores TypeScript y linter.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-28
- [x] Rama creada: feat/task-026
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

