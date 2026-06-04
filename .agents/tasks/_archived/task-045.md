# T-045 — Estandarizar validación formularios con componente <FieldError /> reutilizable

## Objetivo
Estandarizar la visualización de los errores de validación en los formularios del proyecto mediante un componente `<FieldError />` estilizado y reutilizable, reemplazando los estilos de error ad-hoc en los formularios principales.

## Contexto técnico
Actualmente, los errores de validación de los formularios (principalmente manejados por `react-hook-form` y esquemas de `zod`) se renderizan de forma manual con elementos `<p className="text-red-500 ...">` duplicando estilos y lógica de presentación. 
El nuevo componente `<FieldError />` encapsulará los estilos, micro-animaciones de aparición (usando transiciones CSS suaves) e iconos de error opcionales.

## Caja de archivos
Archivos propuestos para modificación:
- `src/components/ui/FieldError.tsx` [NEW]
- `src/pages/FichaView.tsx` [MODIFY]
- `src/components/CreateProjectModal.tsx` [MODIFY]
- `src/pages/FichaPreview.tsx` [MODIFY]
- `src/pages/RegistroComunidadView.tsx` [MODIFY]
- `src/components/CreateProposalWizard.tsx` [MODIFY]
- `src/components/AuthGateModal.tsx` [MODIFY]
- `src/components/ResponseModal.tsx` [MODIFY]

## Criterios de done
- [x] Creado el componente `<FieldError />` en `src/components/ui/FieldError.tsx`
- [x] Refactorizado `src/pages/FichaView.tsx` para usar `<FieldError />`
- [x] Refactorizado `src/components/CreateProjectModal.tsx` para usar `<FieldError />`
- [x] COMMIT 1: Confirmado visualmente y commiteado
- [x] Refactorizado `src/pages/FichaPreview.tsx` para usar `<FieldError />`
- [x] Refactorizado `src/pages/RegistroComunidadView.tsx` para usar `<FieldError />`
- [x] COMMIT 2: Confirmado visualmente y commiteado (Fichas y registro)
- [x] Refactorizado `src/components/CreateProposalWizard.tsx` para usar `<FieldError />`
- [x] Refactorizado `src/components/AuthGateModal.tsx` para usar `<FieldError />`
- [x] Refactorizado `src/components/ResponseModal.tsx` para usar `<FieldError />`
- [x] COMMIT 3: Confirmado visualmente y commiteado (Modales y wizards)
- [x] Compilación sin errores TypeScript general (`npx tsc --noEmit`)

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-06-04
- [ ] Rama creada: ___
- [ ] Lock activo: ___
- [x] Sesión cerrada correctamente
