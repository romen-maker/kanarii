---
description: Search community n8n workflows before creating custom
---

# Workflow: Search Community N8N Workflows

**Objetivo:** Evitar reinventar la rueda buscando soluciones existentes en la comunidad antes de desarrollar custom workflows.

## Prerrequisitos

El servicio MCP debe estar clonado en `services/n8n-workflows-mcp`.

## Pasos

### 1. Iniciar Servicio (Local)

Si no está corriendo:

```bash
cd services/n8n-workflows-mcp
source ../../.venv/bin/activate  # Usar venv principal
nohup python run.py > server.log 2>&1 &
```

### 2. Buscar Workflows

Usar `curl` o navegador para buscar por keywords:

```bash
# Ejemplo: buscar workflows de SEO
curl "http://localhost:8000/api/workflows?q=seo"

# Ejemplo: buscar prompt testing
curl "http://localhost:8000/api/workflows?q=prompt"
```

### 3. Evaluar Resultados

Analizar el JSON de respuesta. Campos clave:
- `name`: Nombre del workflow
- `description`: Qué hace
- `integrations`: Qué servicios usa
- `node_count`: Complejidad

### 4. Descargar e Importar

Para obtener el JSON completo de un workflow específico:

```bash
curl "http://localhost:8000/api/workflows/{filename}"
```

Copia el `raw_json` e impórtalo en n8n local.

## Best Practices

- **Search first:** Antes de escribir 1 línea de código.
- **Adapt > Create:** Es más rápido modificar un workflow existente que empezar de cero.
- **Inspiration:** Incluso si no sirve exacto, ver cómo otros resolvieron problemas similares.
