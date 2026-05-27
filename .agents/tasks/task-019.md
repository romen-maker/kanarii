# Task-019: Completar flujo S3 en PropuestaDetail: integrar ResponseModal

## Objetivo
Conectar el componente `ResponseModal` con `PropuestaDetail` para permitir a los usuarios responder a las propuestas (con las 4 opciones de respuesta: consentimiento, objeción, preocupación, abstención), e integrar la llamada a `registerPropuestaResponse` en la acción de envío del modal.

## Contexto técnico
- `ResponseModal` ya existe en `src/components/ResponseModal.tsx`.
- El servicio `registerPropuestaResponse` en `src/lib/services/propuestas.ts` implementa la lógica de transiciones client-side.
- Hay que instanciar y abrir `ResponseModal` desde `src/components/PropuestaDetail.tsx`.
- Ver `docs/sprints/sprint-05-research.md` sección 1 para los detalles de la integración.

## Caja de archivos
Archivos autorizados para modificación:
- `src/components/PropuestaDetail.tsx`
- `src/lib/services/propuestas.ts`

## Criterios de done
- [x] Corregir error de compilación de `setDoc` en `src/lib/services/propuestas.ts` importándolo desde `_core`.
- [x] Limpiar o corregir el tipo de `loadingMessage` en `PropuestaDetail.tsx` si genera error TypeScript.
- [x] Añadir CTA de aclaración en PropuestaDetail.tsx: dentro del map de respuestasConTexto, si r.type === 'duda' Y r.memberId === currentUserId, mostrar debajo de la card:
    - Texto: "¿Se aclaró tu duda? Recuerda actualizar tu posición para que la propuesta pueda avanzar."
    - Botón "Actualizar postura" que llame a `setShowResponseModal(true)`
    Usar colores sky (border-sky-100, text-sky-600, text-sky-700).
- [x] Compilación sin errores: npm run tsc --noEmit
- [ ] Commit: "feat(T-019): CTA aclaración dudas + fixes compilación S3"


## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-27 09:02:00
- [x] Rama creada: feat/T-019-S3-fixes
- [ ] Lock activo: ___
- [ ] Sesión cerrada correctamente


