#!/bin/bash
# close-sprint.sh — Archiva un sprint completado en docs/sprints/_archived/
# Uso: bash scripts/agent/close-sprint.sh sprint-07
#
# Solo archiva si TODAS las tareas del sprint están marcadas como ✅ o 🟢 Completada.
# Archiva también el archivo -research.md si existe.
# No hace commit — el commit lo gestiona close-task.sh o el agente manualmente.
#
# PREREQUISITO: El sprint-XX.md ya tiene estado "✅ Completado" en la sección ## Estado.

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
SPRINTS_DIR="$ROOT/docs/sprints"
ARCHIVE_DIR="$ROOT/docs/sprints/_archived"

# --- Validar argumento ---
if [ -z "${1:-}" ]; then
  echo "❌ Uso: bash scripts/agent/close-sprint.sh <nombre-sprint>"
  echo "   Ejemplo: bash scripts/agent/close-sprint.sh sprint-07"
  exit 1
fi

SPRINT_NAME="$1"
SPRINT_FILE="$SPRINTS_DIR/${SPRINT_NAME}.md"

if [ ! -f "$SPRINT_FILE" ]; then
  echo "❌ No encontrado: $SPRINT_FILE"
  echo "   Verifica que el archivo existe y no fue archivado ya."
  exit 1
fi

# --- Verificar que el sprint está completado antes de archivar ---
TOTAL=$(grep -c "^| T-" "$SPRINT_FILE" 2>/dev/null || echo "0")
DONE=$(grep "^| T-" "$SPRINT_FILE" 2>/dev/null | grep -cE "✅|🟢 Completada" || echo "0")

if [ "$TOTAL" -eq 0 ]; then
  echo "⚠️  No se encontraron tareas (filas | T-XXX |) en $SPRINT_NAME."
  echo "   Verifica el formato del archivo antes de archivar."
  exit 1
fi

if [ "$DONE" -lt "$TOTAL" ]; then
  echo "⚠️  Sprint incompleto: $DONE/$TOTAL tareas completadas."
  echo "   Solo archiva sprints donde TODAS las tareas estén en ✅ o 🟢 Completada."
  echo "   Si quieres forzar el archivado, usa: FORCE=1 bash scripts/agent/close-sprint.sh $SPRINT_NAME"
  [ "${FORCE:-0}" != "1" ] && exit 1
  echo "   ⚠️  FORCE=1 activo — archivando de todas formas."
fi

# --- Archivar ---
mkdir -p "$ARCHIVE_DIR"
git -C "$ROOT" mv "$SPRINT_FILE" "$ARCHIVE_DIR/"
echo "📦 Archivado: $SPRINT_NAME.md → docs/sprints/_archived/"

# Archivar también el research file si existe
RESEARCH_FILE="$SPRINTS_DIR/${SPRINT_NAME}-research.md"
if [ -f "$RESEARCH_FILE" ]; then
  git -C "$ROOT" mv "$RESEARCH_FILE" "$ARCHIVE_DIR/"
  echo "📦 Archivado: ${SPRINT_NAME}-research.md → docs/sprints/_archived/"
fi

echo ""
echo "✅ $SPRINT_NAME archivado correctamente ($DONE/$TOTAL tareas ✅)."
echo "   Siguiente paso: commitea con 'git commit -m \"chore: archive $SPRINT_NAME\"'"
echo "   O deja que close-task.sh incluya este cambio en su commit atómico."
