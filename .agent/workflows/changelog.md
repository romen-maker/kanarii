---
description: Generate changelog from git history
---

# Workflow: /changelog

**Ejecutar cuando:** Release, fin de sprint, documentar cambios

## Proceso

### 1. Identificar Rango

```
"¿Desde cuándo generar changelog?"

- Desde último tag → git log v1.0.0..HEAD
- Desde fecha → git log --since="2025-01-01"
- Desde commit → git log abc123..HEAD
```

### 2. Extraer Commits

```bash
git log --oneline --no-merges [rango]
```

### 3. Clasificar por Tipo

Basado en Conventional Commits:
- `feat:` → ✨ Features
- `fix:` → 🐛 Bug Fixes
- `docs:` → 📚 Documentation
- `refactor:` → ♻️ Refactoring
- `test:` → 🧪 Tests
- `chore:` → 🔧 Maintenance

### 4. Generar CHANGELOG

```markdown
# Changelog

## [v1.1.0] - 2025-12-16

### ✨ Features
- Añadido ContentGenerator con productos dinámicos (#123)
- Nuevo endpoint /publish/index (#125)

### 🐛 Bug Fixes
- Corregido template_type forzado a guide (#127)

### 📚 Documentation
- Actualizado roadmap con Sprint 5A/5B (#128)

### ♻️ Refactoring
- Reorganizado structure de workflows
```

### 5. Sugerir Versión

```
Basándome en los cambios:
- 3 features nuevos
- 1 fix
- 0 breaking changes

Sugiero: v1.1.0 (minor bump)

¿Aceptas o prefieres otra versión?
```

## Output

- `CHANGELOG.md` actualizado
- Sugerencia de versión semver

## Ejemplo

```
User: /changelog

Agent:
"Analizando commits desde v1.0.0...

Encontrados:
- 5 feat commits
- 2 fix commits
- 3 docs commits

Generando changelog...

Versión sugerida: v1.1.0

¿Lo añado a CHANGELOG.md?"
```
