import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Mini ERP + CRM Database Seeding...');

  // 1. Clean existing records in reverse dependency order
  await prisma.challanItem.deleteMany({});
  await prisma.salesChallan.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.followUpNote.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing database records.');

  // 2. Hash default password
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 3. Create Users for all 4 Roles
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@erp.com',
      name: 'Aryan Patel (Admin)',
      role: Role.ADMIN,
      passwordHash: hashedPassword,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      email: 'sales@erp.com',
      name: 'Priya Verma (Sales)',
      role: Role.SALES,
      passwordHash: hashedPassword,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      email: 'warehouse@erp.com',
      name: 'Ramesh Patel (Warehouse)',
      role: Role.WAREHOUSE,
      passwordHash: hashedPassword,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      email: 'accounts@erp.com',
      name: 'Sunita Rao (Accounts)',
      role: Role.ACCOUNTS,
      passwordHash: hashedPassword,
    },
  });

  console.log('✅ Created 4 System Users (Admin, Sales, Warehouse, Accounts).');

  // 4. Create Wholesale / Retail Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Vikram Mehta',
      mobile: '+91 98200 12345',
      email: 'vikram@mehtatrading.in',
      businessName: 'Mehta Industrial Traders Ltd.',
      gstNumber: '27AABCM1234F1Z8',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Plot 45, GIDC Industrial Estate, Phase 2, Ahmedabad, Gujarat - 382445',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: 'Key distributor for Western region. High quarterly order volume.',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Ananya Deshmukh',
      mobile: '+91 98111 88990',
      email: 'ananya@apexsupply.com',
      businessName: 'Apex Wholesale Supplies Pvt Ltd',
      gstNumber: '27AAACA9876G1ZA',
      customerType: CustomerType.WHOLESALE,
      address: 'Unit 12, Bhandup Logistics Park, LBS Marg, Mumbai, Maharashtra - 400078',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      notes: 'Prompt payer on 15-day credit cycle. Interested in bulk fasteners.',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Rajesh Singhania',
      mobile: '+91 97400 44556',
      email: 'rajesh@singhaniastore.com',
      businessName: 'Singhania Hardware Mart',
      gstNumber: '29ABCDE3456H1Z2',
      customerType: CustomerType.RETAIL,
      address: 'Shop 8-9, Commercial Complex, MG Road, Bengaluru, Karnataka - 560001',
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      notes: 'New retail lead requesting price catalog and MOQ sample.',
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      name: 'Karan Johar',
      mobile: '+91 98999 77889',
      email: 'karan@northernlogistics.org',
      businessName: 'Northern Packaging Solutions',
      gstNumber: '07AAACN5432K1ZP',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Sector 18, Udyog Vihar, Gurugram, Haryana - 122015',
      status: CustomerStatus.INACTIVE,
      followUpDate: null,
      notes: 'Account on hold due to pending GST verification.',
    },
  });

  console.log('✅ Created 4 CRM Customers across Distributor, Wholesale, Retail.');

  // 5. Add Follow-up Notes
  await prisma.followUpNote.createMany({
    data: [
      {
        customerId: customer1.id,
        userId: salesUser.id,
        note: 'Spoke with purchase manager regarding Q3 bulk order discount of 5%. Agreed on tentative 200 unit shipment.',
        followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        customerId: customer2.id,
        userId: salesUser.id,
        note: 'Confirmed receipt of catalog. Waiting for PO for high-torque motors.',
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        customerId: customer3.id,
        userId: salesUser.id,
        note: 'Initial phone enquiry. Shared product brochure and GST terms via WhatsApp & email.',
        followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created CRM Follow-up timeline records.');

  // 6. Create Products & Initial Inventory
  const productsData = [
    {
      name: 'High-Torque Industrial Servo Motor 2.5kW',
      sku: 'MOT-IND-2500',
      category: 'Electrical & Motors',
      unitPrice: 12500.0,
      currentStock: 45,
      minStockAlert: 10,
      location: 'Warehouse Bay A-12',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Precision Stainless Steel Ball Bearing 6205-2RS',
      sku: 'BRG-SS-6205',
      category: 'Mechanical Bearings',
      unitPrice: 420.0,
      currentStock: 350,
      minStockAlert: 50,
      location: 'Warehouse Bay B-04',
      imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Heavy Duty Cast Iron Butterfly Valve 4-Inch',
      sku: 'VLV-BF-004IN',
      category: 'Piping & Valves',
      unitPrice: 3800.0,
      currentStock: 28,
      minStockAlert: 15,
      location: 'Warehouse Bay C-09',
      imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Industrial Grade PVC Wire Harness 50m Roll',
      sku: 'WRH-PVC-050M',
      category: 'Cabling & Wiring',
      unitPrice: 1650.0,
      currentStock: 8, // Below min stock alert!
      minStockAlert: 12,
      location: 'Warehouse Bay A-03',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'High-Tensile Hex Head Bolt M12 x 50mm (Pack of 100)',
      sku: 'BLT-HEX-M1250',
      category: 'Fasteners & Hardware',
      unitPrice: 850.0,
      currentStock: 120,
      minStockAlert: 25,
      location: 'Warehouse Bay D-01',
      imageUrl: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Industrial Corrugated Packaging Box 24x18x18 (Pack of 25)',
      sku: 'BOX-CRG-2418',
      category: 'Packaging Materials',
      unitPrice: 950.0,
      currentStock: 4, // Below min stock alert!
      minStockAlert: 15,
      location: 'Warehouse Bay E-02',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);

    // Initial Stock Inward Log
    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        quantity: prod.currentStock,
        movementType: MovementType.IN,
        reason: 'Initial Warehouse Inward Stocking',
        userId: warehouseUser.id,
      },
    });
  }

  console.log(`✅ Created ${createdProducts.length} Products and initial IN Stock Movements.`);

  // 7. Create Sample Confirmed & Draft Sales Challans
  // Challan 1: Confirmed Challan for Mehta Trading
  const confirmedChallan = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-202609-0001',
      customerId: customer1.id,
      userId: salesUser.id,
      status: ChallanStatus.CONFIRMED,
      totalQuantity: 15,
      totalAmount: 15 * 12500.0,
      notes: 'Dispatched via Express Cargo Truck #GJ-01-AB-9876. LR attached.',
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            productName: createdProducts[0].name,
            productSku: createdProducts[0].sku,
            unitPrice: createdProducts[0].unitPrice,
            quantity: 15,
            totalPrice: 15 * 12500.0,
          },
        ],
      },
    },
  });

  // Outward stock movement for confirmed challan
  await prisma.stockMovement.create({
    data: {
      productId: createdProducts[0].id,
      quantity: 15,
      movementType: MovementType.OUT,
      reason: `Sales Challan ${confirmedChallan.challanNumber} Dispatch Confirmation`,
      userId: warehouseUser.id,
    },
  });

  // Challan 2: Draft Challan for Apex Wholesale
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-202609-0002',
      customerId: customer2.id,
      userId: salesUser.id,
      status: ChallanStatus.DRAFT,
      totalQuantity: 30,
      totalAmount: 20 * 420.0 + 10 * 850.0,
      notes: 'Pending final transport schedule from customer.',
      items: {
        create: [
          {
            productId: createdProducts[1].id,
            productName: createdProducts[1].name,
            productSku: createdProducts[1].sku,
            unitPrice: createdProducts[1].unitPrice,
            quantity: 20,
            totalPrice: 20 * 420.0,
          },
          {
            productId: createdProducts[4].id,
            productName: createdProducts[4].name,
            productSku: createdProducts[4].sku,
            unitPrice: createdProducts[4].unitPrice,
            quantity: 10,
            totalPrice: 10 * 850.0,
          },
        ],
      },
    },
  });

  console.log('✅ Created Demo Sales Challans with snapshot line items & audit logs.');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
