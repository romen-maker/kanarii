# ADR 023: Sistema de Design Tokens y Paleta Semántica en @theme

**Estado:** Accepted
**Fecha:** 2026-06-11
**Contexto:** T-067 / Unificación de colores en design tokens

## Contexto
Durante el desarrollo de la visualización de "Acuerdo Cálido" (T-066), se constató que la aplicación carecía de una fuente única de verdad para los colores de marca y estados. Todos los colores se encontraban hardcodeados como valores hexadecimales arbitrarios directamente en las clases de utilidad de Tailwind (por ejemplo, `bg-[#4A4E4D]`, `bg-[#F9F7F1]`, `bg-[#2D5A44]`). Esto imposibilitaba el mantenimiento del branding y el cambio o refactorización de elementos comunes sin incurrir en riesgos de inconsistencias visuales y regresión de diseño.

## Decisión
Centralizar los tokens de diseño de color en el bloque `@theme` de `src/index.css` de Tailwind CSS v4, eliminando la necesidad de archivos de configuración separados (como un `tokens.ts` o configuraciones JS de Tailwind externas) y aprovechando la compilación nativa estática y generación automática de clases de utilidad de Tailwind v4.

Además, en el piloto del sistema, se unifican las variantes de estado de `EntityCard.tsx` mapeándolas 1:1 a los tokens de diseño de color creados.

### Componentes Clave
1. **`src/index.css` (@theme):** Define los nombres de las variables CSS de tokens (p. ej. `--color-bg-page`, `--color-status-success-bg`, etc.) en el bloque `@theme`, haciendo que Tailwind genere automáticamente clases utilitarias del tipo `bg-bg-page` o `text-status-success-text`.
2. **`src/components/ui/EntityCard.tsx`:** Componente piloto que migra de colores hexadecimales hardcodeados a clases semánticas de Tailwind v4, manteniendo sus variantes de estado originales (`success`, `warning`, `info`/`primary`, `danger`, `neutral`).
3. **Indexación y Trazabilidad:** Documentar los tokens aprobados y su correspondencia en este ADR.

### Corrección Detectada Durante la Auditoría
Durante la fase de auditoría del piloto se identificó que el separador del footer de acciones en `EntityCard.tsx` utilizaba `border-t border-[#FDFBF7]`. Dado que `#FDFBF7` es el color de fondo de los chips de metadatos, el separador era visualmente invisible. Se corrige este separador usando `border-t border-border` para dar la consistencia visual esperada y mejorar la visibilidad.

## Paleta de Tokens Definida

```css
@theme {
  /* Fondos unificados */
  --color-bg-page: #FDFBF7;
  --color-bg-surface: #F9F7F1;
  --color-text-ink: #4A4E4D;

  /* Bordes */
  --color-border: #EAE2D6;
  --color-border-hover: #D4C3A3;

  /* Colores de Marca (Brand) */
  --color-brand-terracota: #CB997E;
  --color-forest-deep: #6B705C;
  --color-forest-mid: #A5A58D;

  /* Estados de EntityCard */
  --color-status-success-bg: #C1E1C1;
  --color-status-success-text: #2C4C3B;
  --color-status-warning-bg: #F9E2AF;
  --color-status-warning-text: #81651D;
  --color-status-info-bg: #A8DADC;
  --color-status-info-text: #1D3557;
  --color-status-danger-bg: #F9C0C0;
  --color-status-danger-text: #7C1D1D;
  --color-status-neutral-bg: #EAE2D6;
}
```

## Consecuencias

### Positivas (Pros)
* **Mantenibilidad Global:** Cualquier cambio en la identidad visual o paleta de colores de Kanarii se realizará modificando un único punto (`src/index.css`).
* **Cero Runtime Overhead:** No requiere importar un objeto TypeScript de tokens para resolver dinámicamente nombres de clase, manteniendo la rapidez y el rendimiento estático del compilador de Tailwind.
* **Refactorización Incremental:** Permite migrar progresivamente los componentes restantes de forma atómica y segura en tareas posteriores sin forzar una única reestructuración masiva.
* **Corrección de bugs visuales:** El uso de tokens de bordes explícitos detectó y corrigió el bug del separador invisible del footer de acciones en `EntityCard.tsx`.

### Negativas (Cons)
* Requiere disciplina constante en el desarrollo para evitar el uso de colores hexadecimales arbitrarios hardcodeados (`bg-[#...]`) en futuros componentes.

### Riesgos y Mitigaciones
* **Riesgo:** Inconsistencias o errores al definir nombres de clases generadas (p. ej. usar sintaxis obsoleta `border-(--color-border)`).
  * *Probabilidad:* Baja.
  * *Mitigación:* Se prohíbe el uso de la sintaxis arbitraria de variables `border-(--color-border)` en componentes; se debe emplear en su lugar la clase utilitaria generada directamente por Tailwind (`border-border`).

## Referencias
* [index.css](file:///home/romen/Proyectos/kanarii/src/index.css)
* [EntityCard.tsx](file:///home/romen/Proyectos/kanarii/src/components/ui/EntityCard.tsx)
* [task-067.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-067.md)
