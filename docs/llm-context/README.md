# docs/llm-context/

Carpeta para digests de contexto LLM generados bajo demanda por `generate-digest.sh`.

## Qué son

Archivos de texto compactos que contienen el árbol de directorios y el contenido
de una zona del repo (`src/components/propuestas/`, `src/hooks/`, etc.).
Sirven para dar contexto panorámico al agente **antes de redactar un task file**,
cuando `inventory-check.sh` detecta señal de complejidad alta (SIGNAL ≥ 2).

## Formato del nombre

```
kanarii_YYYYMMDD_<rama>_<sha7>_<slug-del-commit>.txt
```

Ejemplo:
```
kanarii_20260529_main_a3f7c2b_fix-auth-roles.txt
         │        │     │         │
       fecha    rama  SHA corto   primera línea del commit (máx 40 chars)
```

## Cómo se generan

```bash
# Directo:
bash scripts/agent/generate-digest.sh --filter src/components/propuestas

# Automático (cuando inventory-check detecta SIGNAL >= 2):
bash scripts/agent/inventory-check.sh "propuesta respuesta modal"
```

## Reglas de uso

- **No son fuentes de verdad.** El firewall determinista es `test -f` en `session-start`.
- **No se versionan** — `.gitignore` excluye `*.txt` en esta carpeta.
- **Solo `.gitkeep` y este `README.md` se incluyen en Git.**
- Caducan con cada commit relevante. Regenerar si el SHA ha cambiado.
- Úsalos para redactar la sección `## Código existente detectado` del task file.

## Flujo de decisión

```
inventory-check.sh
    │
    ├── SIGNAL < 2  → ⚠️  aviso manual, sin digest
    │
    └── SIGNAL ≥ 2  → genera digest
            │
            ├── HOT_FOLDER detectada → digest de src/components/propuestas/
            └── sin HOT_FOLDER      → digest de src/ sin tests/stories
                    │
                    └── docs/llm-context/kanarii_fecha_rama_sha_commit.txt
                            │
                            └── agente redacta task file con
                                "## Código existente detectado"
```
