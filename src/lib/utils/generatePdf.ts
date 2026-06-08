export interface PdfSection {
  titulo: string;
  contenidoHtml: string; // Markdown ya convertido a HTML
}

export interface PdfManualOptions {
  nombreMiembro: string;
  arquetipo: string;
  fecha: string;
  secciones: PdfSection[];
}

/**
 * Convierte un subconjunto común de Markdown (párrafos, negritas, cursivas, 
 * encabezados, citas y listas) a HTML estructurado sin dependencias externas.
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown;

  // Sanitizar caracteres HTML básicos
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Encabezados
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Negritas
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Cursivas
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Bloques de cita
  html = html.replace(/^\s*&gt;\s+(.*$)/gim, '<blockquote>$1</blockquote>');

  // Elementos de lista
  html = html.replace(/^\s*[-*+]\s+(.*$)/gim, '<li>$1</li>');
  // Agrupar listas consecutivas en etiquetas <ul>
  html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');

  // Párrafos y saltos de línea
  const lines = html.split(/\n{2,}/);
  html = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (
      trimmed.startsWith('<h') || 
      trimmed.startsWith('<ul') || 
      trimmed.startsWith('<li') || 
      trimmed.startsWith('<blockquote')
    ) {
      return trimmed;
    }
    // Reemplazar saltos de línea individuales dentro de un párrafo por <br />
    const withBrs = trimmed.replace(/\n/g, '<br />');
    return `<p>${withBrs}</p>`;
  }).join('\n');

  return html;
}

export function generateManualPdf({ nombreMiembro, arquetipo, fecha, secciones }: PdfManualOptions): void {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Manual Galáctico - ${nombreMiembro}</title>
      <style>
        @page { margin: 20mm; }
        body { font-family: Georgia, serif; font-size: 11pt; color: #1a1a1a; line-height: 1.6; }
        .portada { text-align: center; padding-top: 60mm; page-break-after: always; }
        .portada h1 { font-size: 22pt; margin-bottom: 8mm; font-weight: normal; }
        .portada .arquetipo { font-size: 13pt; color: #555; margin-bottom: 4mm; }
        .portada .fecha { font-size: 10pt; color: #888; margin-top: 12mm; }
        .seccion { page-break-before: always; }
        .seccion h2 { font-size: 15pt; border-bottom: 1px solid #ddd; padding-bottom: 3mm; margin-bottom: 6mm; font-weight: normal; color: #4A4E4D; }
        p { margin-bottom: 4mm; text-align: justify; }
        blockquote { border-left: 3px solid #8A817C; padding-left: 4mm; color: #555; font-style: italic; margin: 4mm 0; }
        strong { font-weight: 700; }
        ul { margin-bottom: 4mm; padding-left: 6mm; }
        li { margin-bottom: 2mm; }
      </style>
    </head>
    <body>
      <div class="portada">
        <h1>Manual Galáctico</h1>
        <div class="arquetipo"><strong>Miembro:</strong> ${nombreMiembro}</div>
        <div class="arquetipo"><strong>Arquetipo:</strong> ${arquetipo}</div>
        <div class="fecha">Generado el ${fecha}</div>
      </div>
      ${secciones.map(s => `
        <div class="seccion">
          <h2>${s.titulo}</h2>
          ${s.contenidoHtml}
        </div>
      `).join('')}
    </body>
    </html>
  `;

  const ventana = window.open('', '_blank');
  if (!ventana) return;
  ventana.document.write(htmlContent);
  ventana.document.close();
  ventana.focus();
  
  // Pequeño retardo para asegurar renderizado correcto antes de la impresión
  setTimeout(() => {
    ventana.print();
    ventana.close();
  }, 250);
}
