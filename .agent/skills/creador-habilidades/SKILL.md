---
name: creador-habilidades
description: Experto en la creación de nuevas habilidades (Skills) para Antigravity en español.
---

# Creador de Habilidades

Esta habilidad te convierte en un experto capaz de guiar e implementar nuevas Skills dentro del ecosistema Antigravity, asegurando consistencia y calidad.

## Prerrequisitos
- Comprender el propósito de la nueva habilidad.
- Definir un nombre técnico único en formato `kebab-case`.

## Flujo de Trabajo

### 1. Definición y Diseño
1.  **Analizar la Solicitud**: Entiende qué problema resuelve la nueva habilidad.
2.  **Proponer Especificaciones**: Antes de crear nada, valida con el usuario:
    - **Nombre Técnico**: Debe ser `kebab-case` (ej: `analisis-datos-csv`).
    - **Descripción**: Breve resumen para el frontmatter.
    - **Ubicación**: Confirma que será en `.agent/skills/<nombre-tecnico>/`.

### 2. Estructura del Archivo SKILL.md
El archivo principal debe ser `SKILL.md`. Usa esta plantilla base:

```markdown
---
name: <nombre-tecnico>
description: <descripción-corta>
---

# <Título Humanizado de la Habilidad>

<Introducción breve sobre qué hace esta habilidad y cuándo usarla>

## Prerrequisitos (Opcional)
- Dependencias, claves de API, o configuraciones previas necesarias.

## Instrucciones
Pasos detallados, secuenciales y deterministas que el agente debe seguir.

1. **Paso 1**: Acción concreta.
2. **Paso 2**: Siguiente acción.
   - Detalle o comando específico.

## Recursos (Opcional)
- Referencias a scripts en subdirectorios (ej: `scripts/mi_script.py`).
```

### 3. Implementación
1.  **Crear Directorio**:
    - Usa `run_command` para crear la carpeta: `mkdir -p .agent/skills/<nombre-tecnico>`.
2.  **Crear SKILL.md**:
    - Usa `write_to_file` con la plantilla rellenada.
3.  **Scripts Adicionales** (si aplica):
    - Si la habilidad requiere scripts complejos, crea una carpeta `scripts/` dentro del directorio de la habilidad y coloca allí el código.

### 4. Registro en Inventario
1.  **Localizar Inventario**:
    - El archivo suele estar en `.agent/context/agent-skills-inventory.md`.
2.  **Añadir Entrada**:
    - Añade una nueva entrada al final de la lista "Lista de Habilidades Activas".
    - Sigue el formato:
      ```markdown
      ### N. <Nombre Humanizado> (`<nombre-tecnico>`)
      - **Para qué sirve**: <descripción-corta>
      - **Cómo invocar**: <ejemplo-invocación>
      - **Ubicación**: `.agent/skills/<nombre-tecnico>/`
      ```
    - Asegúrate de incrementar el número secuencial (N).
3.  **Actualizar Fecha**:
    - Ve al final del documento y actualiza la línea `*Última actualización: ...*` con la fecha actual.

### 5. Verificación y Entrega
- Verifica que los archivos existen en la ruta correcta.
- Notifica al usuario que la habilidad ha sido creada y está lista para ser usada (el agente la detectará al escanear skills o cuando se le indique).
