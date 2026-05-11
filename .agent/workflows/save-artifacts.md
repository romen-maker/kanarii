---
description: Save current session artifacts to repo
---

# Workflow: /save-artifacts - Guardar Artefactos en Repo

**Ejecutar cuando:** Al final de una sesión productiva o cuando quieras persistir el trabajo.

## ¿Por qué este workflow?

Los artifacts de Antigravity (`task.md`, `implementation_plan.md`, `walkthrough.md`) se guardan en:
```
~/.gemini/antigravity/brain/[id-conversación]/
```

Esta carpeta es **temporal** y no forma parte del repo. Para persistir artifacts útiles, hay que copiarlos.

## Acciones

1. **Identificar proyecto activo:**
   - ¿En qué proyecto estamos? (kanairos, client_tds, global)

2. **Revisar artifacts de la sesión:**
   - Listar artifacts generados en esta conversación
   - Decidir cuáles son útiles para persistir

3. **Copiar a la carpeta del proyecto (solo si el usuario lo especifica):**
   ```
   Destino: projects/[proyecto]/.agent/artifacts/
   
   Ejemplos:
   - projects/kanairos/.agent/artifacts/task_lists/task_2025-12-15.md
   - projects/kanairos/.agent/artifacts/walkthroughs/walkthrough_content_generator.md
   ```

4. **Para artifacts globales:**
   ```
   Destino: .agent/artifacts/[capeta_correspondiente] (revisa las carpetas que hay y elige las oportunas)
   ```

5. **Commit si procede:**
   ```bash
   git add .agent/artifacts/ projects/*/. agent/artifacts/
   git commit -m "docs: save session artifacts [fecha]"
   ```

## Ejemplo de Uso

```
User: /save-artifacts

Agent:
📦 Artifacts de esta sesión:
- task.md (checklist de estructuración)
- implementation_plan.md (plan multi-contexto)

¿Dónde los guardo?
1. projects/kanairos/.agent/artifacts/ (recomendado)
2. .agent/artifacts/ (global)
3. No guardar

[Usuario elige 1]

✅ Copiado a projects/kanairos/.agent/artifacts/
   - restructuring_plan_2025-12-15.md

¿Hago commit? (s/n)
```

## Estructura de Artifacts

```
.agent/artifacts/                    ← Artifacts globales
projects/kanairos/.agent/artifacts/  ← Artifacts de KanAIrOS
projects/client_tds/.agent/artifacts/ ← Artifacts de TDS
```

## Nomenclatura Sugerida

```
[tipo]_[descripcion]_[fecha].md

Ejemplos:
- plan_multicontexto_2025-12-15.md
- walkthrough_content_generator_2025-12-15.md
- task_sprint2_2025-12-15.md
```
