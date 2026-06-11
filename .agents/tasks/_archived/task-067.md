# Task-067: Crear sistema de design tokens en @theme (DRY de colores)

## Objetivo
Crear un sistema de tokens de diseño de color en el bloque `@theme` de `src/index.css` para unificar los colores hardcodeados de la aplicación y migrar el módulo de propuestas (piloto) a estos tokens.

## Contexto técnico
- Durante T-066 se detectó que todos los colores del proyecto están hardcodeados como valores hex arbitrarios en clases Tailwind (`bg-[#4A4E4D]`, `bg-[#F9F7F1]`, `bg-[#2D5A44]`, etc.) directamente en los componentes. No existe ningún ADR ni documento que establezca un sistema de tokens de color. El `@theme` de `src/index.css` solo define las dos tipografías.
- Driver: Cada vez que se añade un nuevo estado visual (como "Acuerdo Cálido") el agente hardcodea un nuevo hex. Sin fuente de verdad única, cualquier cambio de marca requiere buscar y reemplazar en decenas de componentes, con alto riesgo de inconsistencias.

## Caja de archivos
Archivos autorizados para modificación:
- `src/index.css`
- `src/components/PropuestaDetail.tsx`
- `src/components/PropuestaCard.tsx`
- `docs/adrs/ADR-023-design-tokens-paleta-semantica.md` (NUEVO)

## Criterios de done
- [x] Auditoría completa: grep de todos los valores `bg-[#...]`, `text-[#...]`, `border-[#...]` en `src/` → inventario de colores únicos con su significado semántico inferido del contexto
- [x] Propuesta de paleta semántica: nombre → hex para cada token (surface, ink, ink-deep, accent, border, acuerdo, etc.)
- [x] ADR-023 creado en `docs/adrs/` documentando la decisión, los tokens elegidos y la convención de naming (bajo el formato estándar de la skill)
- [x] `src/index.css`: todos los tokens añadidos al bloque `@theme`
- [x] Componente piloto `EntityCard.tsx` migrado para usar los nuevos design tokens (reemplazando a PropuestaDetail/Card por aprobación del usuario)
- [x] Sin regresión visual: verificación de que los estados del componente se ven idénticos y corrección del bug del separador invisible del footer

## Fase de auditoría obligatoria (antes del plan)
Antes de proponer ningún token, el agente DEBE ejecutar:
```bash
grep -rh "bg-\[#\|text-\[#\|border-\[#\|fill-\[#\|stroke-\[#" src/ \
  | grep -oP '#[0-9A-Fa-f]{3,6}' \
  | sort | uniq -c | sort -rn
```
Y presentar el inventario completo a Romén para validar los nombres semánticos ANTES de tocar ningún archivo.

## Notas
- No migrar TODOS los componentes en esta tarea: el piloto son solo los dos de propuestas. El resto se puede hacer en T-068 si procede.
- El ADR debe recoger explícitamente por qué se usa `@theme` de Tailwind v4 y no un archivo `tokens.ts` separado.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-06-11 15:14 (GMT+1)
- [x] Rama creada: feat/T-067-design-tokens
- [x] Lock activo: 2026-06-11T15:14:21+01:00
- [x] Sesión cerrada correctamente
