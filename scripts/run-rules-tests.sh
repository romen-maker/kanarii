#!/usr/bin/env bash
set -euo pipefail

# Directorios de destino para JDK
PROJECT_ROOT="$(pwd)"
TMP_DIR="${PROJECT_ROOT}/.tmp"
JDK_DIR="${TMP_DIR}/jdk-21"

echo "=== Setup JDK 21 portable ==="

if [ -f "${JDK_DIR}/bin/java" ]; then
  echo "✓ JDK 21 ya está instalado localmente en ${JDK_DIR}"
else
  echo "JDK 21 no encontrado. Descargando versión portable de Adoptium Temurin..."
  mkdir -p "${TMP_DIR}"
  
  TARBALL="${TMP_DIR}/jdk-21.tar.gz"
  EXTRACT_DIR="${TMP_DIR}/jdk-21-extract"
  
  # Descargar JDK 21
  URL="https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/adoptium?project=jdk"
  echo "Descargando desde: ${URL}"
  curl -L -o "${TARBALL}" "${URL}"
  
  # Extraer
  echo "Extrayendo..."
  mkdir -p "${EXTRACT_DIR}"
  tar -xzf "${TARBALL}" -C "${EXTRACT_DIR}"
  
  # Estructurar
  mkdir -p "${JDK_DIR}"
  # El tar.gz de Temurin tiene una subcarpeta (ej. jdk-21.0.3+9), movemos su contenido
  mv "${EXTRACT_DIR}"/jdk-21*/* "${JDK_DIR}"/
  
  # Limpiar temporales de descarga
  rm -rf "${TARBALL}" "${EXTRACT_DIR}"
  echo "✓ JDK 21 instalado correctamente."
fi

# Configurar variables de entorno locales para usar nuestro JDK 21
export JAVA_HOME="${JDK_DIR}"
export PATH="${JAVA_HOME}/bin:${PATH}"

# Verificar versión de Java en esta ejecución
echo "Versión de Java activa en esta ejecución:"
java -version

echo "=== Iniciando Emulador y Pruebas de Reglas ==="
# Ejecutar emuladores de Firebase y correr las pruebas
npx firebase emulators:exec --only firestore "npx tsx tests/firestore-rules.test.ts"
