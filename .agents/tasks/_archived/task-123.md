# Task-123: Internacionalización completa del motor astrológico (Carta Astral y Diseño Humano)

## Objetivo
Crear el catálogo i18n y la lógica de localización para la Carta Astral completa (12 signos, casas, aspectos) y los elementos de Diseño Humano (64 puertas, canales, tipos y autoridades), permitiendo mostrar las interpretaciones astronómicas en inglés y español.

## Contexto técnico
- Durante el Sprint 26 se completaron T-116 a T-122 para soportar la campaña de fundraising.
- Los elementos astronómicos/astrológicos profundos (signos astrales, casas, canales de HD) quedaron diferidos a esta tarea para no saturar el alcance inicial del fundraising.
- Requiere estructurar catálogos i18n para planetas, signos, tipos de HD y canales en `src/locales/{es,en}/astrology.json`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/fichas.ts`
- `src/lib/kinMaya.ts`
- `src/locales/es/astrology.json`
- `src/locales/en/astrology.json`

## Criterios de done
- [ ] Catálogo de los 12 signos zodiacales, planetas y elementos traducidos en ES/EN.
- [ ] Mapeo de tipos de Diseño Humano (Generator, Projector, Manifestor, Reflector) y autoridades traducidos.
- [ ] Integración con las vistas de Ficha y Manual.
- [ ] Compilación sin errores TypeScript (`npx tsc --noEmit`), build y lint limpios.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-16 17:13 (APROBADO CON CAMBIOS)
- [x] Rama creada: feat/T-123-i18n-astrology-hd
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
