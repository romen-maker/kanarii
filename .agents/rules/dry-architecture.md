---
trigger: always_on
---

# Arquitectura DRY — Kanarii Frontend

> Estándar de separación de responsabilidades para la app React.

## Capas y Responsabilidades

| Capa | Directorio | Responsabilidad | Prohibiciones |
|---|---|---|---|
| Acceso a Datos | `src/lib/appService.ts` | Única puerta a Firestore. CRUD puro | Ninguna page ni hook importa `firebase/firestore` directamente |
| Hooks de Entidad | `src/hooks/use[Entidad].ts` | Estado + suscripción real-time | Sin JSX. Firma consistente: `{ items, loading, reload }` |
| Hooks de Acción | `src/hooks/useEntityActions.ts` | Patrón try/catch → service → toast | Sin acceso directo a appService desde pages |
| Pages | `src/pages/` | Composición y routing. Tontas | Sin useState para lógica de negocio. Sin imports de appService |
| Componentes UI | `src/components/ui/` | Primitivos visuales reutilizables | Sin lógica de negocio. Solo UI state (hover, open, etc.) |
| Contextos | `src/contexts/` | Estado global (auth, tema) | Mínimos y enfocados |

## Reglas Concretas

1. **Ninguna page llama directamente a appService** — siempre a través de un hook.
2. **Ningún componente UI tiene useState para lógica de negocio** — solo UI state.
3. **Patrones repetidos se encapsulan en hooks genéricos** — undoable delete, toast, cambio de estado.
4. **Un hook por entidad de datos** — useProyectos, useTareas, useActas con firma `{ items, loading, reload }`.
5. **Acciones sobre entidades van en hooks de acción** — `useEntityActions`.
6. **Prohibido window.confirm, alert, o prompt** — usar siempre `useToast`.
7. **Prohibido importar firebase/firestore fuera de src/lib/** — todo pasa por appService.

## Verificación Pre-commit

Antes de aprobar cualquier cambio en una page, verificar:
- [ ] ¿La page importa algo de `appService`? → ❌ Mover a hook.
- [ ] ¿La page importa algo de `firebase/firestore`? → ❌ Mover a appService.
- [ ] ¿Hay un try/catch con toast inline? → ❌ Usar useEntityActions.
- [ ] ¿Hay un componente de 50+ líneas definido inline? → ❌ Extraer a componente.
