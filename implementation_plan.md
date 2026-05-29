# Plan de Implementación - T-035 & T-036

## TAREA: Integrar WelcomeHeroSections y conectar a datos reales
🌿 RAMA PROPUESTA: feat/T-035-welcome-hero-sections

📂 ARCHIVOS LEÍDOS ANTES DE ESTA APROBACIÓN:
📋 CHECKPOINT LAZY-PLANNING — T-035
Opción: A) No he leído ningún archivo de código fuente en src/ o lib/ ni documentos estáticos no autorizados antes de esta aprobación.
Archivos de planificación y referencia leídos:
  - docs/sprints/sprint-09.md
  - .agents/workflows/session-start.md
  - .agents/skills/doe-framework/SKILL.md
  - .agents/tasks/_template.md
  - external-inbox/ui-export/MANIFEST-T-035.md
  - .agents/skills/inbox-integrator/SKILL.md
  - .agents/tasks/_archived/task-037.md
  - scripts/agent/check-lazy-planning.sh

## Proposed Changes

### Component Integration

#### [NEW] [WelcomeHeroSections.tsx](file:///home/romen/Proyectos/kanarii/src/components/onboarding/WelcomeHeroSections.tsx)
#### [NEW] [PasaporteVisual.tsx](file:///home/romen/Proyectos/kanarii/src/components/perfil/PasaporteVisual.tsx)
#### [NEW] [SectionHelp.tsx](file:///home/romen/Proyectos/kanarii/src/components/help/SectionHelp.tsx)
#### [NEW] [TareasUISimulation.tsx](file:///home/romen/Proyectos/kanarii/src/components/help/TareasUISimulation.tsx)
#### [NEW] [ActasUISimulation.tsx](file:///home/romen/Proyectos/kanarii/src/components/help/ActasUISimulation.tsx)
#### [NEW] [ProyectosUISimulation.tsx](file:///home/romen/Proyectos/kanarii/src/components/help/ProyectosUISimulation.tsx)
#### [NEW] [MarketplaceUISimulation.tsx](file:///home/romen/Proyectos/kanarii/src/components/help/MarketplaceUISimulation.tsx)

### Page Modification

#### [MODIFY] [Welcome.tsx](file:///home/romen/Proyectos/kanarii/src/pages/Welcome.tsx)
Inyectar el Hero y conectarlo a los datos reales de Firestore.

## Verification Plan

### Automated Tests
- Ejecutar `npx tsc --noEmit` para validar tipos TypeScript.
