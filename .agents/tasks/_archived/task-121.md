# Task-121: Añadir tests/checklist de claves faltantes, fallback controlado y verificación manual EN de fundraising

## Objetivo
Verificar la coherencia completa de la internacionalización en inglés (EN) para la campaña de fundraising, asegurar un fallback controlado en i18next que evite mostrar claves técnicas en UI y añadir una suite de tests/checklist de verificación sin claves faltantes.

## Contexto técnico
- Se han completado T-116 a T-120 creando diccionarios i18n en `src/locales/{es,en}/` para los namespaces `common`, `welcome`, `auth`, `communities` y `passport`.
- En esta tarea se debe asegurar que si una clave falta en EN se utilice un fallback controlado y no la clave literal (`namespace:key`).
- Se revisará el copy en inglés de fundraising (ej. *"Full Galactic Blueprint"* frente a términos más claros para inversores/aliados internacionales).
- Se añadirá una prueba automatizada/script o suite de verificación que compruebe la simetría de claves entre `es` y `en`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/i18n.ts`
- `src/locales/en/welcome.json`
- `src/locales/es/welcome.json`
- `src/locales/en/common.json`
- `src/locales/es/common.json`
- `scripts/check-i18n-keys.ts` / `src/test/i18n.test.ts` (si aplica)

## Criterios de done
- [ ] Fallback de i18next configurado para caer a `es` o a un texto legible neutro antes de imprimir claves técnicas como `TABS.PRESENTACION`.
- [ ] Script/test de verificación de simetría de claves entre los diccionarios `es` y `en` creado y ejecutado con exito.
- [ ] Copy en EN verificado y pulido para la narrativa de fundraising.
- [ ] Compilación sin errores TypeScript (`npx tsc --noEmit`), build y lint limpios.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-08-16 17:03 (APROBADO CON CAMBIOS)
- [x] Rama creada: feat/T-121-i18n-tests-fallback
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
