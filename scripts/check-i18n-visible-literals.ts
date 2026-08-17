import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const ALLOWED_VISIBLE_LITERALS = new Set([
  'Kanarii',
  'S3',
  '→',
  '←',
  '×',
  'OK',
  'FAQ',
  'ID',
  'UID',
  '•',
  '🔮',
  '🌱',
  '✨',
  '❤️',
]);

const IGNORED_PROPS = new Set([
  'className',
  'id',
  'key',
  'type',
  'role',
  'aria-hidden',
  'style',
  'src',
  'href',
  'to',
  'target',
  'rel',
  'name',
  'method',
  'action',
  'autoComplete',
  'viewBox',
  'xmlns',
  'strokeWidth',
  'strokeLinecap',
  'strokeLinejoin',
  'fill',
  'd',
]);

const VISIBLE_PROPS = new Set(['title', 'placeholder', 'aria-label', 'alt', 'label']);

interface Finding {
  filePath: string;
  line: number;
  column: number;
  type: 'JSX_TEXT' | 'VISIBLE_PROP' | 'STRING_LITERAL';
  literal: string;
  allowed: boolean;
}

function isNumericOrSymbolic(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  // Solo números, signos de puntuación o emojis aislados
  if (/^[\d\s.,:;+\-*/%()#@!&<>='"]+$/.test(trimmed)) return true;
  return false;
}

function scanFile(filePath: string): Finding[] {
  const findings: Finding[] = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  function visit(node: ts.Node) {
    // 1. JsxText
    if (ts.isJsxText(node)) {
      const rawText = node.getText();
      const trimmed = rawText.trim().replace(/\s+/g, ' ');
      if (trimmed && !isNumericOrSymbolic(trimmed)) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const allowed = ALLOWED_VISIBLE_LITERALS.has(trimmed);
        findings.push({
          filePath,
          line: line + 1,
          column: character + 1,
          type: 'JSX_TEXT',
          literal: trimmed,
          allowed,
        });
      }
    }

    // 2. JsxAttribute (title, placeholder, aria-label, alt, etc.)
    if (ts.isJsxAttribute(node)) {
      const propName = node.name.getText();
      if (VISIBLE_PROPS.has(propName) && node.initializer) {
        let valueText = '';
        let startPos = node.initializer.getStart();

        if (ts.isStringLiteral(node.initializer)) {
          valueText = node.initializer.text;
        } else if (
          ts.isJsxExpression(node.initializer) &&
          node.initializer.expression &&
          ts.isStringLiteral(node.initializer.expression)
        ) {
          valueText = node.initializer.expression.text;
        }

        const trimmed = valueText.trim().replace(/\s+/g, ' ');
        if (trimmed && !isNumericOrSymbolic(trimmed)) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(startPos);
          const allowed = ALLOWED_VISIBLE_LITERALS.has(trimmed);
          findings.push({
            filePath,
            line: line + 1,
            column: character + 1,
            type: 'VISIBLE_PROP',
            literal: trimmed,
            allowed,
          });
        }
      }
    }

    // 3. StringLiteral dentro de JsxExpression simple en hijos de JSX
    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      ts.isStringLiteral(node.expression) &&
      node.parent &&
      ts.isJsxElement(node.parent)
    ) {
      const trimmed = node.expression.text.trim().replace(/\s+/g, ' ');
      if (trimmed && !isNumericOrSymbolic(trimmed)) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const allowed = ALLOWED_VISIBLE_LITERALS.has(trimmed);
        findings.push({
          filePath,
          line: line + 1,
          column: character + 1,
          type: 'STRING_LITERAL',
          literal: trimmed,
          allowed,
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return findings;
}

function getTsxFilesRecursively(dirOrFile: string): string[] {
  if (!fs.existsSync(dirOrFile)) return [];
  const stat = fs.statSync(dirOrFile);
  if (stat.isFile()) {
    if (dirOrFile.endsWith('.tsx') || dirOrFile.endsWith('.jsx')) {
      return [dirOrFile];
    }
    return [];
  }

  let results: string[] = [];
  const list = fs.readdirSync(dirOrFile);
  for (const file of list) {
    if (
      file === 'node_modules' ||
      file === 'dist' ||
      file === 'build' ||
      file === '.git' ||
      file === '.tmp'
    ) {
      continue;
    }
    const fullPath = path.join(dirOrFile, file);
    results = results.concat(getTsxFilesRecursively(fullPath));
  }
  return results;
}

function runCLI() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Uso: npx tsx scripts/check-i18n-visible-literals.ts <archivo_o_directorio_1> [archivo_o_directorio_2 ...]');
    console.log('Ejemplo: npx tsx scripts/check-i18n-visible-literals.ts src/components/onboarding/WelcomeHeroSections.tsx src/pages/Welcome.tsx');
    process.exit(0);
  }

  let filesToScan: string[] = [];
  for (const arg of args) {
    const fullPath = path.resolve(process.cwd(), arg);
    filesToScan = filesToScan.concat(getTsxFilesRecursively(fullPath));
  }

  // Eliminar duplicados
  filesToScan = Array.from(new Set(filesToScan));

  let totalInspected = filesToScan.length;
  let totalCandidates = 0;
  let totalAllowed = 0;

  console.log(`\n🔍 Auditando copy visible hardcodeado en ${totalInspected} archivo(s) TSX/JSX...\n`);

  for (const file of filesToScan) {
    const relativePath = path.relative(process.cwd(), file);
    const findings = scanFile(file);
    if (findings.length > 0) {
      for (const f of findings) {
        totalCandidates++;
        if (f.allowed) {
          totalAllowed++;
          continue;
        }
        console.warn(
          `⚠️ [WARNING] ${relativePath}:${f.line}:${f.column} (${f.type}) → "${f.literal}"`
        );
        console.warn(`   ↳ Sugerencia: Usar i18n o añadir una excepción en la allowlist si está justificado.\n`);
      }
    }
  }

  console.log('--------------------------------------------------');
  console.log(`📊 Totales de Auditoría:`);
  console.log(`  - Archivos inspeccionados : ${totalInspected}`);
  console.log(`  - Candidatos detectados  : ${totalCandidates}`);
  console.log(`  - Excepciones permitidas : ${totalAllowed}`);
  console.log(`  - Warnings reportados    : ${totalCandidates - totalAllowed}`);
  console.log('--------------------------------------------------');
  console.log('ℹ️  Modo WARNING activo. Salida final con código de éxito 0.\n');

  process.exit(0);
}

runCLI();
