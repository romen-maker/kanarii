#!/bin/bash
# inventory-check.sh — Verifica código existente antes de crear task file o planificar sprint
# Uso: bash scripts/agent/inventory-check.sh "palabras clave separadas por espacio"
# Ejemplo: bash scripts/agent/inventory-check.sh "timeline propuesta respuesta modal"
#
# Propósito: Evitar que se describan tareas como "no implementadas" cuando ya existen.
# Ejecutar ANTES de redactar el scope en .agents/tasks/task-XXX.md
# y ANTES de añadir una tarea al sprint (paso 2c de sprint-planning).

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
KEYWORDS="$*"

if [ -z "$KEYWORDS" ]; then
  echo "❌ Uso: bash scripts/agent/inventory-check.sh \"keywords de la tarea\""
  echo "   Ejemplo: bash scripts/agent/inventory-check.sh \"timeline propuesta respuesta\""
  exit 1
fi

echo "=== INVENTORY CHECK ==="
echo "Palabras clave: $KEYWORDS"
echo "Directorio: $ROOT/src"
echo ""

FOUND_COUNT=0

# 1. Buscar archivos cuyo NOMBRE contiene alguna keyword (más barato que grep de contenido)
echo "📁 Archivos cuyo nombre coincide:"
for keyword in $KEYWORDS; do
  MATCHES=$(find "$ROOT/src" -type f \( -name "*.ts" -o -name "*.tsx" \) \
    -iname "*${keyword}*" 2>/dev/null | head -5 || true)
  if [ -n "$MATCHES" ]; then
    while IFS= read -r f; do
      KB=$(wc -c < "$f" 2>/dev/null | awk '{printf "%.1f", $1/1024}')
      FLAG="new"
      [ "$(wc -c < "$f" 2>/dev/null)" -gt 3072 ] && FLAG="⚠️  EXISTE (${KB}KB)"
      echo "    ↳ ${f#$ROOT/}  [$FLAG]"
      FOUND_COUNT=$((FOUND_COUNT + 1))
    done <<< "$MATCHES"
  fi
done
[ $FOUND_COUNT -eq 0 ] && echo "    (sin coincidencias por nombre)"

# 2. Buscar archivos cuyo CONTENIDO menciona las keywords (grep, limitado a 5 por keyword)
echo ""
echo "🔍 Archivos que contienen las keywords en su código:"
for keyword in $KEYWORDS; do
  MATCHES=$(grep -rl -i "$keyword" "$ROOT/src" --include="*.ts" --include="*.tsx" \
    2>/dev/null | head -5 || true)
  if [ -n "$MATCHES" ]; then
    echo "  '$keyword':"
    while IFS= read -r f; do
      KB=$(wc -c < "$f" 2>/dev/null | awk '{printf "%.1f", $1/1024}')
      FLAG=""
      [ "$(wc -c < "$f" 2>/dev/null)" -gt 3072 ] && FLAG="  ⚠️  ${KB}KB — no recrear"
      echo "    ↳ ${f#$ROOT/}${FLAG}"
      FOUND_COUNT=$((FOUND_COUNT + 1))
    done <<< "$MATCHES"
  fi
done

# 3. Buscar interfaces/tipos en _types.ts
echo ""
echo "📄 Tipos relacionados en _types.ts:"
TYPES_FILE="$ROOT/src/lib/services/_types.ts"
if [ -f "$TYPES_FILE" ]; then
  for keyword in $KEYWORDS; do
    MATCHES=$(grep -i "$keyword" "$TYPES_FILE" 2>/dev/null | head -3 || true)
    if [ -n "$MATCHES" ]; then
      echo "  '$keyword':"
      echo "$MATCHES" | sed 's|^|    ↳ |'
      FOUND_COUNT=$((FOUND_COUNT + 1))
    fi
  done
  [ $FOUND_COUNT -eq 0 ] && echo "    (sin tipos relacionados)"
else
  echo "    (_types.ts no encontrado)"
fi

# 4. Hooks relacionados
echo ""
echo "🪝 Hooks relacionados en src/hooks:"
if [ -d "$ROOT/src/hooks" ]; then
  KEYWORD_PATTERN=$(echo "$KEYWORDS" | tr ' ' '\|')
  MATCHES=$(grep -rl -i "$KEYWORD_PATTERN" "$ROOT/src/hooks" --include="*.ts" \
    2>/dev/null | head -5 || true)
  if [ -n "$MATCHES" ]; then
    echo "$MATCHES" | sed "s|$ROOT/||" | sed 's|^|    ↳ |'
    FOUND_COUNT=$((FOUND_COUNT + 1))
  else
    echo "    (ninguno)"
  fi
else
  echo "    (src/hooks no existe)"
fi

echo ""
echo "=== FIN INVENTORY CHECK ==="
echo ""

if [ $FOUND_COUNT -gt 0 ]; then
  echo "⚠️  Se encontraron coincidencias. ANTES de escribir el task file o añadir al sprint:"
  echo "   1. Lee los archivos marcados con ⚠️  — contienen código existente relevante."
  echo "   2. En el task file, añade una sección '## Código existente detectado' con lo que ya hay."
  echo "   3. Describe SOLO lo que FALTA, no lo que ya está implementado."
  echo "   4. Si el scope ya está >50% cubierto → consulta con el usuario antes de planificar."
else
  echo "✅ Sin coincidencias. Puedes describir la tarea desde cero."
fi
