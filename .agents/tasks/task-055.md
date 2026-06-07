# Task-055: Migración datos Tríada: script producción saberes: string → arrays + limpieza UI onboarding

## Objetivo
Crear y ejecutar un script de producción para migrar el campo legacy 'saberes' de string a array de strings en la colección 'fichas' de Firestore, y limpiar/actualizar los componentes de UI en onboarding que aún manejen saberes como string.

## Contexto técnico
- En la colección `fichas` de Firestore, las fichas antiguas tienen `saberes` almacenado como `string`, mientras que la nueva implementación de la Tríada Comunitaria espera un array de strings. Esto puede causar roturas silenciosas en componentes que consumen la ficha.
- La interfaz `TriadaComunitaria` en `src/lib/services/_types.ts` ya define los tipos del modelo de datos de la tríada (arrays separados para ofrendas, necesidades y saberes).
- Se requiere un script `scripts/migrate-saberes.ts` para realizar la migración en Firestore (similar a `scripts/migrate-community-members.ts`).
- Hay que verificar la UI de onboarding para asegurar que la entrada de `saberes` se maneje uniformemente como array (usando `TagArrayEditor` o similar) y no como string.

## Caja de archivos
Archivos autorizados para modificación:
- `scripts/migrate-saberes.ts` [NEW]
- `src/components/onboarding/OnboardingWizard.tsx` (u otros archivos de onboarding / fichas que manejen la UI de onboarding)
- `src/lib/services/comunidades.ts`

## Criterios de done
- [x] Script de migración `scripts/migrate-saberes.ts` creado y probado.
- [x] El script convierte el campo `saberes` (si es de tipo string) a un array de strings en todos los documentos de `fichas`, `profiles` y `community_members` (si tiene triada.saberes como string) en Firestore.
- [x] La UI de onboarding del flujo de creación de fichas utiliza arrays de forma limpia y consistente para la Tríada (el cambio de UI se determinó innecesario tras la auditoría, ya que el chat recoge texto narrativo descriptivo e interactúa con FichaView.tsx que ya usa TagArrayEditor).
- [x] Compilación sin errores TypeScript.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-06-07 11:30
- [x] Rama creada: feat/T-055-migracion-saberes-onboarding
- [x] Lock activo: .agent-session.lock
- [ ] Sesión cerrada correctamente
