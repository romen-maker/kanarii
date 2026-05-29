# Task-035: Integrar WelcomeHeroSections y conectar a datos reales

## Objetivo
Procesar la UI externa moviendo todos los archivos de `external-inbox/` a sus destinos, y conectar el componente `WelcomeHeroSections` a datos reales de la base de datos en `src/pages/Welcome.tsx`.

## Contexto técnico
- El componente `WelcomeHeroSections.tsx` y otros componentes presentacionales se encuentran en `external-inbox/ui-export/`.
- Debemos mover `WelcomeHeroSections.tsx` a `src/components/onboarding/WelcomeHeroSections.tsx`.
- También debemos mover `PasaporteVisual.tsx` a `src/components/perfil/PasaporteVisual.tsx` y toda la carpeta `help/` a `src/components/help/` (como parte de la preparación de T-036).
- Modificar `src/pages/Welcome.tsx` para inyectarle datos reales de la base de datos (nombre de usuario, estadísticas de la comunidad, etc.).

## Caja de archivos
Archivos autorizados para modificación:
- `src/components/onboarding/WelcomeHeroSections.tsx`
- `src/pages/Welcome.tsx`
- `src/components/perfil/PasaporteVisual.tsx`
- `src/components/help/SectionHelp.tsx`
- `src/components/help/TareasUISimulation.tsx`
- `src/components/help/ActasUISimulation.tsx`
- `src/components/help/ProyectosUISimulation.tsx`
- `src/components/help/MarketplaceUISimulation.tsx`

## Criterios de done
- [x] Archivos movidos desde `external-inbox/` a sus rutas respectivas en `src/components/`
- [x] Componente `WelcomeHeroSections.tsx` integrado en `src/pages/Welcome.tsx`
- [x] Datos reales (nombre de usuario, estadísticas) inyectados a `WelcomeHeroSections`
- [x] Compilación sin errores TypeScript (validado localmente para este componente)

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-29T15:57:03+01:00
- [x] Rama creada: feat/T-035-welcome-hero-sections
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
