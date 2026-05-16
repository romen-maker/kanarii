---
description: Create n8n workflow using MCP and Antigravity
---

# Workflow: /n8n-create - Create N8N Workflow

**Ejecutar cuando:** Necesitas crear o modificar un workflow n8n

## 📋 Overview

Este workflow implementa el flujo asistido para crear workflows n8n usando:
- Antigravity (diseño lógico)
- MCP Server (deployment automático)
- Opcional: n8n Builder AI (visualización)

**Referencias:**
- Flujo asistido: `docs/workflows/n8n_assisted_flow.md`
- **Organización:** `docs/workflows/organization.md` ← Carpetas + Tags

---

## 🔧 Prerequisites

**Antes de usar este workflow:**
- [ ] MCP N8N Builder desplegado en VPS
- [ ] Test: `curl http://localhost:3001/workflows` funciona
- [ ] MCP Workflows (community search) corriendo
- [ ] Test: `curl http://localhost:8000/api/workflows?q=test`
- [ ] N8N API key configurada

**Si no:**
- MCP N8N Builder: Ver `docs/setup/n8n_mcp_setup.md`
- MCP Workflows: Ver workflow `/search-workflows`

---

## 📝 Workflow Steps

### Step 1: Define Objective

**User (Romén):**
Describe qué debe hacer el workflow:
```
Ejemplo:
"Necesito un workflow que lea filas de Google Sheets,
llame a la API de KanAIrOS para generar contenido,
y marque el status en la hoja."
```

---

### Step 2: Design Logic (Antigravity)

**Antigravity genera:**
1. **Diagrama lógico** (mermaid o texto)
2. **Lista de nodos** n8n necesarios
3. **Inputs/outputs** de cada nodo

**Ejemplo output:**
```
Nodos necesarios:
1. Trigger: Manual
2. Google Sheets: Read Rows (filter status='pending')
3. Loop: For each row
4. HTTP Request: POST /seo/generate-article
5. Google Sheets: Update Row (status='completed')
6. Error Handler: IF error → Mark 'failed'
```

---

### Step 2.5: Search Community Workflows 🔍

> **⚠️ IMPORTANTE:** Antes de generar un workflow custom, SIEMPRE buscar workflows existentes en la comunidad.
> 
> **Referencia:** Ver workflow `/search-workflows` para detalles completos.

**Antigravity ejecuta:**

1. **Extraer keywords** del objetivo y diseño del Step 2:
   ```
   Ejemplo:
   Objetivo: "Export OpenRouter activity to CSV daily"
   
   Keywords:
   - "openrouter"
   - "export csv"
   - "schedule daily"
   - "api activity"
   ```

2. **Buscar en MCP workflows:**
   
   **Prerequisito:** MCP workflows debe estar corriendo:
   ```bash
   # Verificar si está corriendo
   curl http://localhost:8000/health
   
   # Si no, iniciar (ver /search-workflows)
   cd services/n8n-workflows-mcp
   source ../../.venv/bin/activate
   python run.py
   ```
   
   **Búsqueda:**
   ```bash
   # Por cada keyword relevante
   curl "http://localhost:8000/api/workflows?q={keyword}"
   ```

3. **Parsear y rankear resultados:**
   - Filtrar por relevancia (match > 50%)
   - Ordenar por: score descendente, node_count ascendente
   - Limitar a top 5

**Output a usuario:**

```markdown
🔍 Workflows de comunidad encontrados (5 resultados):

1. **OpenRouter Activity Logger** (Match: 95%)
   - Nodes: 7
   - Trigger: Cron daily
   - Integrations: HTTP, File Write
   - Description: Logs OpenRouter API calls to CSV

2. **API to CSV Exporter** (Match: 78%)
   - Nodes: 5
   - Trigger: Manual/Webhook
   - Integrations: HTTP Request, Code, Write File

[... más resultados ...]
```

**Si no hay resultados:**
```
🔍 No encontré workflows similares en la comunidad.

Procediendo a generar workflow custom...
[Saltar a Step 3]
```

---

### Step 2.6: Import Candidates to N8N ⬇️

**Si hubo resultados en Step 2.5:**

