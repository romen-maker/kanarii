#!/bin/bash
# close-task.sh — Commit atómico de cierre de tarea
# Uso: bash scripts/agent/close-task.sh T-025 "feat(calendario): permisos eventos"
# PREREQUISITO: El agente ya editó sprint-XX.md y task-XXX.md antes de llamar a este script.

set -euo pipefail

TASK_ID="${1:?Uso: close-task.sh <TASK_ID> '<mensaje de commit>'}"
MESSAGE="${2:?Falta el mensaje de commit}"
ROOT="$(git rev-parse --show-toplevel)"

# Acepta tanto 'T-025' como '025'
TASK_NUM="${TASK_ID#T-}"
TASK_FILE="$ROOT/.agents/tasks/task-${TASK_NUM}.md"
ARCHIVE_DIR="$ROOT/.agents/tasks/_archived"
LOCK="$ROOT/.agent-session.lock"

echo "🔄 Cerrando $TASK_ID..."

# 1. Verificar que el task file existe
if [ ! -f "$TASK_FILE" ]; then
  echo "❌ No encontrado: $TASK_FILE"
  echo "   Verifica que el task file existe y no fue archivado ya."
  exit 1
fi

# 2. Stage de todo lo modificado (código + docs ya editados por el agente)
git -C "$ROOT" add -A

# 3. Verificar que hay algo que commitear
if git -C "$ROOT" diff --cached --quiet; then
  echo "❌ Nada en stage. ¿Ya está todo commitado?"
  exit 1
fi

# 4. Archivar task file (git mv preserva historial)
mkdir -p "$ARCHIVE_DIR"
git -C "$ROOT" mv "$TASK_FILE" "$ARCHIVE_DIR/"
echo "📦 Task file archivado en _archived/"

# 5. Commit atómico único
git -C "$ROOT" commit -m "$MESSAGE"
echo "✅ Commit realizado: $MESSAGE"

# 6. Limpiar lock si existe
if [ -f "$LOCK" ]; then
  rm "$LOCK"
  echo "🔓 Lock eliminado"
fi

echo ""
echo "✅ $TASK_ID cerrada correctamente."
echo "   Rama: $(git -C "$ROOT" branch --show-current)"
echo "   Siguiente paso: merge a main o iniciar nueva tarea con /session-start"
