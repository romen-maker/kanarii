# Task-112: Dividir Onboarding: Registro Exprés (Perfil Básico) vs Ampliación Opcional de Perfil

## Objetivo
Permitir que un nuevo miembro pueda registrarse de forma ultra-ligera en 1 minuto (Nombre, 1 Saber, 1 Necesidad) para aparecer de inmediato en el directorio comunitario y explorar nodos, dejando el formulario extenso de `FichaView.tsx` / `OnboardingChat.tsx` (Manual Galáctico: Carta Astral, Diseño Humano, Kin Maya) como un paso opcional de ampliación profunda.

## Contexto técnico
- `src/pages/Welcome.tsx` y `WelcomeHeroSections.tsx` muestran la bifurcación transparente entre "Perfil básico en 1 minuto" y "Manual Galáctico Completo".
- `src/pages/FichaView.tsx` y `src/pages/FichaPreview.tsx` gestionan la edición y guardado de perfil.
- Se reutilizan los servicios `saveFichaData` y `fichas.ts` existentes en Firestore sin modificar backend ni esquemas de datos.

## Caja de archivos
Archivos autorizados para modificación:
- `src/pages/FichaView.tsx`
- `src/pages/FichaPreview.tsx`
- `src/components/AuthGateModal.tsx`

## Criterios de done
- [x] Implementar la experiencia de Registro Exprés ("Perfil básico en 1 minuto") capturando Nombre, 1 Saber y 1 Necesidad.
- [x] Guardar el perfil básico en Firestore mediante el servicio existente `fichas.ts` marcando `hasFicha = true`.
- [x] Asegurar que tras guardar el perfil básico, el usuario aparezca en el directorio comunitario con su Tríada inicial.
- [x] Mantener el acceso al "Manual Galáctico Completo" en `/ficha` como ampliación opcional profunda sin exigir fecha de nacimiento en el registro exprés.
- [x] Reutilizar `<TagArrayEditor />` para normalizar la Tríada en `FichaPreview.tsx` y campo `bio` libre.
- [x] Implementar el fallback de rutas comodín 404 con Toast informativo explicativo y navegación a `/orientacion`.
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido
- [x] Rama creada: feat/T-112-registro-expres-perfil
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
