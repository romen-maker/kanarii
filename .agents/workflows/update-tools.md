---
description: Document new tool or service in project context
---

# Workflow: /update-tools

**Ejecutar cuando:** Se añade una herramienta/servicio nuevo que debe documentarse

## Paso 1: Identificar Tipo de Herramienta

Usuario especifica:
- **Nombre:** [nombre de la herramienta]
- **Tipo:** Infrastructure / External Service / Internal Tool / Premium
- **¿Qué hace?:** [descripción en 1 línea]
- **Documentación:** [path al README, si existe]

## Paso 2: Determinar Archivo de Destino

### A. Infrastructure (`infrastructure.md`)

**Actualizar si:**
- Es infraestructura desplegada (servidor, contenedor, base de datos)
- Es un sistema interno (MinIO, PostgreSQL, Coolify)
- Es una integración a nivel de plataforma (N8N MCP, Google APIs)
- Es una herramienta interna del proyecto (Prompt Lab, SEO Generator)

**Ejemplos:**
- Nuevo contenedor Docker
- Nueva base de datos en PostgreSQL
- Nuevo subdominio DNS
- Nueva integración MCP
- Herramienta UI interna (Streamlit app, etc.)

---

### B. Services (`services.md`)

**Actualizar si:**
- Es un servicio externo/SaaS (OpenRouter, Sentry, Cloudflare R2)
- Requiere API key o credenciales externas
- Es un proveedor cloud/third-party
- Tiene API REST/GraphQL que consumimos

**Ejemplos:**
- Nueva API de LLM
- Servicio de monitoring
- CDN o storage externo
- Webhook de terceros

---

### C. User Premium Tools (`user_premium_tools.md`)

**Actualizar si:**
- Es herramienta premium del usuario (Perplexity Pro, Claude Pro, etc.)
- Requiere cuenta personal del usuario
- No es parte del stack oficial del proyecto  
- Se usa para tareas específicas (investigación, diseño, etc.)

**Ejemplos:**
- Perplexity Pro para research
- Claude Pro para análisis complejo
- Figma Pro para diseño
- GitHub Copilot

---

## Paso 3: Formato de Entrada

### Para `infrastructure.md`

Si es **herramienta interna:**

```markdown
### [NOMBRE_HERRAMIENTA]

**¿Qué hace?** [Descripción breve]

**Cuándo usar:**
- Caso de uso 1
- Caso de uso 2

**Documentación:** `[path/to/README.md]`

**Quickstart:**
```bash
[comando principal]
```
```

Si es **infraestructura desplegada:**

```markdown
## 🔧 [NOMBRE_SERVICIO]

**URL:** https://[subdominio].romensuarez.com
**Puerto:** [puerto]
**Contenedor:** [nombre-contenedor-id]

### Configuración
- [Detalles de config]

### Credenciales
- [Info de acceso]
```

---

### Para `services.md`

```markdown
### [NOMBRE_SERVICIO]

- **URL:** https://[url]
- **API Key:** Variable `[ENV_VAR_NAME]`
- **Uso:** [Para qué lo usamos]
- **Documentación:** `[path/to/internal/README.md]` o [Link oficial si no tenemos doc interna]
```

**IMPORTANTE:** Preferir link a README interno del proyecto. Si no existe, crearlo primero.

---

### Para `user_premium_tools.md`

```markdown
### [NOMBRE_TOOL]

**¿Qué hace?** [Descripción]

**Cuándo delegar:**
- [Casos donde pedirle al usuario que lo use]

**Cuándo NO delegar:**
- Análisis de código del proyecto
- Decisiones de arquitectura
```

---

## Paso 4: Validar o Crear README

**Antes de actualizar archivos de contexto:**

1. **Verificar si existe README:**
   ```bash
   # Para herramientas internas
   ls [carpeta-herramienta]/README.md
   
   # Para servicios externos con integration
   ls agents/integrations/[nombre]/README.md
   ```

2. **Si NO existe, crearlo:**
   
   **Ubicación:**
   - Herramienta interna: `[carpeta-tool]/README.md`
   - Integración externa: `agents/integrations/[nombre]/README.md`
   - Documentación general: `docs/integrations/[nombre].md`
   
   **Template README mínimo:**
   ```markdown
   # [Nombre Herramienta]
   
   ## ¿Qué hace?
   
   [Descripción breve]
   
   ## Instalación/Setup
   
   ```bash
   [Comandos necesarios]
   ```
   
   ## Uso
   
   ### Básico
   ```bash
   [Ejemplo básico]
   ```
   
   ### Avanzado
   [Casos de uso específicos]
   
   ## Configuración
   
   Variables de entorno requeridas:
   ```env
   VAR_NAME=value
   ```
   
   ## Enlaces
   
   - [Documentación oficial](url)
   - [API Reference](url)
   ```

3. **Añadir info esencial al README:**
   - Métodos de acceso
   - Autenticación
   - Ejemplos de uso
   - Troubleshooting común

---

## Paso 5: Actualizar Archivo de Contexto

1. Leer archivo actual
2. Determinar sección correcta (mantener organización)
3. Insertar nueva entrada con formato apropiado
4. Mantener orden alfabético o lógico (según sección)
5. Actualizar fecha al final: `*Última actualización: [FECHA]*`

---

## Paso 6: Commit

```bash
# Si creaste README
git add [path/to/README.md]

# Archivo de contexto actualizado
git add .agents/context/[archivo].md

git commit -m "docs: add [TOOL_NAME] to stack

- Added to [infrastructure/services/user_premium_tools]
- Created README at [path] (if applicable)"
```

---

## 📋 Validaciones

- [ ] Determinado archivo correcto (infrastructure/services/user_premium_tools)
- [ ] README existe O fue creado
- [ ] Entrada no duplica contenido de README
- [ ] Link a README es accesible
- [ ] Formato consistente con otras entradas
- [ ] Fecha actualizada al final del archivo

---

## Ejemplo Completo

```
User: "Ejecuta /update-tools - Añadí Prompt Lab"

Agent:
"Voy a documentar Prompt Lab.

📝 Identificando tipo...
Tipo: Internal Tool
Archivo destino: infrastructure.md
Sección: 🛠️ Integraciones y APIs disponibles

✓ README existe: apps/prompt_lab/README.md

Añadiendo entrada:

---

### Prompt Lab

**¿Qué hace?** UI para testear y comparar prompts con múltiples LLMs simultáneamente

**Cuándo usar:**
- Comparar respuestas de diferentes modelos
- Optimizar prompts antes de producción
- Experimentar con system prompts y parámetros

**Documentación:** `apps/prompt_lab/README.md`

**Quickstart:**
```bash
streamlit run apps/prompt_lab/app.py
# Acceder: http://localhost:8501
```

---

✅ Añadido a .agents/context/infrastructure.md
✅ Fecha actualizada: 18 Dic 2025

¿Hago commit?"
```

---

## 📂 Archivos que Modifica

| Archivo | Cuándo Actualizar |
|---------|-------------------|
| `.agents/context/infrastructure.md` | Infra desplegada / Herramientas internas |
| `.agents/context/services.md` | APIs externas / SaaS / Proveedores cloud |
| `.agents/context/user_premium_tools.md` | Tools premium personales del usuario |
| `[carpeta]/README.md` | Si no existe, crearlo primero |

---

## ⚠️ Recordatorios

- **NO actualizar `/list-tools`** - ese workflow es informativo, no se edita
- **SÍ actualizar archivos de contexto** - son la fuente de verdad del stack
- **README primero** - Si no hay README, crearlo antes de referenciar
- **Mantener DRY** - Solo referencias en context/, detalles en README
