# Task-111: Rediseñar la pantalla de entrada (Welcome.tsx) como Panel de Orientación

## Objetivo
Unificar la experiencia de entrada para nuevos miembros en `Welcome.tsx`, ofreciendo una orientación clara sobre la comunidad ("Quién soy, quién está y qué nodos existen"), mostrando miembros destacados con su Tríada (saberes/necesidades), espacios activos y la bifurcación transparente entre "Perfil básico en 1 minuto" y "Manual Galáctico Completo".

## Contexto técnico
- `src/pages/Welcome.tsx` es la vista actual de bienvenida y orientación.
- `src/components/onboarding/WelcomeHeroSections.tsx` contiene los bloques de presentación maquetados.
- `src/pages/ContextConsent.tsx` conecta *"Siento la llamada y me resuena"* con `/orientacion`.
- `src/App.tsx` registra la ruta pública `/orientacion`.

## Caja de archivos autorizados
- `src/pages/Welcome.tsx`
- `src/components/onboarding/WelcomeHeroSections.tsx`
- `src/pages/ContextConsent.tsx`
- `src/App.tsx`

## Criterios de done
- [x] `Welcome.tsx` muestra un panel de bienvenida y orientación estructurado ("Quién soy", "Quién está", "Qué nodos existen").
- [x] Incorpora un bloque de miembros activos (máximo 3-4 destacados) mostrando su Tríada (saberes y necesidades).
- [x] Muestra tarjetas de nodos/espacios comunitarios activos con CTA directo de explorar.
- [x] Incluye bifurcación transparente de registro: "Perfil básico en 1 minuto" (fricción cero) vs "Manual Galáctico Completo" (extenso).
- [x] Enrutamiento `/orientacion` conectado desde `ContextConsent.tsx`.
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Hallazgos del análisis para Hotfix subsiguiente
- Se identificó que `FichaPreview.tsx:L108` escribe `localStorage.setItem('kanarii_pendingFicha', ...)` al cargar datos reales de Firestore, generando borradores fantasmas. Se resolverá en un commit de hotfix separado para mantener la trazabilidad limpia.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-02T10:49:32+01:00
- [x] Rama creada: `feat/T-111-orientacion-welcome`
- [x] Lock activo: `.agent-session.lock`
- [x] Sesión cerrada correctamente
