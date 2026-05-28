# Tarea: T-023 — Migración limpia modelo de datos Tríada Comunitaria (ofrendas, saberes, necesidades)

## Estado
⬜ Pendiente

## Rama
`feat/T-023-migracion-triada-comunitaria`

## Criterios de Aceptación (DoD)
- [x] Definición de tipos TypeScript para `TriadaComunitaria` y actualización de `Ficha` en `src/lib/services/_types.ts`.
- [x] Implementación de función helper `getTriadaFromFicha` para fallback y migración on-read en `src/lib/services/_types.ts` o `fichas.ts`.
- [x] Script de migración en `scripts/migrate-triada-comunitaria.ts` (con soporte para batch write, idempotencia, guard de `FIRESTORE_EMULATOR_HOST` (o `--force`), y opción `--dry-run`).
- [x] Componente `TagArrayEditor.tsx` en `src/components/ui/` para gestionar arrays de strings en UI con colores diferenciados.
- [x] Hook de utilidad `useTagArray.ts` para el manejo de estados de tags en edición.
- [x] Integración de la edición de la Tríada en la vista de edición/perfil de Ficha (ej: `FichaEdit.tsx` o `FichaView.tsx`).
- [x] Lectura y auditoría de `firestore.rules` para documentar impactos de visibilidad/privacidad, sin modificarlo.
- [ ] Validación visual de los cambios.

## Caja de archivos
- `src/lib/services/_types.ts`
- `src/lib/services/fichas.ts`
- `src/components/ui/TagArrayEditor.tsx`
- `src/hooks/useTagArray.ts`
- `scripts/migrate-triada-comunitaria.ts`
- `src/pages/FichaEdit.tsx` (o correspondiente)

## Contexto técnico
- Tipos de la tríada paralelos a `datosOnboarding` en `Ficha`:
  ```typescript
  export interface TriadaComunitaria {
    ofrendas: string[];    // Lo que doy a la comunidad
    saberes: string[];     // Conocimientos y habilidades (migrado desde saberes: string)
    necesidades: string[]; // Lo que necesito de la comunidad
  }
  ```
- Helper `getTriadaFromFicha` (separando `saberesLegacy` por coma o salto de línea):
  ```typescript
  const saberesArray = saberesLegacy
    .split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  ```
  Importante: Preservar el campo original `datosOnboarding.saberes` para compatibilidad.
- Script `scripts/migrate-triada-comunitaria.ts`:
  - Debe abortar si no hay `FIRESTORE_EMULATOR_HOST` definido y no se pasa `--force`.
  - Debe añadir `--dry-run` para loguear sin escribir.
  - Lotes de escritura máximos de 400.
- Integración UI en `FichaEdit.tsx` o la pantalla de edición correspondiente.
- Nota: Integración en `OnboardingChat.tsx` pendiente para el sprint 09.

## Notas de sesión
- Se corrigió un bug crítico de carga inicial en `src/pages/FichaView.tsx`: `getTriadaFromFicha` provocaba un crash al recibir `ficha` nula o indefinida antes de que terminara de cargar el perfil. Se añadió un guard en `getTriadaFromFicha` para retornar una estructura vacía en estos casos.
- Se revirtió el mock auth de prueba para dejar el flujo de autenticación real activo.

## Estado de aprobación
- [x] Plan de la sesión aprobado
- [x] Sesión cerrada correctamente
