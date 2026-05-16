---
description: Complete feature branch using Definition of Done checklist
---

# Workflow: /feature-complete - Completar Feature Branch

**Ejecutar cuando:** Feature branch está lista para merge a main

## Proceso Completo

### 1. Leer Definition of Done

Leer `.agents/DEFINITION_OF_DONE.md` completo

### 2. Ejecutar Checklist

#### ✅ Code Quality
- [ ] Código funciona correctamente
- [ ] No hay debug code (console.log, print statements de debug)
- [ ] No hay comentarios TODO sin issue asociado
- [ ] Código sigue convenciones del proyecto

#### ✅ Tests
- [ ] **CRITICAL:** ¿Hay tests unitarios para la nueva funcionalidad?
  
**Si NO hay tests:**
```
"⚠️ Detecto que NO hay tests para [funcionalidad nueva].

Propongo crear:
1. test_[nombre]_success() - Happy path
2. test_[nombre]_error_handling() - Edge cases

¿Los creo ahora antes de mergear? (Recomendado)
O podemos mergear y crear tests después (solo si es MVP urgente)"
```

**Si SÍ hay tests:**
```bash
# Ejecutar tests
pytest tests/ -v
```

- [ ] Tests pasan correctamente
- [ ] Coverage aceptable (>70% para producción, >50% OK para MVP)

#### ✅ Documentation
- [ ] ROADMAP actualizado (tarea marcada como completada)
- [ ] DECISIONS documentadas (si hay decisiones arquitectónicas)
- [ ] Infrastructure docs actualizados (si hay cambios de infra)
- [ ] Workflows updates (si hay nuevos flujos)

#### ✅ Git Hygiene
- [ ] Commits tienen mensajes descriptivos
- [ ] Branch name sigue convención (feat/, fix/, docs/, etc.)
- [ ] No hay archivos innecesarios (logs, .env, etc.)

### 3. Pre-Merge Checks

```bash
# Asegurarse de que branch está actualizada con main
git checkout main
git pull origin main
git checkout [feature-branch]
git merge main

# Resolver conflictos si hay
```

### 4. Merge to Main

**Recordar al usuario:**
```
⚠️ IMPORTANTE: main auto-despliega a producción

¿Estás seguro de que todo está listo?
- ✅ Tests pasan
- ✅ Documentación actualizada
- ✅ No hay trabajo en progreso

Si estás listo, ejecuto:
```bash
git checkout main
git merge [feature-branch] --no-ff -m "Merge [feature]: [descripción]"
git push origin main
```

Esto desplegará a producción automáticamente vía Coolify.

¿Procedo con el merge?"
```

### 5. Post-Merge Cleanup

```bash
# Eliminar branch local
git branch -d [feature-branch]

# Eliminar branch remota (opcional)
git push origin --delete [feature-branch]
```

### 6. Verificar Deploy

```
"Merge completado. ✅

Ahora verificar deploy en producción:
1. Esperar ~2-3 min (build + deploy en Coolify)
2. Verificar en https://api.romensuarez.com/health
3. Verificar en Sentry que no hay errores nuevos

¿Quieres que monitoree el deploy?"
```

## Ejemplo Completo

```
User: /feature-complete

Agent:
"Revisando feature branch feat/content-generator..."

📋 Definition of Done Checklist:

✅ Code Quality
  - Código funciona ✅
  - No debug code ✅
  - Convenciones del proyecto ✅

⚠️ Tests
  - Hay tests unitarios ❌
  
⚠️ Detecto que falta test para ContentGenerator.generate_article()

Propongo crear:
1. test_generate_article_success()
2. test_generate_article_invalid_keyword()

¿Los creo ahora? (Recomendado antes de mergear)

✅ Documentation
  - ROADMAP actualizado ✅
  - No hay decisiones arquitectónicas nuevas ✅

✅ Git
  - Commits descriptivos ✅
  - Branch name correcto (feat/) ✅

Resumen: 3/4 secciones OK. Falta tests.
¿Cómo procedo?"
```

## Branch Naming Reference

| Prefix | Use Case | Example |
|--------|----------|---------|
| `feat/` | New features | `feat/publisher-agent` |
| `fix/` | Bug fixes | `fix/callback-timeout` |
| `docs/` | Documentation only | `docs/workflow-readme` |
| `refactor/` | Code improvements | `refactor/api-cleanup` |
| `chore/` | Maintenance | `chore/update-deps` |

## Archivos a Leer

- `.agents/DEFINITION_OF_DONE.md`
- `docs/roadmap.md` (verificar actualización)
- `tests/` (verificar cobertura)

## Archivos a Modificar

- `docs/roadmap.md` (marcar tarea como completada)
- `tests/test_*.py` (si creas tests nuevos)

## Siguiente Workflow

Después de merge exitoso:
```
- /notion-sync → Sincronizar sprint con Notion (cerrar tareas)
- /roadmap → Ver próxima tarea
- /start → Re-contextualizar para nueva tarea
```

## 7. Sincronizar con Notion (Opcional)

Después del merge, preguntar:
```
"✅ Merge completado exitosamente.

¿Quieres sincronizar este sprint con Notion?
- Esto creará/actualizará las tareas en tu DB de Tareas
- Las marcará como completadas (Listo)

Ejecutar: /notion-sync (o 'no' para omitir)"
```

Si el usuario acepta, ejecutar:
```bash
python scripts/notion_sync.py close --sprint [N]
```

## ✅ Verificación de Estructura del Proyecto

**IMPORTANTE:** Verificar manualmente que la estructura cumple con `docs/PROJECT_STRUCTURE.md`.

### Checklist de Estructura

- [ ] ¿Están los workflows de n8n en `workflows/n8n/`?
- [ ] ¿Están los scripts en `infrastructure/scripts/`?
- [ ] ¿Están los documentos en `docs/`?
- [ ] ¿Se han evitado ubicaciones legacy (api/, templates/) para código nuevo?

**Nota:** Si encuentras archivos fuera de lugar que NO rompen código (ej: docs sueltos), muévelos. Si rompen código (ej: api/), déjalos y anota en backlog.
