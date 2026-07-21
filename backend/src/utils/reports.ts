import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';

export function generatePDF(title: string, headers: string[], rows: any[][]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.fontSize(16).text(title, { align: 'center' });
    doc.moveDown(2);
    const tableTop = doc.y;
    const colWidth = (doc.page.width - 60) / headers.length;
    doc.fontSize(10).font('Helvetica-Bold');
    headers.forEach((h, i) => doc.text(h, 30 + i * colWidth, tableTop, { width: colWidth, align: 'left' }));
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(9);
    let y = doc.y;
    rows.forEach((row) => {
      if (y > doc.page.height - 60) { doc.addPage(); y = doc.y; }
      row.forEach((cell, i) => doc.text(String(cell ?? ''), 30 + i * colWidth, y, { width: colWidth, align: 'left' }));
      y += 18;
    });
    doc.end();
  });
}

export function generateExcel(headers: string[], rows: any[][]): Buffer {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}
