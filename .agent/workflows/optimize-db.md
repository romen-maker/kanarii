---
description: Analyze and optimize database queries
---

# Workflow: /optimize-db

**Ejecutar cuando:** Tablas crecen, queries lentas, antes de escalar

## Proceso

### 1. Identificar Problema

```
"¿Qué optimizar?"

- Tabla específica → analizar índices
- Query lenta → reescribir
- Schema general → revisar normalización
```

### 2. Analizar Queries

```sql
-- Ver queries lentas (PostgreSQL)
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### 3. Verificar Índices

```sql
-- Tablas sin índices
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public';

-- Índices existentes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### 4. Proponer Optimizaciones

```markdown
## Análisis de Performance

### Queries Problemáticas
| Query | Tiempo Avg | Mejora Propuesta |
|-------|-----------|------------------|
| SELECT * FROM articles WHERE keyword LIKE '%...' | 500ms | Añadir índice GIN |

### Índices Sugeridos
```sql
CREATE INDEX idx_articles_keyword ON articles USING gin(keyword gin_trgm_ops);
CREATE INDEX idx_generations_date ON generations(created_at);
```

### Schema Improvements
- Considerar partitioning para tabla >1M rows
- Añadir columna computed para búsquedas frecuentes
```

### 5. Output

- Report de análisis
- Scripts SQL de optimización
- EXPLAIN plans antes/después

## Ejemplo

```
User: /optimize-db

Agent:
"Conectando a PostgreSQL...

Análisis:
- Tabla 'articles': 50K rows, sin índice en 'keyword'
- Query más lenta: SELECT con LIKE (avg 450ms)

Propuesta:
CREATE INDEX idx_articles_keyword ON articles(keyword);

Mejora estimada: 450ms → 5ms

¿Ejecuto el CREATE INDEX?"
```
