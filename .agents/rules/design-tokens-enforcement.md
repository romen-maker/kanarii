---
trigger: always_on
---

# Design Tokens Enforcement

> Garantizar que todos los colores y estilos semánticos de la aplicación consuman los design tokens unificados del bloque `@theme` de CSS para evitar la dispersión de valores hexadecimales y asegurar la coherencia de la UI.

## Reglas

1. **Prohibido usar colores hexadecimales arbitrarios en clases Tailwind**: No escribir clases como `bg-[#...]`, `text-[#...]`, `border-[#...]`, `fill-[#...]`, etc. en componentes React (`.tsx`) o HTML. Se debe emplear siempre la clase semántica generada por el `@theme` en `src/index.css` (ej: `bg-bg-page`, `text-status-success-text`, `border-border`).
2. **Prohibido usar sintaxis de variable arbitraria de Tailwind**: No usar expresiones como `border-(--color-border)` o `bg-(--color-status-success-bg)` en el código del componente. Se debe usar la clase utilitaria directa autogenerada por Tailwind CSS v4 (`border-border`, `bg-status-success-bg`).
3. **Modificación previa en @theme**: Si un componente requiere un color o variante que no se encuentra mapeado en el bloque `@theme` de `src/index.css`, el desarrollador/agente debe primero agregarlo en ese bloque, documentar y actualizar el ADR-023 y, posteriormente, consumirlo en el código.

## Ejemplos

- ✅ **Correcto**:
  ```tsx
  <div className="bg-bg-page border border-border text-status-success-text">
    <CheckCircle2 className="w-5 h-5 text-status-success-bg" />
  </div>
  ```

- ❌ **Incorrecto**:
  ```tsx
  <div className="bg-[#FDFBF7] border border-[#EAE2D6] text-[#2C4C3B]">
    {/* Error: Clases con hexadecimales hardcodeados */}
    <CheckCircle2 className="w-5 h-5 text-(--color-status-success-bg)" />
    {/* Error: Sintaxis de variable de Tailwind CSS v4 en lugar de la clase utilitaria directa */}
  </div>
  ```

## Excepciones
- Estilos aplicados de forma dinámica y programática basados en variables de backend dinámicas del usuario (por ejemplo, colores personalizados de un banner comunitario almacenado en base de datos).
- Comentarios inline o valores de testeo en sandbox y scripts de desarrollo (`.tmp/`, `scripts/`).
