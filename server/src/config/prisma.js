import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// In-Memory Mock Database Store
class MockDatabase {
  constructor() {
    this.users = [];
    this.customers = [];
    this.followUpNotes = [];
    this.products = [];
    this.stockMovements = [];
    this.salesChallans = [];
    this.challanItems = [];
    this.initialized = false;
  }

  async seed() {
    if (this.initialized) return;

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // 1. Users
    const admin = {
      id: 'usr-admin-1',
      supabaseUid: null,
      email: 'admin@erp.com',
      name: 'Aryan Patel (Admin)',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sales = {
      id: 'usr-sales-2',
      supabaseUid: null,
      email: 'sales@erp.com',
      name: 'Priya Verma (Sales)',
      passwordHash: hashedPassword,
      role: 'SALES',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const warehouse = {
      id: 'usr-warehouse-3',
      supabaseUid: null,
      email: 'warehouse@erp.com',
      name: 'Ramesh Patel (Warehouse)',
      passwordHash: hashedPassword,
      role: 'WAREHOUSE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const accounts = {
      id: 'usr-accounts-4',
      supabaseUid: null,
      email: 'accounts@erp.com',
      name: 'Sunita Rao (Accounts)',
      passwordHash: hashedPassword,
      role: 'ACCOUNTS',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users = [admin, sales, warehouse, accounts];

    // 2. Customers
    const cust1 = {
      id: 'cust-1',
      name: 'Vikram Mehta',
      mobile: '+91 98200 12345',
      email: 'vikram@mehtatrading.in',
      businessName: 'Mehta Industrial Traders Ltd.',
      gstNumber: '27AABCM1234F1Z8',
      customerType: 'DISTRIBUTOR',
      address: 'Plot 45, GIDC Industrial Estate, Phase 2, Ahmedabad, Gujarat - 382445',
      status: 'ACTIVE',
      followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: 'Key distributor for Western region. High quarterly order volume.',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const cust2 = {
      id: 'cust-2',
      name: 'Ananya Deshmukh',
      mobile: '+91 98111 88990',
      email: 'ananya@apexsupply.com',
      businessName: 'Apex Wholesale Supplies Pvt Ltd',
      gstNumber: '27AAACA9876G1ZA',
      customerType: 'WHOLESALE',
      address: 'Unit 12, Bhandup Logistics Park, LBS Marg, Mumbai, Maharashtra - 400078',
      status: 'ACTIVE',
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      notes: 'Prompt payer on 15-day credit cycle. Interested in bulk fasteners.',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const cust3 = {
      id: 'cust-3',
      name: 'Rajesh Singhania',
      mobile: '+91 97400 44556',
      email: 'rajesh@singhaniastore.com',
      businessName: 'Singhania Hardware Mart',
      gstNumber: '29ABCDE3456H1Z2',
      customerType: 'RETAIL',
      address: 'Shop 8-9, Commercial Complex, MG Road, Bengaluru, Karnataka - 560001',
      status: 'LEAD',
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      notes: 'New retail lead requesting price catalog and MOQ sample.',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const cust4 = {
      id: 'cust-4',
      name: 'Karan Johar',
      mobile: '+91 98999 77889',
      email: 'karan@northernlogistics.org',
      businessName: 'Northern Packaging Solutions',
      gstNumber: '07AAACN5432K1ZP',
      customerType: 'DISTRIBUTOR',
      address: 'Sector 18, Udyog Vihar, Gurugram, Haryana - 122015',
      status: 'INACTIVE',
      followUpDate: null,
      notes: 'Account on hold due to pending GST verification.',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customers = [cust1, cust2, cust3, cust4];

    // 3. Follow-up Notes
    this.followUpNotes = [
      {
        id: 'note-1',
        customerId: cust1.id,
        userId: sales.id,
        note: 'Spoke with purchase manager regarding Q3 bulk order discount of 5%. Agreed on tentative 200 unit shipment.',
        followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: 'note-2',
        customerId: cust2.id,
        userId: sales.id,
        note: 'Confirmed receipt of catalog. Waiting for PO for high-torque motors.',
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: 'note-3',
        customerId: cust3.id,
        userId: sales.id,
        note: 'Initial phone enquiry. Shared product brochure and GST terms via WhatsApp & email.',
        followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
    ];

    // 4. Products
    const prod1 = {
      id: 'prod-1',
      name: 'High-Torque Industrial Servo Motor 2.5kW',
      sku: 'MOT-IND-2500',
      category: 'Electrical & Motors',
      unitPrice: 12500.0,
      currentStock: 45,
      minStockAlert: 10,
      location: 'Warehouse Bay A-12',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const prod2 = {
      id: 'prod-2',
      name: 'Precision Stainless Steel Ball Bearing 6205-2RS',
      sku: 'BRG-SS-6205',
      category: 'Mechanical Bearings',
      unitPrice: 420.0,
      currentStock: 350,
      minStockAlert: 50,
      location: 'Warehouse Bay B-04',
      imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const prod3 = {
      id: 'prod-3',
      name: 'Heavy Duty Cast Iron Butterfly Valve 4-Inch',
      sku: 'VLV-BF-004IN',
      category: 'Piping & Valves',
      unitPrice: 3800.0,
      currentStock: 28,
      minStockAlert: 15,
      location: 'Warehouse Bay C-09',
      imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const prod4 = {
      id: 'prod-4',
      name: 'Industrial Grade PVC Wire Harness 50m Roll',
      sku: 'WRH-PVC-050M',
      category: 'Cabling & Wiring',
      unitPrice: 1650.0,
      currentStock: 8, // Below min stock alert!
      minStockAlert: 12,
      location: 'Warehouse Bay A-03',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const prod5 = {
      id: 'prod-5',
      name: 'High-Tensile Hex Head Bolt M12 x 50mm (Pack of 100)',
      sku: 'BLT-HEX-M1250',
      category: 'Fasteners & Hardware',
      unitPrice: 850.0,
      currentStock: 120,
      minStockAlert: 25,
      location: 'Warehouse Bay D-01',
      imageUrl: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const prod6 = {
      id: 'prod-6',
      name: 'Industrial Corrugated Packaging Box 24x18x18 (Pack of 25)',
      sku: 'BOX-CRG-2418',
      category: 'Packaging Materials',
      unitPrice: 950.0,
      currentStock: 4, // Below min stock alert!
      minStockAlert: 15,
      location: 'Warehouse Bay E-02',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.products = [prod1, prod2, prod3, prod4, prod5, prod6];

    // 5. Stock Movements
    this.stockMovements = [
      {
        id: 'mov-1',
        productId: prod1.id,
        quantity: 60,
        movementType: 'IN',
        reason: 'Initial Warehouse Inward Stocking',
        userId: warehouse.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'mov-2',
        productId: prod1.id,
        quantity: 15,
        movementType: 'OUT',
        reason: 'Sales Challan CH-202609-0001 Dispatch Confirmation',
        userId: warehouse.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'mov-3',
        productId: prod2.id,
        quantity: 350,
        movementType: 'IN',
        reason: 'Batch Import Shipment from Supplier',
        userId: warehouse.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    // 6. Sales Challans & Items
    const challan1 = {
      id: 'ch-1',
      challanNumber: 'CH-202609-0001',
      customerId: cust1.id,
      userId: sales.id,
      totalQuantity: 15,
      totalAmount: 15 * 12500.0,
      status: 'CONFIRMED',
      notes: 'Dispatched via Express Cargo Truck #GJ-01-AB-9876. LR attached.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    };

    const chItem1 = {
      id: 'chi-1',
      challanId: challan1.id,
      productId: prod1.id,
      productName: prod1.name,
      productSku: prod1.sku,
      unitPrice: prod1.unitPrice,
      quantity: 15,
      totalPrice: 15 * 12500.0,
    };

    const challan2 = {
      id: 'ch-2',
      challanNumber: 'CH-202609-0002',
      customerId: cust2.id,
      userId: sales.id,
      totalQuantity: 30,
      totalAmount: 20 * 420.0 + 10 * 850.0,
      status: 'DRAFT',
      notes: 'Pending final transport schedule from customer.',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const chItem2 = {
      id: 'chi-2',
      challanId: challan2.id,
      productId: prod2.id,
      productName: prod2.name,
      productSku: prod2.sku,
      unitPrice: prod2.unitPrice,
      quantity: 20,
      totalPrice: 20 * 420.0,
    };

    const chItem3 = {
      id: 'chi-3',
      challanId: challan2.id,
      productId: prod5.id,
      productName: prod5.name,
      productSku: prod5.sku,
      unitPrice: prod5.unitPrice,
      quantity: 10,
      totalPrice: 10 * 850.0,
    };

    this.salesChallans = [challan1, challan2];
    this.challanItems = [chItem1, chItem2, chItem3];

    this.initialized = true;
    console.log('⚡ In-Memory Mock Database initialized with realistic wholesale dataset.');
  }

  // Filter helper
  matchWhere(record, where) {
    if (!where) return true;
    for (const key of Object.keys(where)) {
      if (key === 'OR') {
        const orMatches = where.OR.some((clause) => this.matchWhere(record, clause));
        if (!orMatches) return false;
        continue;
      }
      if (key === 'NOT') {
        const notMatches = this.matchWhere(record, where.NOT);
        if (notMatches) return false;
        continue;
      }
      if (key === 'challanNumber' && where.challanNumber?.startsWith) {
        if (!record.challanNumber?.startsWith(where.challanNumber.startsWith)) return false;
        continue;
      }

      const cond = where[key];
      const val = record[key];

      if (cond !== null && typeof cond === 'object') {
        if (cond.contains !== undefined) {
          const targetStr = String(val || '').toLowerCase();
          const queryStr = String(cond.contains).toLowerCase();
          if (!targetStr.includes(queryStr)) return false;
        } else if (cond.in !== undefined) {
          if (!cond.in.includes(val)) return false;
        } else if (cond.not !== undefined) {
          if (cond.not === null && val === null) return false;
          if (val === cond.not) return false;
        }
      } else if (val !== cond) {
        return false;
      }
    }
    return true;
  }
}

const db = new MockDatabase();
await db.seed();

export const prisma = {
  async $connect() {
    return true;
  },
  async $disconnect() {
    return true;
  },
  async $transaction(fn) {
    return fn(prisma);
  },

  user: {
    async findUnique({ where }) {
      if (where.id) return db.users.find((u) => u.id === where.id) || null;
      if (where.email) return db.users.find((u) => u.email.toLowerCase() === where.email.toLowerCase()) || null;
      if (where.supabaseUid) return db.users.find((u) => u.supabaseUid === where.supabaseUid) || null;
      return null;
    },
    async findFirst({ where }) {
      return db.users.find((u) => db.matchWhere(u, where)) || null;
    },
    async findMany({ where, orderBy, select } = {}) {
      let res = db.users.filter((u) => db.matchWhere(u, where));
      if (orderBy?.createdAt === 'desc') res = [...res].reverse();
      if (select) {
        res = res.map((u) => {
          const obj = {};
          for (const k of Object.keys(select)) if (select[k]) obj[k] = u[k];
          return obj;
        });
      }
      return res;
    },
    async count({ where } = {}) {
      return db.users.filter((u) => db.matchWhere(u, where)).length;
    },
    async create({ data }) {
      const newUser = {
        id: `usr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        supabaseUid: data.supabaseUid || null,
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash: data.passwordHash || null,
        role: data.role || 'SALES',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.users.push(newUser);
      return newUser;
    },
    async update({ where, data }) {
      const idx = db.users.findIndex((u) => u.id === where.id);
      if (idx === -1) throw new Error('User not found');
      db.users[idx] = { ...db.users[idx], ...data, updatedAt: new Date() };
      return db.users[idx];
    },
  },

  customer: {
    async findUnique({ where, include }) {
      const c = db.customers.find((item) => item.id === where.id);
      if (!c) return null;
      const res = { ...c };
      if (include?.followUpNotes) {
        res.followUpNotes = db.followUpNotes
          .filter((n) => n.customerId === c.id)
          .map((n) => ({
            ...n,
            user: db.users.find((u) => u.id === n.userId) || { name: 'User', role: 'SALES' },
          }));
      }
      if (include?.challans) {
        res.challans = db.salesChallans.filter((ch) => ch.customerId === c.id);
      }
      return res;
    },
    async findMany({ where, skip = 0, take = 50, orderBy, include } = {}) {
      let res = db.customers.filter((c) => db.matchWhere(c, where));
      if (orderBy?.updatedAt === 'desc' || orderBy?.createdAt === 'desc') res = [...res].reverse();
      const paged = res.slice(skip, skip + take);

      return paged.map((c) => {
        const item = { ...c };
        if (include?._count) {
          item._count = {
            followUpNotes: db.followUpNotes.filter((n) => n.customerId === c.id).length,
            challans: db.salesChallans.filter((ch) => ch.customerId === c.id).length,
          };
        }
        return item;
      });
    },
    async count({ where } = {}) {
      return db.customers.filter((c) => db.matchWhere(c, where)).length;
    },
    async create({ data }) {
      const newCust = {
        id: `cust-${Date.now()}`,
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        businessName: data.businessName,
        gstNumber: data.gstNumber || null,
        customerType: data.customerType || 'WHOLESALE',
        address: data.address,
        status: data.status || 'LEAD',
        followUpDate: data.followUpDate || null,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.customers.unshift(newCust);
      return newCust;
    },
    async update({ where, data }) {
      const idx = db.customers.findIndex((c) => c.id === where.id);
      if (idx === -1) throw new Error('Customer not found');
      db.customers[idx] = { ...db.customers[idx], ...data, updatedAt: new Date() };
      return db.customers[idx];
    },
    async delete({ where }) {
      const idx = db.customers.findIndex((c) => c.id === where.id);
      if (idx === -1) throw new Error('Customer not found');
      const deleted = db.customers.splice(idx, 1)[0];
      return deleted;
    },
  },

  followUpNote: {
    async create({ data, include }) {
      const newNote = {
        id: `note-${Date.now()}`,
        customerId: data.customerId,
        userId: data.userId,
        note: data.note,
        followUpDate: data.followUpDate || null,
        createdAt: new Date(),
      };
      db.followUpNotes.unshift(newNote);
      if (include?.user) {
        newNote.user = db.users.find((u) => u.id === data.userId) || null;
      }
      return newNote;
    },
    async createMany({ data }) {
      for (const d of data) {
        db.followUpNotes.push({ id: `note-${Date.now()}-${Math.random()}`, ...d, createdAt: new Date() });
      }
      return { count: data.length };
    },
  },

  product: {
    async findUnique({ where, include }) {
      let p = null;
      if (where.id) p = db.products.find((item) => item.id === where.id);
      if (where.sku) p = db.products.find((item) => item.sku.toUpperCase() === where.sku.toUpperCase());
      if (!p) return null;
      const res = { ...p };
      if (include?.stockMovements) {
        res.stockMovements = db.stockMovements
          .filter((m) => m.productId === p.id)
          .map((m) => ({
            ...m,
            user: db.users.find((u) => u.id === m.userId) || { name: 'User' },
          }));
      }
      if (include?._count) {
        res._count = {
          challanItems: db.challanItems.filter((ci) => ci.productId === p.id).length,
          stockMovements: db.stockMovements.filter((m) => m.productId === p.id).length,
        };
      }
      return res;
    },
    async findFirst({ where }) {
      return db.products.find((p) => db.matchWhere(p, where)) || null;
    },
    async findMany({ where, skip = 0, take = 50, orderBy, select } = {}) {
      let res = db.products.filter((p) => db.matchWhere(p, where));
      if (orderBy?.createdAt === 'desc') res = [...res].reverse();
      if (select?.distinct || select) {
        // Handle distinct categories
        if (select.category) {
          const cats = [...new Set(db.products.map((p) => p.category))];
          return cats.map((c) => ({ category: c }));
        }
      }
      return res.slice(skip, skip + take);
    },
    async count({ where } = {}) {
      return db.products.filter((p) => db.matchWhere(p, where)).length;
    },
    async create({ data }) {
      const newProd = {
        id: `prod-${Date.now()}`,
        name: data.name,
        sku: data.sku.toUpperCase(),
        category: data.category,
        unitPrice: Number(data.unitPrice),
        currentStock: Number(data.currentStock || 0),
        minStockAlert: Number(data.minStockAlert || 10),
        location: data.location || 'Main Warehouse',
        imageUrl: data.imageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.products.unshift(newProd);
      return newProd;
    },
    async update({ where, data }) {
      const idx = db.products.findIndex((p) => p.id === where.id);
      if (idx === -1) throw new Error('Product not found');
      const p = db.products[idx];

      let newStock = p.currentStock;
      if (data.currentStock !== undefined) {
        if (typeof data.currentStock === 'object' && data.currentStock.decrement !== undefined) {
          newStock -= data.currentStock.decrement;
        } else if (typeof data.currentStock === 'object' && data.currentStock.increment !== undefined) {
          newStock += data.currentStock.increment;
        } else {
          newStock = Number(data.currentStock);
        }
      }

      db.products[idx] = {
        ...p,
        ...data,
        currentStock: newStock,
        unitPrice: data.unitPrice !== undefined ? Number(data.unitPrice) : p.unitPrice,
        updatedAt: new Date(),
      };
      return db.products[idx];
    },
    async delete({ where }) {
      const idx = db.products.findIndex((p) => p.id === where.id);
      if (idx === -1) throw new Error('Product not found');
      return db.products.splice(idx, 1)[0];
    },
  },

  stockMovement: {
    async findMany({ where, skip = 0, take = 50, orderBy, include } = {}) {
      let res = db.stockMovements.filter((m) => {
        if (where?.productId && m.productId !== where.productId) return false;
        if (where?.movementType && m.movementType !== where.movementType) return false;
        if (where?.OR) {
          const p = db.products.find((prod) => prod.id === m.productId);
          const search = where.OR[0].reason?.contains || '';
          const matchReason = m.reason.toLowerCase().includes(search.toLowerCase());
          const matchName = p?.name.toLowerCase().includes(search.toLowerCase());
          const matchSku = p?.sku.toLowerCase().includes(search.toLowerCase());
          if (!matchReason && !matchName && !matchSku) return false;
        }
        return true;
      });

      if (orderBy?.createdAt === 'desc') res = [...res].reverse();
      const paged = res.slice(skip, skip + take);

      return paged.map((m) => {
        const item = { ...m };
        if (include?.product) {
          item.product = db.products.find((p) => p.id === m.productId) || { name: 'Product', sku: 'SKU' };
        }
        if (include?.user) {
          item.user = db.users.find((u) => u.id === m.userId) || { name: 'Warehouse Rep', role: 'WAREHOUSE' };
        }
        return item;
      });
    },
    async count({ where } = {}) {
      return db.stockMovements.length;
    },
    async create({ data, include }) {
      const newMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        productId: data.productId,
        quantity: data.quantity,
        movementType: data.movementType,
        reason: data.reason,
        userId: data.userId,
        createdAt: new Date(),
      };
      db.stockMovements.unshift(newMovement);
      return newMovement;
    },
    async deleteMany({ where }) {
      if (where.productId) {
        db.stockMovements = db.stockMovements.filter((m) => m.productId !== where.productId);
      }
      return { count: 1 };
    },
  },

  salesChallan: {
    async findUnique({ where, include }) {
      const ch = db.salesChallans.find((item) => item.id === where.id || item.challanNumber === where.challanNumber);
      if (!ch) return null;
      const res = { ...ch };
      if (include?.customer) {
        res.customer = db.customers.find((c) => c.id === ch.customerId) || null;
      }
      if (include?.user) {
        res.user = db.users.find((u) => u.id === ch.userId) || null;
      }
      if (include?.items) {
        res.items = db.challanItems.filter((i) => i.challanId === ch.id);
      }
      return res;
    },
    async findFirst({ where, orderBy }) {
      let filtered = db.salesChallans.filter((c) => db.matchWhere(c, where));
      if (orderBy?.challanNumber === 'desc') {
        filtered = filtered.sort((a, b) => b.challanNumber.localeCompare(a.challanNumber));
      }
      return filtered[0] || null;
    },
    async findMany({ where, skip = 0, take = 50, orderBy, include, select } = {}) {
      let res = db.salesChallans.filter((c) => db.matchWhere(c, where));
      if (orderBy?.createdAt === 'desc') res = [...res].reverse();
      const paged = res.slice(skip, skip + take);

      return paged.map((ch) => {
        const item = { ...ch };
        if (include?.customer) {
          item.customer = db.customers.find((c) => c.id === ch.customerId) || null;
        }
        if (include?.user) {
          item.user = db.users.find((u) => u.id === ch.userId) || null;
        }
        if (include?.items) {
          item.items = db.challanItems.filter((i) => i.challanId === ch.id);
        }
        return item;
      });
    },
    async count({ where } = {}) {
      return db.salesChallans.filter((c) => db.matchWhere(c, where)).length;
    },
    async create({ data, include }) {
      const newChallan = {
        id: `ch-${Date.now()}`,
        challanNumber: data.challanNumber,
        customerId: data.customerId,
        userId: data.userId,
        status: data.status || 'DRAFT',
        totalQuantity: data.totalQuantity || 0,
        totalAmount: Number(data.totalAmount || 0),
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.salesChallans.unshift(newChallan);

      if (data.items?.create) {
        for (const item of data.items.create) {
          db.challanItems.push({
            id: `chi-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            challanId: newChallan.id,
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            unitPrice: Number(item.unitPrice),
            quantity: Number(item.quantity),
            totalPrice: Number(item.totalPrice),
          });
        }
      }

      const res = { ...newChallan };
      if (include?.customer) res.customer = db.customers.find((c) => c.id === data.customerId);
      if (include?.user) res.user = db.users.find((u) => u.id === data.userId);
      if (include?.items) res.items = db.challanItems.filter((i) => i.challanId === newChallan.id);

      return res;
    },
    async update({ where, data, include }) {
      const idx = db.salesChallans.findIndex((c) => c.id === where.id);
      if (idx === -1) throw new Error('Challan not found');
      db.salesChallans[idx] = { ...db.salesChallans[idx], ...data, updatedAt: new Date() };

      const res = { ...db.salesChallans[idx] };
      if (include?.customer) res.customer = db.customers.find((c) => c.id === res.customerId);
      if (include?.user) res.user = db.users.find((u) => u.id === res.userId);
      if (include?.items) res.items = db.challanItems.filter((i) => i.challanId === res.id);
      return res;
    },
    async delete({ where }) {
      const idx = db.salesChallans.findIndex((c) => c.id === where.id);
      if (idx === -1) throw new Error('Challan not found');
      return db.salesChallans.splice(idx, 1)[0];
    },
  },

  challanItem: {
    async deleteMany({ where }) {
      if (where.challanId) {
        db.challanItems = db.challanItems.filter((i) => i.challanId !== where.challanId);
      }
      return { count: 1 };
    },
  },
};

export default prisma;
