---
description: Generate and run load tests for endpoints
---

# Workflow: /load-test

**Ejecutar cuando:** Antes de escalar, validar performance, stress test

## Proceso

### 1. Identificar Endpoint

```
"¿Qué endpoint testear?"

- POST /seo/generate-content
- POST /publish/upload
- GET /health
```

### 2. Definir Parámetros

```
Configuración:
- Usuarios concurrentes: 10, 50, 100
- Duración: 1 min, 5 min
- Ramp-up: gradual o spike
```

### 3. Generar Script Locust

```python
# tests/load/locustfile.py
from locust import HttpUser, task, between

class SEOUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def generate_content(self):
        self.client.post("/seo/generate-content", json={
            "keyword": "test keyword",
            "template_type": "guide"
        })
    
    @task(3)
    def health_check(self):
        self.client.get("/health")
```

### 4. Ejecutar Test

```bash
# Modo web UI
locust -f tests/load/locustfile.py --host=https://api.romensuarez.com

# Modo headless
locust -f tests/load/locustfile.py \
  --host=https://api.romensuarez.com \
  --users 50 \
  --spawn-rate 5 \
  --run-time 2m \
  --headless
```

### 5. Analizar Resultados

```markdown
## Load Test Report

### Configuración
- Usuarios: 50
- Duración: 2 min
- Endpoint: POST /seo/generate-content

### Resultados
| Métrica | Valor |
|---------|-------|
| Requests/sec | 12.5 |
| Avg latency | 850ms |
| P95 latency | 2100ms |
| Error rate | 2% |

### Conclusión
- ✅ Aguanta 50 usuarios concurrentes
- ⚠️ P95 alto, considerar rate limiting
- ❌ Error rate sube con >100 usuarios
```

## Output

- `tests/load/locustfile.py`
- Report de resultados
- Recomendaciones de scaling

## Ejemplo

```
User: /load-test /seo/generate-content

Agent:
"Generando test de carga para POST /seo/generate-content...

Script creado: tests/load/locustfile.py

¿Ejecuto con 50 usuarios por 2 minutos?
(Nota: Esto hará requests reales a la API)"
```
