#!/bin/bash
# check-lazy-planning.sh — Verifica violaciones de lazy-planning en la sesión activa
# Uso: bash scripts/agent/check-lazy-planning.sh
#
# Este script ayuda al usuario a detectar si el agente leyó archivos de código
# fuente antes de recibir aprobación en /session-start.
#
# Lo que verifica:
#   1. Si el plan aprobado declara "Ninguno" en el campo de auditoría
#   2. Si el git log de la sesión muestra lecturas de src/ o lib/ antes del lock
#
# Interpretación:
#   - VIOLACIÓN SIMPLE:  el agente leyó archivos sin declararlo en el checkpoint
#   - VIOLACIÓN DOBLE:   el campo en Fase 3.5 difiere del checkpoint de Fase 2.5

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
LOCK="$ROOT/.agent-session.lock"
IMPLEMENTATION_PLAN="$ROOT/implementation_plan.md"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CHECK LAZY-PLANNING — Kanarii"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Verificar si hay sesión activa
if [ ! -f "$LOCK" ]; then
  echo "ℹ️  No hay sesión activa (.agent-session.lock no encontrado)."
  echo "   Este script es útil durante o justo después de /session-start."
  echo ""
else
  echo "🔒 Sesión activa detectada:"
  cat "$LOCK"
  echo ""
fi

# 2. Buscar campo de auditoría en implementation_plan.md
if [ -f "$IMPLEMENTATION_PLAN" ]; then
  echo "📋 Campo de auditoría encontrado en implementation_plan.md:"
  echo "---"
  grep -A 5 "ARCHIVOS LEÍDOS" "$IMPLEMENTATION_PLAN" 2>/dev/null || echo "   (campo no encontrado)"
  echo "---"
  echo ""
else
  echo "⚠️  implementation_plan.md no encontrado."
  echo "   El agente puede no haber generado el plan todavía."
  echo ""
fi

# 3. Revisar rama activa y commits recientes
BRANCH=$(git -C "$ROOT" branch --show-current)
echo "🌿 Rama activa: $BRANCH"
echo ""
echo "📜 Últimos 5 commits en esta rama:"
git -C "$ROOT" log -5 --oneline
echo ""

# 4. Instrucciones manuales para el usuario
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧭 CÓMO VERIFICAR MANUALMENTE:"
echo ""
echo "1. Lee el campo 📂 ARCHIVOS LEÍDOS en el plan que presentó el agente."
echo ""
echo "2. Revisa el log de la conversación con el agente y busca estas acciones"
echo "   que indican lecturas prohibidas antes de APROBADO:"
echo "     - 'Viewed src/...'       → lectura de código fuente"
echo "     - 'Searched for ...'    → búsqueda en src/"
echo "     - 'Listed directory src/' → exploración de directorio"
echo "     - 'Ran command: git show' → inspección de commit específico"
echo ""
echo "3. Compara lo que ves en el log con lo que declaró en el campo de auditoría."
echo ""
echo "   ✅ Sin violación:     log sin lecturas de src/ Y campo dice 'Ninguno'"
echo "   ❌ Violación simple:  log muestra lecturas de src/ Y campo dice 'Ninguno'"
echo "   ❌ Violación doble:   campo de auditoría ≠ checkpoint de Fase 2.5"
echo ""
echo "4. Si detectas una violación, comunícasela al agente:"
echo "   'VIOLACIÓN LAZY-PLANNING: leíste [archivos] sin autorización.'"
echo "   'Detente, corrige el campo de auditoría y espera nueva aprobación.'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
