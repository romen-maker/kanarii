import fs from 'fs';
import path from 'path';

interface ParityIssue {
  namespace: string;
  keyPath: string;
  missingIn: 'es' | 'en';
}

const LOCALES_DIR = path.join(process.cwd(), 'src', 'locales');
const NAMESPACES = ['common', 'welcome', 'auth', 'communities', 'passport'];
const CRITICAL_NAMESPACES = ['welcome', 'passport'];

function getKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        keys = keys.concat(getKeys(obj[k], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  return keys;
}

function runAudit() {
  console.log('🔍 Auditando paridad de diccionarios i18n (es ↔ en)...');
  const issues: ParityIssue[] = [];

  for (const ns of NAMESPACES) {
    const esPath = path.join(LOCALES_DIR, 'es', `${ns}.json`);
    const enPath = path.join(LOCALES_DIR, 'en', `${ns}.json`);

    if (!fs.existsSync(esPath) || !fs.existsSync(enPath)) {
      console.error(`❌ Falta archivo para el namespace ${ns}`);
      process.exit(1);
    }

    const esContent = JSON.parse(fs.readFileSync(esPath, 'utf8'));
    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

    const esKeys = new Set(getKeys(esContent));
    const enKeys = new Set(getKeys(enContent));

    esKeys.forEach((k) => {
      if (!enKeys.has(k)) {
        issues.push({ namespace: ns, keyPath: k, missingIn: 'en' });
      }
    });

    enKeys.forEach((k) => {
      if (!esKeys.has(k)) {
        issues.push({ namespace: ns, keyPath: k, missingIn: 'es' });
      }
    });
  }

  // Generar Reporte Markdown
  const reportPath = path.join(process.cwd(), 'docs', 'i18n-parity-report.md');
  let reportMd = `# Reporte de Paridad de Claves i18n\n\n`;
  reportMd += `> Generado automáticamente el ${new Date().toISOString()}\n\n`;

  if (issues.length === 0) {
    reportMd += `✅ **Paridad completa del 100%.** No se encontraron claves faltantes entre ES y EN en ningún namespace.\n`;
    console.log('✅ Paridad completa comprobada. No hay discrepancias de claves i18n.');
  } else {
    reportMd += `⚠️ Se detectaron **${issues.length}** discrepancias de claves i18n:\n\n`;
    reportMd += `| Namespace | Clave | Falta en |\n|---|---|---|\n`;
    issues.forEach((iss) => {
      reportMd += `| \`${iss.namespace}\` | \`${iss.keyPath}\` | **${iss.missingIn.toUpperCase()}** |\n`;
    });
    console.warn(`⚠️ Se encontraron ${issues.length} discrepancias de claves i18n.`);
  }

  fs.writeFileSync(reportPath, reportMd, 'utf8');
  console.log(`📄 Reporte guardado en ${reportPath}`);

  // Verificar si hay fallos en namespaces críticos
  const criticalFailures = issues.filter((i) => CRITICAL_NAMESPACES.includes(i.namespace));
  if (criticalFailures.length > 0) {
    console.error(`❌ Fallo crítico en CI: Se encontraron ${criticalFailures.length} claves faltantes en namespaces críticos (${CRITICAL_NAMESPACES.join(', ')}).`);
    process.exit(1);
  }
}

runAudit();
