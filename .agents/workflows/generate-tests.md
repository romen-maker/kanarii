---
description: Generate unit tests for a module or function
---

# Workflow: /generate-tests

**Ejecutar cuando:** Nueva funcionalidad añadida, módulo sin tests

## Proceso

### 1. Identificar Objetivo

```
"¿Qué archivo/función quieres testear?"

Opciones:
- Archivo específico → tests/test_{nombre}.py
- Función específica → tests para esa función
- Módulo completo → suite de tests
```

### 2. Analizar Código

- Leer archivo objetivo
- Identificar:
  - Funciones públicas
  - Métodos de clase
  - Edge cases (None, vacío, error)
  - Dependencias externas (mocks necesarios)

### 3. Generar Tests

```python
# Estructura por test:
def test_{función}_success():
    """Happy path"""
    
def test_{función}_empty_input():
    """Edge case: input vacío"""
    
def test_{función}_error_handling():
    """Error cases"""
```

### 4. Crear Mocks

```python
# Si hay dependencias externas:
@patch('module.external_api')
def test_with_mock(mock_api):
    mock_api.return_value = {...}
```

### 5. Ejecutar y Reportar

```bash
pytest tests/test_{nombre}.py -v --cov={módulo}
```

## Output

- `tests/test_{nombre}.py` con tests completos
- Coverage report
- Lista de edge cases cubiertos

## Ejemplo

```
User: /generate-tests agents/seo_writer/quality_validator.py

Agent:
"Analizando quality_validator.py...

Funciones detectadas:
- validate_eeat(content) → 3 tests
- check_readability(text) → 2 tests
- score_content(html) → 4 tests

Generando tests/test_quality_validator.py..."
```