**Antigravity pregunta:**
```
¿Cuáles workflows quieres que suba a tu n8n para revisar?
(Números separados por coma, ej: 1,2)

1. OpenRouter Activity Logger (Match: 95%)
2. API to CSV Exporter (Match: 78%)
3. Daily Report Generator (Match: 65%)
4. Scheduled API Caller (Match: 60%)
5. JSON to CSV Converter (Match: 55%)

Opciones:
- Números (ej: 1,2,4)
- "todos" - Subir los 5
- "ninguno" - Saltar y generar custom
```

**User responde:** Ej: `1,2`

**Antigravity ejecuta para cada seleccionado:**

```bash
# 1. Obtener JSON completo del workflow
curl "http://localhost:8000/api/workflows/{filename}" > temp.json

# 2. Subir a n8n vía API
curl -X POST https://n8n.romensuarez.com/api/v1/workflows \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @temp.json

# 3. Modificar nombre para indicar origen
# Prefix: "[Community]"
```

**Output:**
```
✅ Workflows importados a tu n8n:

1. [Community] OpenRouter Activity Logger
   📍 URL: https://n8n.romensuarez.com/workflow/abc123
   ⚠️ Status: inactive (revisar antes de activar)

2. [Community] API to CSV Exporter
   📍 URL: https://n8n.romensuarez.com/workflow/def456
   ⚠️ Status: inactive

💡 Abre los workflows en n8n para revisar su estructura.
```

---

### Step 2.7: Decision Point - Adapt or Build? 🔀

**Antigravity pregunta:**

```
¿Qué quieres hacer ahora?

A. Usar y adaptar uno de los workflows importados
B. Generar workflow custom desde cero

Respuesta: [A/B]
```

#### **Rama A: Adapt Existing Workflow**

```
User: "A"

Antigravity: 
"¿Cuál workflow quieres adaptar? (número)"

User: "1"

Antigravity:
"✅ Workflow seleccionado: OpenRouter Activity Logger

📍 Abre el workflow en n8n:
https://n8n.romensuarez.com/workflow/abc123

Revísalo y dime qué adaptaciones necesita:
- Cambiar credenciales
- Modificar schedule (cron)
- Ajustar API endpoints
- Cambiar campos CSV
- Otros cambios específicos

O si está listo tal cual, dime 'activar' para ponerlo en producción."
```

**Flujo de adaptación asistida:**
1. User indica cambios necesarios
2. Antigravity actualiza JSON vía MCP API
3. User testea en n8n
4. Repetir hasta funcional
5. Activar workflow
6. Guardar JSON en Git → Step 5 (Save to Git)

#### **Rama B: Generate Custom Workflow**

```
User: "B"

Antigravity:
"Entendido. Voy a generar un workflow custom desde cero.

Continuando con Step 3: Generate JSON..."
```

[Flujo continúa con Step 3 actual]

---

### Step 3: Generate JSON

**Antigravity:**
Genera JSON completo del workflow n8n:

```
Prompt template:
"Genera el JSON de este workflow n8n:

Nodos:
[lista de nodos del step 2]

Requisitos:
- Nombres consistentes: Fetch Data, Call API, Mark Complete
- Credentials como referencias (no keys reales)
- Añadir nodos de debug (Set) entre pasos  críticos
- Error handling con retry 3x
- JSON válido para import en n8n

Export como:
```json
{ ... }
```
"
```

**User:** Revisar JSON generado

---

### Step 4: Deploy via MCP

**Antigravity:**
Usa MCP para crear workflow en n8n:

```
Endpoint: POST http://localhost:3001/workflows
Body: [JSON del step 3]

Retorna:
- Workflow ID
- URL: https://n8n.romensuarez.com/workflow/{id}
```

**Output a user:**
```
✅ Workflow creado:
ID: abc123
URL: https://n8n.romensuarez.com/workflow/abc123
Status: inactive (activar para producción)
```

---

### Step 4.5: Organize Workflow (Carpetas + Tags) 🏷️

> **Referencia completa:** `docs/workflows/organization.md`

Una vez el workflow está creado en n8n, organizarlo correctamente:

#### 4.5.1: Guardar en Carpeta Local

**Determinar carpeta según tipo:**

```bash
# Examples - Workflows comunidad
workflows/examples/
```

**Guardar JSON:**
```bash
# Exportar del MCP
curl http://localhost:3001/workflows/{id} > workflows/[carpeta]/[nombre].json

# Commit
git add workflows/[carpeta]/[nombre].json
git commit -m "feat: add [nombre] workflow"
```

