---
description: Audit code for security vulnerabilities
---

# Workflow: /security-audit

**Ejecutar cuando:** Periódicamente (cada sprint), antes de release

## Proceso

### 1. Scope de Auditoría

```
"Áreas a revisar:"

1. HTML generado por LLM → XSS
2. Inputs de usuario → Injection
3. Secrets management → Hardcoded keys
4. Dependencias → CVEs conocidas
```

### 2. Escaneo XSS (Crítico para KanAIrOS)

**Verificar en templates Jinja2:**
```python
# ❌ VULNERABLE:
{{ content | safe }}  # Si content viene de LLM

# ✅ SEGURO:
{{ content | e }}  # Escape HTML
{{ content | striptags }}  # Remover tags
```

**Verificar sanitización de output LLM:**
```python
# ¿El ContentGenerator sanitiza antes de guardar?
import bleach
clean_html = bleach.clean(llm_output, tags=ALLOWED_TAGS)
```

### 3. Escaneo de Secrets

```bash
# Buscar patterns de API keys
grep -r "sk-" --include="*.py" .
grep -r "API_KEY.*=" --include="*.py" .
```

**Verificar:**
- [ ] Todas las keys vienen de os.getenv()
- [ ] No hay secrets en código
- [ ] .env está en .gitignore

### 4. Dependencias

```bash
# Revisar vulnerabilidades
pip-audit
# o
safety check
```

### 5. Generar Report

```markdown
# Security Audit - {fecha}

## XSS
- [ ] Templates sanitizados
- [ ] Outputs LLM escapados

## Secrets
- [ ] Sin hardcoded keys
- [ ] .env protegido

## Dependencies
- CVEs encontradas: X
- Acciones: [lista]

## Recomendaciones
1. ...
```

## Output

- `docs/security/audit_{fecha}.md`
- Lista de vulnerabilidades
- Acciones recomendadas

## Ejemplo

```
User: /security-audit

Agent:
"Ejecutando auditoría de seguridad...

🔴 CRÍTICO:
- templates/comparison.html:45 usa {{ content | safe }}
  → Riesgo XSS si content viene de LLM

🟡 MEDIO:
- 2 dependencias con CVEs menores

🟢 OK:
- No hay secrets hardcodeados
- .env en .gitignore

¿Genero report completo?"
```
