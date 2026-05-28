#!/bin/bash
# close-task.sh — Commit atómico de cierre de tarea
# Uso: bash scripts/agent/close-task.sh
# El script deriva TASK_ID y mensaje del nombre de la rama activa.
# Formato de rama esperado: feat/T-026-descripcion-de-la-tarea
# PREREQUISITO: El agente ya editó sprint-XX.md y task-XXX.md antes de llamar a este script.

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
BRANCH=$(git -C "$ROOT" branch --show-current)

# Derivar TASK_NUM desde la rama (feat/T-026-... → 026)
TASK_NUM=$(echo "$BRANCH" | grep -oP '(?<=T-)\d+')
if [ -z "$TASK_NUM" ]; then
  echo "❌ No se puede derivar el TASK_ID desde la rama: $BRANCH"
  echo "   Formato esperado: feat/T-026-descripcion"
  exit 1
fi
TASK_ID="T-${TASK_NUM}"

# Derivar mensaje desde la rama (feat/T-026-marketplace-acuerdo-detail → feat: marketplace acuerdo detail (T-026))
SCOPE=$(echo "$BRANCH" | sed "s|feat/T-${TASK_NUM}-||" | tr '-' ' ')
MESSAGE="feat: ${SCOPE}(${TASK_ID})"

TASK_FILE="$ROOT/.agents/tasks/task-${TASK_NUM}.md"
ARCHIVE_DIR="$ROOT/.agents/tasks/_archived"
LOCK="$ROOT/.agent-session.lock"

echo "🔄 Cerrando $TASK_ID desde rama $BRANCH..."

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
echo "   Rama: $BRANCH"
echo "   Siguiente paso: merge a main o iniciar nueva tarea con /session-start"
