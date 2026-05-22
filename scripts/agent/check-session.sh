#!/bin/bash
# check-session.sh — Detecta si hay una sesión de Antigravity abierta.
# Uso: bash scripts/agent/check-session.sh
# Salida:
#   exit 0 + "NO_ACTIVE_SESSION" → no hay sesión abierta, seguro proceder
#   exit 1 + JSON del lock       → hay sesión sin cerrar, activar Modo Rescate

LOCK_FILE=".agent-session.lock"

if [ -f "$LOCK_FILE" ]; then
  # Verificar que el archivo no es la plantilla comentada (status = "template")
  STATUS=$(grep -o '"status"[[:space:]]*:[[:space:]]*"[^"]*"' "$LOCK_FILE" | grep -o '"[^"]*"$' | tr -d '"')
  if [ "$STATUS" = "template" ] || [ -z "$STATUS" ]; then
    echo "NO_ACTIVE_SESSION"
    exit 0
  fi
  cat "$LOCK_FILE"
  exit 1
else
  echo "NO_ACTIVE_SESSION"
  exit 0
fi
