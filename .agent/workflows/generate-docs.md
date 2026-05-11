---
description: Generate documentation for modules
---

# Workflow: /generate-docs

**Ejecutar cuando:** Módulo nuevo, código sin documentar

## Proceso

### 1. Identificar Objetivo

```
"¿Qué documentar?"

- Módulo completo → README + docstrings
- Clase específica → Docstrings detallados
- API endpoint → OpenAPI + ejemplos
```

### 2. Analizar Código

- Leer funciones públicas
- Identificar parámetros y returns
- Detectar dependencias
- Extraer ejemplos de uso

### 3. Generar Docstrings (Google Style)

```python
def generate_content(keyword: str, template_type: str) -> ContentResponse:
    """Genera contenido SEO para una keyword.
    
    Args:
        keyword: Palabra clave objetivo (ej: "mejores auriculares")
        template_type: Tipo de template ("guide", "comparison", "listicle")
    
    Returns:
        ContentResponse con HTML generado y metadata
        
    Raises:
        ValueError: Si keyword está vacío
        LLMError: Si falla la generación
        
    Example:
        >>> response = generator.generate_content("mejores laptops", "guide")
        >>> print(response.html[:100])
    """
```

### 4. Generar README del Módulo

```markdown
# {Nombre del Módulo}

## Descripción
{Qué hace el módulo}

## Instalación
{Dependencias necesarias}

## Uso Básico
```python
from {módulo} import {clase}
{ejemplo de uso}
```

## API Reference
{Tabla de funciones principales}

## Configuración
{Variables de entorno, config files}
```

### 5. Output

- Docstrings añadidos al código
- `docs/modules/{nombre}.md`

## Ejemplo

```
User: /generate-docs agents/seo_writer/content_generator.py

Agent:
"Analizando content_generator.py...

Documentación a generar:
- 4 funciones públicas sin docstrings
- README del módulo

Generando:
1. Docstrings para generate(), _generate_products(), _generate_faqs(), _generate_intro()
2. docs/modules/content_generator.md

¿Procedo?"
```