#### 4.5.2: Mover a Carpeta en N8N (Manual)

**En N8N UI:**

1. Abrir workflow recién creado
2. Click "Move to folder"
3. Estructura recomendada:

```
Personal/
├── Core/
│   ├── Logging/
│   └── Utils/
├── Agentes/
│   ├── SEO-Writer/
│   ├── Angie/
│   └── Social-Media/
└── Examples/
```

**Mapeo carpeta local → N8N:**
- `workflows/core/logging/` → `Core/Logging`
- `workflows/agentes/seo-writer/` → `Agentes/SEO-Writer`
- `workflows/examples/` → `Examples`

#### 4.5.3: Asignar Tags (Automático vía API)

**Usar script `n8n_organizer.py`:**

```bash
# Core/Logging workflow
python3 scripts/n8n_organizer.py tag-workflow {WORKFLOW_ID} core subflow logging env:prod

# Agente SEO-Writer
python3 scripts/n8n_organizer.py tag-workflow {WORKFLOW_ID} core niche:content-marketing api env:prod

# Community workflow importado
python3 scripts/n8n_organizer.py tag-workflow {WORKFLOW_ID} community example env:dev
```

**Tags disponibles** (ver completo con `list-tags`):

| Categoría | Tags |
|-----------|------|
| **Tipo** | `core`, `client-facing`, `internal`, `community` |
| **Canal** | `whatsapp`, `email`, `api`, `webhook`, `google-sheets`, `telegram` |
| **Entorno** | `env:dev`, `env:prod` |
| **Nicho** | `niche:inmobiliaria`, `niche:ecommerce`, `niche:content-marketing`, etc. |

**Output esperado:**
```
✅ Tags asignados exitosamente al workflow {ID}:
- core
- api  
- env:prod
- niche:content-marketing

Workflow visible en n8n con tags aplicados.
```

---

## 📚 Documentation

**Documentar workflow:**

Archivo: `docs/workflows/[name]-workflow.md`

```markdown
# [Name] Workflow

## Objetivo
[Qué hace este workflow]

## Trigger
- Tipo: Manual/Cron/Webhook
- Frecuencia: [si aplica]

## Nodos principales
1. [Nodo 1]: [función]
2. [Nodo 2]: [función]
...

## Integraciones
- Google Sheets: [hoja/pestaña]
- API: [endpoint]
- Otros: [servicios]

## Testing
- Test data: [ejemplo]
- Expected output: [resultado esperado]

## n8n URL
https://n8n.romensuarez.com/workflow/{id}

## JSON Version Control
`n8n/workflows/[name].json`
```

---

## ✅ Definition of Done

Antes de considerar workflow completo:

- [ ] Workflow creado vía MCP (no manual en n8n UI)
- [ ] **Organizado correctamente:**
  - [ ] JSON guardado en carpeta local apropiada (`workflows/[tipo]/`)
  - [ ] Workflow movido a carpeta en N8N UI (`Personal/[Tipo]/`)
  - [ ] Tags asignados vía `n8n_organizer.py`
- [ ] Al menos 1 ejecución test exitosa
- [ ] Documentado (según necesidad):
  - [ ] Si es core/agente: `docs/workflows/[nombre]-workflow.md`
  - [ ] Si es example: README breve en carpeta
- [ ] Si es crítico: Activado en n8n (`status: active`)
- [ ] Git commit realizado

---

## 🔄 Update Existing Workflow

**Para modificar workflow existente:**

1. Obtener JSON actual:
   ```
   GET /workflows/{id}
   ```

2. Editar JSON (Antigravity asiste)

3. Actualizar vía MCP:
   ```
   PUT /workflows/{id}
   Body: [JSON modificado]
   ```

4. Test

5. Update JSON en Git

---

## ⚠️ Troubleshooting

### MCP no responde
```
# Verificar service
docker-compose ps | grep mcp

# Restart
docker-compose restart mcp-n8n-builder
```

### Workflow no se crea
```
# Ver logs MCP
docker-compose logs mcp-n8n-builder

# Common issues:
# - JSON inválido → pedir a Antigravity re-generar
# - N8N API key expirada → regenerar en n8n UI
```

### Execution falla
```
# Get execution details
GET /executions/{id}

# Revisar:
# - Input data de cada nodo
# - Error message específico
# - Node que falla

# Antigravity analiza y propone fix
```

*Última actualización: 19 Dic 2025*