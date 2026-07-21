import { PrismaClient } from '@prisma/client';
import { geocodeAddress } from '../utils/geocoding';
import { parseExcel, parseCSV, parseTXT, parseJSON, parseXML } from '../utils/parser';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class ImportService {
  async importFromFile(companyId: string, buffer: Buffer, mimeType: string, customerId?: string) {
    let addresses;
    switch (mimeType) {
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.ms-excel':
        addresses = parseExcel(buffer);
        break;
      case 'text/csv':
        addresses = parseCSV(buffer.toString('utf-8'));
        break;
      case 'text/plain':
        addresses = parseTXT(buffer.toString('utf-8'));
        break;
      case 'application/json':
        addresses = parseJSON(buffer.toString('utf-8'));
        break;
      case 'application/xml':
      case 'text/xml':
        addresses = parseXML(buffer.toString('utf-8'));
        break;
      default:
        throw new AppError(400, 'Formato de archivo no soportado');
    }

    return this.processAddresses(companyId, addresses, customerId);
  }

  async importFromText(companyId: string, text: string, customerId?: string) {
    const addresses = text
      .split('\n')
      .filter(l => l.trim())
      .map(line => {
        const parts = line.split(',').map(s => s.trim());
        return {
          address: parts[0] || '',
          customerName: parts[1],
          phone: parts[2],
        };
      });

    return this.processAddresses(companyId, addresses, customerId);
  }

  async importFromGoogleSheets(companyId: string, csvData: string, customerId?: string) {
    const addresses = parseCSV(csvData);
    return this.processAddresses(companyId, addresses, customerId);
  }

  async importFromAPI(companyId: string, data: any[], customerId?: string) {
    const addresses = data.map(normalizeRow);
    return this.processAddresses(companyId, addresses, customerId);
  }

  private async processAddresses(companyId: string, addresses: any[], customerId?: string) {
    const results = { total: addresses.length, geocoded: 0, failed: 0, errors: [] as any[] };

    for (const item of addresses) {
      try {
        let customer;
        if (customerId) {
          customer = await prisma.customer.findUnique({ where: { id: customerId } });
        } else if (item.customerName) {
          customer = await prisma.customer.findFirst({
            where: { companyId, name: item.customerName },
          });
          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                companyId,
                name: item.customerName,
                phone: item.phone,
                email: item.email,
              },
            });
          }
        }

        let lat: number | null = null;
        let lng: number | null = null;
        if (item.address) {
          const geo = await geocodeAddress(item.address);
          if (geo) {
            lat = geo.latitude;
            lng = geo.longitude;
            results.geocoded++;
          }
        }

        const address = await prisma.address.create({
          data: {
            customerId: customer?.id || '',
            street: item.address,
            city: item.city || '',
            state: item.state,
            zipCode: item.zipCode,
            reference: item.reference,
            latitude: lat,
            longitude: lng,
          },
        });

        if (customer) {
          await prisma.customer.update({
            where: { id: customer.id },
            data: { addresses: { connect: { id: address.id } } },
          });
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({ address: item.address, error: error.message });
      }
    }

    return results;
  }
}

function normalizeRow(row: any): any {
  const keys = Object.keys(row).reduce((acc: any, k: string) => {
    acc[k.toLowerCase().trim()] = row[k];
    return acc;
  }, {});

  return {
    address: keys.direccion || keys.address || keys.dirección || keys.calle || keys.street || '',
    customerName: keys.nombre || keys.name || keys.cliente || keys.customer,
    phone: keys.telefono || keys.phone || keys.teléfono || keys.tel,
    email: keys.email || keys.correo || keys.mail,
    reference: keys.referencia || keys.reference || keys.ref,
    notes: keys.notas || keys.notes,
    city: keys.ciudad || keys.city || keys.municipio,
    state: keys.estado || keys.state || keys.provincia,
    zipCode: keys.cp || keys.zip || keys.codigopostal || keys.postal,
  };
}

export const importService = new ImportService();
