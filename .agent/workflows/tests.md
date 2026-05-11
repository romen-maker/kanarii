---
description: Run test suite and evaluate test coverage
---

# Workflow: /tests - Ejecutar y Gestionar Tests

**Ejecutar cuando:** 
- Antes de mergear feature branch
- Después de añadir funcionalidad nueva
- Health check regular del proyecto

## Acciones

### 1. Verificar Existencia de Tests

```bash
# Verificar directorio de tests
ls -la tests/
```

**Si NO existe directorio:**
```
"No hay directorio tests/ configurado aún.

¿Quieres que configure pytest ahora para empezar a escribir tests?"
```

### 2. Ejecutar Test Suite

```bash
# Ejecutar todos los tests con verbose
pytest tests/ -v

# O con coverage
pytest tests/ --cov=agents --cov=api --cov-report=term-missing
```

### 3. Reportar Resultados

```
📊 Resultados de Tests:

✅ Pasados: X tests
❌ Fallidos: Y tests
⚠️ Warnings: Z

Cobertura actual: XX%

[Detalles de tests fallidos si hay]
```

### 4. Evaluar Cobertura

**Preguntas a hacer:**
- ¿Las funcionalidades nuevas tienen tests?
- ¿Falta algún edge case importante?
- ¿Hay código crítico sin tests?

**Criterios:**
- **MVP:** Tests básicos (happy path) OK
- **Producción:** >70% coverage deseable
- **Crítico (pagos, seguridad):** >90% coverage

### 5. Proponer Nuevos Tests

Si falta cobertura:
```
"Detecto que falta cobertura en:
- [Módulo/función sin tests]
- [Edge case no cubierto]

Propongo crear tests para:
1. [Test 1] - Valida [caso]
2. [Test 2] - Valida [caso]

¿Los creo ahora?"
```

## Ejemplo: Before Merge

```
User: /tests

Agent:
"Ejecutando test suite..."

📊 Resultados:

✅ Pasados: 15/15 tests
Cobertura: 78%

Módulos testeados:
- config/models_config.py ✅ 95%
- agents/llm_router.py ✅ 85%
- api/routes/seo.py ⚠️ 60%

Recomendación:
- api/routes/seo.py tiene coverage bajo
- Propongo añadir tests para error handling

¿Quieres que cree los tests, o mergeamos así (MVP approach)?"
```

## Ejemplo: Funcionalidad Nueva

```
User: "Acabo de añadir /seo/generate-article endpoint"

Agent: "/tests"

📊 Análisis:

❌ No hay tests para /seo/generate-article

Propongo crear:
1. test_generate_article_success() - Happy path
2. test_generate_article_invalid_keyword() - Error handling
3. test_generate_article_llm_timeout() - LLM failure

¿Los creo ahora antes de mergear?"
```

## Comandos Útiles

```bash
# Ejecutar tests de un módulo específico
pytest tests/test_models_config.py -v

# Ejecutar un test específico
pytest tests/test_models_config.py::test_yaml_loading -v

# Ver coverage detallado
pytest --cov=agents --cov-report=html
# Luego abrir htmlcov/index.html

# Ejecutar solo tests marcados como 'slow'
pytest -m slow

# Ejecutar todo EXCEPTO tests lentos
pytest -m "not slow"
```

## Configuración Pytest

Si no existe `pytest.ini`:
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_functions = test_*
addopts = -v --tb=short
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
```

## Archivos a Crear/Modificar

- `tests/test_*.py` (si propones nuevos tests)
- `pytest.ini` (si no existe)
- `.github/workflows/tests.yml` (CI/CD, futuro)

## Archivos a Leer

- `tests/` (directorio completo)
- `.agent/DEFINITION_OF_DONE.md` (criterios de tests)
