import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://nexusflow:nexusflow_dev_2024@localhost:5432/nexusflow_dev',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create organization
  const org = await prisma.organization.create({
    data: { name: 'NexusFlow Demo Corp' },
  });

  // Create users
  const hashedPassword = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nexusflow.ai',
      name: 'Sarah Chen',
      hashedPassword,
      role: Role.ADMIN,
      organizationId: org.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'manager@nexusflow.ai',
      name: 'James Wilson',
      hashedPassword: await bcrypt.hash('Manager1234!', 12),
      role: Role.MANAGER,
      organizationId: org.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@nexusflow.ai',
      name: 'Emily Rodriguez',
      hashedPassword: await bcrypt.hash('Viewer1234!', 12),
      role: Role.VIEWER,
      organizationId: org.id,
    },
  });

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'TechSource Electronics',
        email: 'orders@techsource.com',
        phone: '+1-555-0101',
        address: '123 Tech Blvd, Shenzhen, China',
        rating: 4.8,
        organizationId: org.id,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'PackRight Materials',
        email: 'sales@packright.com',
        phone: '+1-555-0102',
        address: '456 Industrial Way, Taipei, Taiwan',
        rating: 4.5,
        organizationId: org.id,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'GlobalWire Components',
        email: 'supply@globalwire.com',
        phone: '+1-555-0103',
        address: '789 Circuit Ave, Seoul, South Korea',
        rating: 4.2,
        organizationId: org.id,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'EcoCase Solutions',
        email: 'info@ecocase.com',
        phone: '+1-555-0104',
        address: '321 Green St, Portland, OR',
        rating: 4.6,
        organizationId: org.id,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'DisplayTech Pro',
        email: 'wholesale@displaytech.com',
        phone: '+1-555-0105',
        address: '555 Screen Dr, Osaka, Japan',
        rating: 4.9,
        organizationId: org.id,
      },
    }),
  ]);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'SKU-4521',
        name: 'Wireless Earbuds Pro',
        description: 'Premium Bluetooth 5.3 wireless earbuds with ANC',
        currentStock: 45,
        reorderPoint: 100,
        safetyStock: 50,
        unitCost: 28.5,
        organizationId: org.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKU-1287',
        name: 'Phone Cases - Clear Slim',
        description: 'Universal clear TPU phone cases, multi-size pack',
        currentStock: 2800,
        reorderPoint: 500,
        safetyStock: 200,
        unitCost: 2.15,
        organizationId: org.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKU-8903',
        name: 'USB-C Cables 6ft',
        description: 'Braided USB-C to USB-C fast charging cables',
        currentStock: 620,
        reorderPoint: 300,
        safetyStock: 150,
        unitCost: 3.4,
        organizationId: org.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKU-3344',
        name: 'Screen Protectors',
        description: 'Tempered glass screen protectors, assorted sizes',
        currentStock: 85,
        reorderPoint: 200,
        safetyStock: 100,
        unitCost: 1.8,
        organizationId: org.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKU-5567',
        name: 'Portable Charger 10000mAh',
        description: 'Compact power bank with dual USB outputs',
        currentStock: 310,
        reorderPoint: 150,
        safetyStock: 75,
        unitCost: 12.0,
        organizationId: org.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKU-7789',
        name: 'Laptop Stand - Aluminum',
        description: 'Adjustable ergonomic laptop stand',
        currentStock: 180,
        reorderPoint: 80,
        safetyStock: 40,
        unitCost: 18.5,
        organizationId: org.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKU-9012',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with USB-C receiver',
        currentStock: 425,
        reorderPoint: 200,
        safetyStock: 100,
        unitCost: 8.75,
        organizationId: org.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKU-2345',
        name: 'Webcam 1080p',
        description: 'Full HD webcam with built-in microphone',
        currentStock: 92,
        reorderPoint: 100,
        safetyStock: 50,
        unitCost: 22.0,
        organizationId: org.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKU-6678',
        name: 'Bluetooth Speaker Mini',
        description: 'Portable waterproof Bluetooth speaker',
        currentStock: 560,
        reorderPoint: 250,
        safetyStock: 125,
        unitCost: 15.0,
        organizationId: org.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SKU-4490',
        name: 'HDMI Cable 4K',
        description: 'High-speed HDMI 2.1 cable, 6ft',
        currentStock: 1200,
        reorderPoint: 400,
        safetyStock: 200,
        unitCost: 4.5,
        organizationId: org.id,
      },
    }),
  ]);

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'PO-2024-001',
        status: OrderStatus.DELIVERED,
        totalAmount: 14250.0,
        organizationId: org.id,
        supplierId: suppliers[0].id,
        items: {
          create: [
            { quantity: 500, unitPrice: 28.5, productId: products[0].id },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'PO-2024-002',
        status: OrderStatus.SHIPPED,
        totalAmount: 4300.0,
        organizationId: org.id,
        supplierId: suppliers[1].id,
        items: {
          create: [
            { quantity: 2000, unitPrice: 2.15, productId: products[1].id },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'PO-2024-003',
        status: OrderStatus.CONFIRMED,
        totalAmount: 3400.0,
        organizationId: org.id,
        supplierId: suppliers[2].id,
        items: {
          create: [
            { quantity: 1000, unitPrice: 3.4, productId: products[2].id },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'PO-2024-004',
        status: OrderStatus.PENDING,
        totalAmount: 1800.0,
        organizationId: org.id,
        supplierId: suppliers[0].id,
        items: {
          create: [
            { quantity: 1000, unitPrice: 1.8, productId: products[3].id },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'PO-2024-005',
        status: OrderStatus.PENDING,
        totalAmount: 6000.0,
        organizationId: org.id,
        supplierId: suppliers[4].id,
        items: {
          create: [
            { quantity: 500, unitPrice: 12.0, productId: products[4].id },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'PO-2024-006',
        status: OrderStatus.DRAFT,
        totalAmount: 9250.0,
        organizationId: org.id,
        supplierId: suppliers[3].id,
        items: {
          create: [
            { quantity: 500, unitPrice: 18.5, productId: products[5].id },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'PO-2024-007',
        status: OrderStatus.CONFIRMED,
        totalAmount: 4375.0,
        organizationId: org.id,
        supplierId: suppliers[2].id,
        items: {
          create: [
            { quantity: 500, unitPrice: 8.75, productId: products[6].id },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'PO-2024-008',
        status: OrderStatus.PENDING,
        totalAmount: 11000.0,
        organizationId: org.id,
        supplierId: suppliers[4].id,
        items: {
          create: [
            { quantity: 500, unitPrice: 22.0, productId: products[7].id },
          ],
        },
      },
    }),
  ]);

  console.log(`Seeded:
  - 1 organization: ${org.name}
  - 3 users (admin, manager, viewer)
  - ${suppliers.length} suppliers
  - ${products.length} products
  - ${orders.length} orders
  
  Login credentials:
  - admin@nexusflow.ai / Admin1234!
  - manager@nexusflow.ai / Manager1234!
  - viewer@nexusflow.ai / Viewer1234!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
