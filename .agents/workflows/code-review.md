---
description: Review code for quality, smells, and improvements
---

# Workflow: /code-review

**Ejecutar cuando:** Antes de merge, revisar calidad de código

## Proceso

### 1. Identificar Scope

```
"¿Qué revisar?"

Opciones:
- Branch actual vs main → git diff
- Carpeta específica → scan completo
- Archivo específico → deep review
```

### 2. Ejecutar Análisis

**Detectar:**
- ❌ Code smells (funciones >50 líneas, complejidad ciclomática alta)
- ❌ Imports no usados
- ❌ Variables no usadas
- ❌ Funciones sin docstrings
- ❌ Código duplicado
- ❌ TODOs obsoletos
- ⚠️ Naming inconsistente
- ⚠️ Magic numbers/strings

### 3. Reportar Hallazgos

```
📊 Code Review Report

Archivos analizados: X

🔴 Críticos (bloquean merge):
- [archivo:línea] Función sin error handling
- [archivo:línea] SQL injection posible

🟡 Mejoras sugeridas:
- [archivo:línea] Extraer a función separada
- [archivo:línea] Añadir type hints

🟢 Buenas prácticas detectadas:
- Docstrings completos en X funciones
- Tests existentes para Y módulos
```

### 4. Proponer Refactoring

```
"Propongo estos cambios (NO los ejecuto):

1. Extraer líneas 45-60 a helper function
2. Añadir try/except en línea 78
3. Renombrar 'x' → 'user_count'

¿Los implemento?"
```

## Output

- Report markdown con hallazgos
- Sugerencias de mejora
- NO ejecuta cambios automáticamente

## Ejemplo

```
User: /code-review

Agent:
"Analizando diferencias en feat/new-feature vs main...

📊 Code Review:
- 3 archivos modificados
- 1 función sin docstring → agents/seo_writer/content_generator.py:245
- 2 imports no usados → api/routes/seo.py

¿Quieres que corrija los imports automáticamente?"
```
