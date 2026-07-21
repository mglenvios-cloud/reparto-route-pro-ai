import * as XLSX from 'xlsx';

interface ParsedAddress {
  address: string;
  customerName?: string;
  phone?: string;
  email?: string;
  reference?: string;
  notes?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export function parseExcel(buffer: Buffer): ParsedAddress[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<any>(sheet);
  return rows.map(normalizeRow);
}

export function parseCSV(content: string): ParsedAddress[] {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    headers.forEach((h, i) => { row[h] = values[i]; });
    return normalizeRow(row);
  });
}

export function parseTXT(content: string): ParsedAddress[] {
  return content
    .split('\n')
    .filter(l => l.trim())
    .map(line => ({ address: line.trim() }));
}

export function parseJSON(content: string): ParsedAddress[] {
  const data = JSON.parse(content);
  const arr = Array.isArray(data) ? data : [data];
  return arr.map(normalizeRow);
}

export function parseXML(content: string): ParsedAddress[] {
  const matches = content.match(/<[^>]+>[^<]+<\/[^>]+>/g);
  if (!matches) return [];
  return [{ address: matches.map(m => m.replace(/<[^>]+>/g, '')).join(', ') }];
}

function normalizeRow(row: any): ParsedAddress {
  const keys = Object.keys(row).reduce((acc: any, k: string) => {
    acc[k.toLowerCase().trim()] = row[k];
    return acc;
  }, {});

  const address =
    keys.direccion || keys.address || keys.dirección ||
    keys.calle || keys.street || keys.domicilio ||
    [keys.street, keys.number, keys.colony, keys.city, keys.state]
      .filter(Boolean)
      .join(', ');

  return {
    address: String(address || ''),
    customerName: keys.nombre || keys.name || keys.cliente || keys.customer,
    phone: keys.telefono || keys.phone || keys.teléfono || keys.tel,
    email: keys.email || keys.correo || keys.mail,
    reference: keys.referencia || keys.reference || keys.ref,
    notes: keys.notas || keys.notes || keys.observaciones,
    city: keys.ciudad || keys.city || keys.municipio,
    state: keys.estado || keys.state || keys.provincia,
    zipCode: keys.cp || keys.zip || keys.codigopostal || keys.postal,
  };
}
