# Task-036: Pasaporte Comunitario y Ayudas Contextuales

## Objetivo
Instanciar el nuevo `PasaporteVisual` en la vista pública `PasaporteComunitarioView.tsx` conectada a Firestore, integrar los componentes de ayuda contextual en sus respectivas vistas y renombrar el onboarding existente.

## Contexto técnico
- El componente `PasaporteVisual.tsx` ya se movió a `src/components/perfil/PasaporteVisual.tsx` en T-035.
- La vista pública `PasaporteComunitarioView.tsx` debe mostrar la Triada Comunitaria (ofrendas, saberes, necesidades) desde Firestore sin contadores numéricos y con un CTA de "Conectar vía Tablón".
- Los componentes de `help/` (simulaciones de UI) ya se movieron a `src/components/help/` en T-035. Deben integrarse en `MarketplaceView.tsx`, `ActasPanel.tsx`, `ProyectosView.tsx` y `TareasPanel.tsx`.
- Renombrar `src/components/onboarding/KanariiOnboarding.tsx` a `GovernanceFlowAnimation.tsx` y actualizar sus imports.

## Caja de archivos
Archivos autorizados para modification:
- `src/pages/PasaporteComunitarioView.tsx`
- `src/pages/MarketplaceView.tsx`
- `src/pages/ActasPanel.tsx`
- `src/pages/ProyectosView.tsx`
- `src/pages/TareasPanel.tsx`
- `src/components/onboarding/GovernanceFlowAnimation.tsx`
- `src/components/onboarding/KanariiOnboarding.tsx`

## Criterios de done
- [ ] Vista `PasaporteComunitarioView.tsx` creada/actualizada con `PasaporteVisual` y conectada a Firestore (sin números, con CTA "Conectar vía Tablón")
- [ ] Ayudas contextuales de `help/` integradas en Marketplace, Actas, Proyectos y Tareas
- [ ] `KanariiOnboarding.tsx` renombrado a `GovernanceFlowAnimation.tsx` y todos sus imports actualizados
- [ ] Compilación sin errores TypeScript

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [ ] Plan presentado al usuario (Fase 3.5)
- [ ] APROBADO recibido — fecha/hora: ___
- [ ] Rama creada: ___
- [ ] Lock activo: ___
- [ ] Sesión cerrada correctamente
