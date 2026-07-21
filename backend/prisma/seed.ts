import { PrismaClient, UserRole, DriverStatus, VehicleType, VehicleStatus, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 12);
  const company = await prisma.company.upsert({
    where: { slug: 'demo-company' }, update: {},
    create: { name: 'Demo Company', slug: 'demo-company', email: 'demo@routeproai.com', phone: '+525551234567', address: 'Av. Reforma 222, Ciudad de México' },
  });
  const admin = await prisma.user.upsert({
    where: { email: 'admin@routeproai.com' }, update: {},
    create: { companyId: company.id, email: 'admin@routeproai.com', password, name: 'Admin', lastName: 'Principal', role: UserRole.SUPER_ADMIN },
  });
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@routeproai.com' }, update: {},
    create: { companyId: company.id, email: 'driver@routeproai.com', password, name: 'Carlos', lastName: 'Repartidor', role: UserRole.DRIVER },
  });
  const driver = await prisma.driver.upsert({
    where: { code: 'DRV-000001' }, update: {},
    create: { companyId: company.id, userId: driverUser.id, code: 'DRV-000001', name: 'Carlos', lastName: 'Repartidor', phone: '+525511223344', email: 'driver@routeproai.com', status: DriverStatus.AVAILABLE, latitude: 19.4326, longitude: -99.1332 },
  });
  await prisma.vehicle.upsert({
    where: { plate: 'ABC-1234' }, update: {},
    create: { companyId: company.id, driverId: driver.id, plate: 'ABC-1234', brand: 'Nissan', model: 'NP300', year: 2022, color: 'Blanco', type: VehicleType.VAN, status: VehicleStatus.ACTIVE },
  });

  const customerData = [
    { name: 'María García', phone: '+525500001111', address: 'Av. Insurgentes Sur 100, CDMX' },
    { name: 'Juan Pérez', phone: '+525500002222', address: 'Calle Durango 200, Col. Roma, CDMX' },
    { name: 'Ana López', phone: '+525500003333', address: 'Blvd. Manuel Ávila Camacho 300, CDMX' },
  ];

  for (const c of customerData) {
    const customer = await prisma.customer.create({ data: { companyId: company.id, name: c.name, phone: c.phone } });
    const address = await prisma.address.create({ data: { customerId: customer.id, street: c.address, city: 'Ciudad de México', state: 'CDMX', country: 'México' } });
    await prisma.order.create({
      data: { companyId: company.id, customerId: customer.id, addressId: address.id, driverId: driver.id, code: `ORD-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`, description: `Entrega para ${c.name}`, status: OrderStatus.PENDING, value: Math.floor(Math.random() * 500) + 100 },
    });
  }
  console.log('Seed completado exitosamente');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
