#!/bin/bash
# check-inbox.sh — Detecta entradas pendientes en external-inbox/ e idea-inbox/
# Uso: bash scripts/agent/check-inbox.sh
# Salida: siempre exit 0 (no es bloqueante)

EXTERNAL_DIR="external-inbox"
IDEA_DIR="docs/idea-inbox"
TEMPLATE="TEMPLATE.manifest.md"

echo "=== INBOX STATUS ==="

# --- external-inbox ---
ext_manifests=$(find "$EXTERNAL_DIR" -type f -name "*.manifest.md" 2>/dev/null \
  | grep -v "$TEMPLATE" | sort)
ext_count=$(echo "$ext_manifests" | grep -c . 2>/dev/null || echo 0)
[ -z "$ext_manifests" ] && ext_count=0

if [ "$ext_count" -eq 0 ]; then
  echo "EXTERNAL_INBOX: vacío"
else
  echo "EXTERNAL_INBOX: $ext_count manifiesto(s)"
  echo "$ext_manifests" | while read -r f; do
    priority=$(grep -i "^## Prioridad" -A1 "$f" 2>/dev/null | tail -1 | xargs)
    echo "  → $f [Prioridad: ${priority:-desconocida}]"
  done
fi

echo ""

# --- idea-inbox ---
ideas=$(find "$IDEA_DIR" -type f -name "*.md" 2>/dev/null | sort)
idea_count=$(echo "$ideas" | grep -c . 2>/dev/null || echo 0)
[ -z "$ideas" ] && idea_count=0

if [ "$idea_count" -eq 0 ]; then
  echo "IDEA_INBOX: vacío"
else
  echo "IDEA_INBOX: $idea_count archivo(s)"
  echo "$ideas" | while read -r f; do echo "  → $f"; done
fi