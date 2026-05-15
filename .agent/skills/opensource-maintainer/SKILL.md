---
name: opensource-maintainer
description: Mantiene los archivos esenciales para que Kanarii funcione como proyecto open source colaborativo. Úsala cuando se incorpore un colaborador nuevo, haya un release, cambie el stack o quieras que el repo esté listo para contribuciones externas.
---

# Open Source Maintainer (Gobernanza del Repo)

Esta habilidad asegura que el repositorio de Kanarii cumpla con los estándares de un proyecto de código abierto colaborativo, manteniendo una documentación clara que invite a la participación respetando los valores de horizontalidad y transparencia del proyecto.

## Instrucciones y Acciones

El agente puede ejecutar estas acciones según la necesidad:

### Acción 1: Auditoría de Estado Open Source
- Revisa la existencia de: `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`.
- Genera una tabla de estado indicando qué archivos faltan o necesitan actualización.
- **ALERTA**: Si falta el archivo `LICENSE`, advierte al usuario de que el código es técnicamente "todos los derechos reservados" y propón opciones (AGPL-3.0, MIT, GPL-3.0).

### Acción 2: Gestión de CONTRIBUTING.md
Genera o actualiza las guías de contribución incluyendo:
- **Filosofía**: 3 líneas sobre comunidad intencional, código abierto y gobernanza horizontal.
- **Convenciones de Desarrollo**:
    - Ramas: `feature/`, `fix/`, `docs/`, `chore/`.
    - Commits: Conventional Commits (`feat`, `fix`, `docs`, etc.).
- **Proceso de PR**: Flujo desde la rama hasta el merge en `main`.
- **Canales**: Cómo usar los Issues de GitHub para reportar bugs o proponer ideas.

### Acción 3: Gestión de CODE_OF_CONDUCT.md
Crea un código de conducta adaptado a Kanarii:
- **Valores**: Horizontalidad, equivalencia y comunicación no violenta.
- **Inclusión**: Espacio seguro para todos los niveles técnicos.
- **Conflictos**: Proceso de resolución basado en el diálogo directo y la mediación.

### Acción 4: Mantenimiento del README.md
- Propón actualizaciones quirúrgicas de secciones específicas cuando haya nuevas funcionalidades estables o cambios de stack.
- Mantén siempre el tono cercano y la estructura original.

## Reglas de Ejecución
- **Confirmación Obligatoria**: Antes de realizar cualquier cambio en los archivos raíz (`README`, `LICENSE`, `CONTRIBUTING`, `CODE_OF_CONDUCT`), pide permiso explícito al usuario, mostrando el resumen de cambios.
- **Tono Coherente**: La documentación debe sentirse como una invitación a un espacio vivo, no como un manual corporativo frío.
- **Transparencia**: Explica siempre por qué es importante mantener estos archivos al día para la salud del proyecto.

---

*Última actualización: 15 May 2026*
