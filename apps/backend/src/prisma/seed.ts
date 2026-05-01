import {
  PrismaClient,
  VendorType,
  VendorStatus,
  AdminType,
  AdminRole,
  OrderType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Lagos areas ──────────────────────────────────────────────
const lagosAreas = [
  { address: '14 Admiralty Way, Lekki Phase 1, Lagos', lat: 6.4314, lng: 3.4703 },
  { address: '5 Allen Avenue, Ikeja, Lagos', lat: 6.6018, lng: 3.3515 },
  { address: '22 Bode Thomas Street, Surulere, Lagos', lat: 6.5007, lng: 3.3602 },
  { address: '8 Isaac John Street, GRA Ikeja, Lagos', lat: 6.5983, lng: 3.3437 },
  { address: '3 Ozumba Mbadiwe Avenue, Victoria Island, Lagos', lat: 6.4281, lng: 3.4219 },
  { address: '10 Broad Street, Lagos Island, Lagos', lat: 6.4530, lng: 3.3958 },
  { address: '45 Ogunnusi Road, Ojodu Berger, Lagos', lat: 6.6355, lng: 3.3619 },
  { address: '17 Ago Palace Way, Okota, Lagos', lat: 6.4888, lng: 3.3213 },
  { address: '2 Adetokunbo Ademola Street, Victoria Island, Lagos', lat: 6.4308, lng: 3.4143 },
  { address: '31 Ligali Ayorinde Street, Victoria Island, Lagos', lat: 6.4353, lng: 3.4261 },
  { address: '9 Kusenla Road, Ikate Elegushi, Lekki, Lagos', lat: 6.4445, lng: 3.4826 },
  { address: '12 Awolowo Road, Ikoyi, Lagos', lat: 6.4530, lng: 3.4324 },
  { address: '6 Ogunlana Drive, Surulere, Lagos', lat: 6.4962, lng: 3.3533 },
  { address: '20 Agege Motor Road, Ogba, Lagos', lat: 6.6073, lng: 3.3367 },
  { address: '88 Nnamdi Azikiwe Street, Lagos Island, Lagos', lat: 6.4561, lng: 3.3878 },
  { address: '4 Molade Okoya-Thomas Street, Victoria Island, Lagos', lat: 6.4342, lng: 3.4189 },
  { address: '55 Kofo Abayomi Street, Victoria Island, Lagos', lat: 6.4293, lng: 3.4172 },
  { address: '11 Akin Adesola Street, Victoria Island, Lagos', lat: 6.4321, lng: 3.4228 },
  { address: '7 Coker Road, Ilupeju, Lagos', lat: 6.5620, lng: 3.3628 },
  { address: '3 Toyin Street, Ikeja, Lagos', lat: 6.5985, lng: 3.3480 },
];

const openingHours = {
  monday: { open: '08:00', close: '22:00' },
  tuesday: { open: '08:00', close: '22:00' },
  wednesday: { open: '08:00', close: '22:00' },
  thursday: { open: '08:00', close: '22:00' },
  friday: { open: '08:00', close: '23:00' },
  saturday: { open: '09:00', close: '23:00' },
  sunday: { open: '10:00', close: '21:00' },
};

// ─── Vendors ──────────────────────────────────────────────────
const vendors: Array<{
  type: VendorType;
  name: string;
  description: string;
  cuisines: string[];
  deliveryFeeKobo: number;
  estimatedMinutes: number;
  rating: number;
  ratingCount: number;
  phone: string;
  email: string;
  areaIndex: number;
}> = [
  // ── RESTAURANT × 5 ──────────────────────────────────────────
  {
    type: VendorType.RESTAURANT,
    name: 'Buka by Mama Ngozi',
    description: 'Authentic Nigerian buka serving freshly cooked soups, stews, and swallows daily.',
    cuisines: ['Nigerian', 'Soups', 'Swallow'],
    deliveryFeeKobo: 80000,
    estimatedMinutes: 25,
    rating: 4.7,
    ratingCount: 312,
    phone: '+2348031234001',
    email: 'bukamamangozi@gmail.com',
    areaIndex: 0,
  },
  {
    type: VendorType.RESTAURANT,
    name: 'Suya Republic',
    description: 'Lagos finest suya spot — charcoal-grilled beef, ram, and chicken with spicy yaji.',
    cuisines: ['Suya', 'Grills', 'Nigerian'],
    deliveryFeeKobo: 100000,
    estimatedMinutes: 30,
    rating: 4.8,
    ratingCount: 540,
    phone: '+2348031234002',
    email: 'suyarepublic@gmail.com',
    areaIndex: 1,
  },
  {
    type: VendorType.RESTAURANT,
    name: 'Jollof Junction',
    description: 'Party-style jollof rice, fried rice, and peppered chicken for every occasion.',
    cuisines: ['Nigerian', 'Rice', 'Chicken'],
    deliveryFeeKobo: 90000,
    estimatedMinutes: 35,
    rating: 4.5,
    ratingCount: 228,
    phone: '+2348031234003',
    email: 'jollofjunction@godrop.ng',
    areaIndex: 2,
  },
  {
    type: VendorType.RESTAURANT,
    name: 'Amala Palace',
    description: 'Specialist in amala, ewedu, gbegiri, and assorted meats in Yoruba style.',
    cuisines: ['Yoruba', 'Soups', 'Swallow'],
    deliveryFeeKobo: 75000,
    estimatedMinutes: 20,
    rating: 4.6,
    ratingCount: 189,
    phone: '+2348031234004',
    email: 'amalapalace@gmail.com',
    areaIndex: 3,
  },
  {
    type: VendorType.RESTAURANT,
    name: 'Yellow Chilli Lagos',
    description: 'Upscale Nigerian cuisine — afang, ofe onugbu, and oha soup with premium swallows.',
    cuisines: ['Nigerian', 'Igbo', 'Continental'],
    deliveryFeeKobo: 150000,
    estimatedMinutes: 40,
    rating: 4.9,
    ratingCount: 674,
    phone: '+2348031234005',
    email: 'yellowchillilagos@gmail.com',
    areaIndex: 4,
  },

  // ── GROCERY × 5 ─────────────────────────────────────────────
  {
    type: VendorType.GROCERY,
    name: 'FreshMart Nigeria',
    description: 'Everyday groceries, fresh produce, and household essentials delivered fast.',
    cuisines: [],
    deliveryFeeKobo: 60000,
    estimatedMinutes: 45,
    rating: 4.4,
    ratingCount: 203,
    phone: '+2348031234006',
    email: 'freshmart@godrop.ng',
    areaIndex: 5,
  },
  {
    type: VendorType.GROCERY,
    name: 'Market Square Express',
    description: 'Premium supermarket — imported goods, fresh meats, dairy, and bakery items.',
    cuisines: [],
    deliveryFeeKobo: 80000,
    estimatedMinutes: 50,
    rating: 4.3,
    ratingCount: 145,
    phone: '+2348031234007',
    email: 'marketsquare@gmail.com',
    areaIndex: 6,
  },
  {
    type: VendorType.GROCERY,
    name: 'Mama Put Store',
    description: 'Local market staples — tomatoes, pepper, palm oil, stockfish, and crayfish.',
    cuisines: [],
    deliveryFeeKobo: 50000,
    estimatedMinutes: 30,
    rating: 4.6,
    ratingCount: 388,
    phone: '+2348031234008',
    email: 'mamaputstore@gmail.com',
    areaIndex: 7,
  },
  {
    type: VendorType.GROCERY,
    name: 'GreenBasket Organics',
    description: 'Organic fruits, vegetables, and clean-label pantry goods sourced from local farms.',
    cuisines: [],
    deliveryFeeKobo: 100000,
    estimatedMinutes: 60,
    rating: 4.5,
    ratingCount: 97,
    phone: '+2348031234009',
    email: 'greenbasket@godrop.ng',
    areaIndex: 8,
  },
  {
    type: VendorType.GROCERY,
    name: 'Shoprite Quick',
    description: 'Your neighbourhood Shoprite — weekly groceries, drinks, snacks, and cleaning supplies.',
    cuisines: [],
    deliveryFeeKobo: 70000,
    estimatedMinutes: 40,
    rating: 4.2,
    ratingCount: 511,
    phone: '+2348031234010',
    email: 'shoritequick@shoprite.ng',
    areaIndex: 9,
  },

  // ── RETAIL × 5 ──────────────────────────────────────────────
  {
    type: VendorType.RETAIL,
    name: 'Slot Systems',
    description: 'Smartphones, accessories, and gadgets — authorised reseller for Samsung & Tecno.',
    cuisines: [],
    deliveryFeeKobo: 120000,
    estimatedMinutes: 60,
    rating: 4.4,
    ratingCount: 276,
    phone: '+2348031234011',
    email: 'slot@slotng.com',
    areaIndex: 10,
  },
  {
    type: VendorType.RETAIL,
    name: 'Jumia Express Pickup',
    description: 'Fast-track Jumia orders — electronics, fashion, and home appliances.',
    cuisines: [],
    deliveryFeeKobo: 100000,
    estimatedMinutes: 90,
    rating: 4.1,
    ratingCount: 834,
    phone: '+2348031234012',
    email: 'express@jumia.com.ng',
    areaIndex: 11,
  },
  {
    type: VendorType.RETAIL,
    name: 'Lagos Book Lounge',
    description: 'New and used books, stationery, and educational materials from top publishers.',
    cuisines: [],
    deliveryFeeKobo: 60000,
    estimatedMinutes: 45,
    rating: 4.7,
    ratingCount: 112,
    phone: '+2348031234013',
    email: 'booklounge@gmail.com',
    areaIndex: 12,
  },
  {
    type: VendorType.RETAIL,
    name: 'Addide Stores',
    description: 'Beauty, personal care, baby products, and household goods at market prices.',
    cuisines: [],
    deliveryFeeKobo: 80000,
    estimatedMinutes: 50,
    rating: 4.3,
    ratingCount: 198,
    phone: '+2348031234014',
    email: 'addide@addide.com.ng',
    areaIndex: 13,
  },
  {
    type: VendorType.RETAIL,
    name: 'Konga Mall',
    description: 'Top brands in fashion, electronics, and home décor delivered same day.',
    cuisines: [],
    deliveryFeeKobo: 110000,
    estimatedMinutes: 75,
    rating: 4.0,
    ratingCount: 462,
    phone: '+2348031234015',
    email: 'express@konga.com',
    areaIndex: 14,
  },

  // ── PHARMACY × 5 ────────────────────────────────────────────
  {
    type: VendorType.PHARMACY,
    name: 'HealthPlus Pharmacy',
    description: 'Prescription drugs, OTC medicines, vitamins, and wellness products.',
    cuisines: [],
    deliveryFeeKobo: 50000,
    estimatedMinutes: 30,
    rating: 4.6,
    ratingCount: 341,
    phone: '+2348031234016',
    email: 'orders@healthplus.com.ng',
    areaIndex: 15,
  },
  {
    type: VendorType.PHARMACY,
    name: 'MedPlus Pharmacy',
    description: 'Trusted pharmacy chain with genuine drugs, baby care, and health devices.',
    cuisines: [],
    deliveryFeeKobo: 50000,
    estimatedMinutes: 25,
    rating: 4.5,
    ratingCount: 287,
    phone: '+2348031234017',
    email: 'orders@medplusng.com',
    areaIndex: 16,
  },
  {
    type: VendorType.PHARMACY,
    name: 'Alpha Pharmacy',
    description: 'Community pharmacy — generics, branded drugs, and free pharmacist consultation.',
    cuisines: [],
    deliveryFeeKobo: 40000,
    estimatedMinutes: 20,
    rating: 4.4,
    ratingCount: 153,
    phone: '+2348031234018',
    email: 'alphapharmacy@gmail.com',
    areaIndex: 17,
  },
  {
    type: VendorType.PHARMACY,
    name: 'Drugstoc Express',
    description: 'B2C arm of Drugstoc — fast, authentic pharmaceutical delivery to your door.',
    cuisines: [],
    deliveryFeeKobo: 60000,
    estimatedMinutes: 35,
    rating: 4.7,
    ratingCount: 89,
    phone: '+2348031234019',
    email: 'express@drugstoc.com',
    areaIndex: 18,
  },
  {
    type: VendorType.PHARMACY,
    name: 'Greenlife Pharmacy',
    description: 'Natural health supplements, herbal remedies, and orthodox medicines.',
    cuisines: [],
    deliveryFeeKobo: 55000,
    estimatedMinutes: 30,
    rating: 4.3,
    ratingCount: 121,
    phone: '+2348031234020',
    email: 'greenlife@gmail.com',
    areaIndex: 19,
  },
];

// ─── Helpers ──────────────────────────────────────────────────
function pick<T>(arr: T[], n: number): T {
  return arr[((n % arr.length) + arr.length) % arr.length];
}

function spreadDate(from: Date, to: Date, index: number, total: number): Date {
  const t = total <= 1 ? 0 : index / (total - 1);
  return new Date(from.getTime() + t * (to.getTime() - from.getTime()));
}

// ─── Item pools ───────────────────────────────────────────────
const itemPool: Record<string, Array<{ name: string; unitPriceKobo: number }>> = {
  FOOD: [
    { name: 'Jollof Rice + Chicken', unitPriceKobo: 250000 },
    { name: 'Peppered Goat Meat', unitPriceKobo: 180000 },
    { name: 'Amala + Ewedu + Gbegiri', unitPriceKobo: 220000 },
    { name: 'Fried Rice + Beef', unitPriceKobo: 200000 },
    { name: 'Suya (500g)', unitPriceKobo: 300000 },
    { name: 'Ofada Rice + Ayamase', unitPriceKobo: 280000 },
    { name: 'Pounded Yam + Egusi', unitPriceKobo: 260000 },
  ],
  GROCERY: [
    { name: 'Tomatoes (1kg)', unitPriceKobo: 60000 },
    { name: 'Palm Oil (1L)', unitPriceKobo: 120000 },
    { name: 'Dangote Rice (5kg)', unitPriceKobo: 400000 },
    { name: 'Chicken (whole)', unitPriceKobo: 550000 },
    { name: 'Groundnut Oil (2L)', unitPriceKobo: 280000 },
    { name: 'Garri (5kg)', unitPriceKobo: 200000 },
    { name: 'Indomie Carton', unitPriceKobo: 350000 },
  ],
  RETAIL: [
    { name: 'Tecno Camon 20', unitPriceKobo: 9500000 },
    { name: 'Samsung Galaxy A14', unitPriceKobo: 7500000 },
    { name: 'Wireless Earbuds', unitPriceKobo: 1800000 },
    { name: 'Laptop Bag', unitPriceKobo: 850000 },
    { name: 'USB-C Charger (65W)', unitPriceKobo: 450000 },
    { name: 'Power Bank (20,000mAh)', unitPriceKobo: 2500000 },
    { name: 'Phone Case', unitPriceKobo: 150000 },
  ],
  PHARMACY: [
    { name: 'Paracetamol 500mg (x10)', unitPriceKobo: 35000 },
    { name: 'Amoxicillin 500mg (x21)', unitPriceKobo: 180000 },
    { name: 'Vitamin C 1000mg (x30)', unitPriceKobo: 250000 },
    { name: 'Omeprazole 20mg (x14)', unitPriceKobo: 120000 },
    { name: 'Loratadine 10mg (x10)', unitPriceKobo: 60000 },
    { name: 'Metformin 500mg (x30)', unitPriceKobo: 150000 },
    { name: 'Multivitamin (x30)', unitPriceKobo: 200000 },
  ],
};

const vendorsByType: Record<string, string[]> = {
  FOOD: ['seed-vendor-1', 'seed-vendor-2', 'seed-vendor-3', 'seed-vendor-4', 'seed-vendor-5'],
  GROCERY: ['seed-vendor-6', 'seed-vendor-7', 'seed-vendor-8', 'seed-vendor-9', 'seed-vendor-10'],
  RETAIL: ['seed-vendor-11', 'seed-vendor-12', 'seed-vendor-13', 'seed-vendor-14', 'seed-vendor-15'],
  PHARMACY: ['seed-vendor-16', 'seed-vendor-17', 'seed-vendor-18', 'seed-vendor-19', 'seed-vendor-20'],
};

const deliveryFeeByVendor: Record<string, number> = {
  'seed-vendor-1': 80000,
  'seed-vendor-2': 100000,
  'seed-vendor-3': 90000,
  'seed-vendor-4': 75000,
  'seed-vendor-5': 150000,
  'seed-vendor-6': 60000,
  'seed-vendor-7': 80000,
  'seed-vendor-8': 50000,
  'seed-vendor-9': 100000,
  'seed-vendor-10': 70000,
  'seed-vendor-11': 120000,
  'seed-vendor-12': 100000,
  'seed-vendor-13': 60000,
  'seed-vendor-14': 80000,
  'seed-vendor-15': 110000,
  'seed-vendor-16': 50000,
  'seed-vendor-17': 50000,
  'seed-vendor-18': 40000,
  'seed-vendor-19': 60000,
  'seed-vendor-20': 55000,
};

function getOrderType(n: number): OrderType {
  if (n % 50 === 0) return OrderType.TRUCK;
  if (n % 20 === 0) return OrderType.PARCEL;
  const mod = n % 10;
  if (mod < 4) return OrderType.FOOD;
  if (mod < 7) return OrderType.GROCERY;
  if (mod < 9) return OrderType.RETAIL;
  return OrderType.PHARMACY;
}

function getStatus(periodIndex: number, i: number): OrderStatus {
  if (periodIndex < 3) {
    return i % 8 === 0 ? OrderStatus.CANCELLED : OrderStatus.DELIVERED;
  }
  const mod = i % 7;
  if (mod === 0) return OrderStatus.PENDING;
  if (mod === 1) return OrderStatus.ACCEPTED;
  if (mod === 2) return OrderStatus.PREPARING;
  if (mod === 3) return OrderStatus.IN_TRANSIT;
  if (mod === 4) return OrderStatus.CANCELLED;
  return OrderStatus.DELIVERED;
}

function getPaymentStatus(status: OrderStatus, i: number): PaymentStatus {
  if (status === OrderStatus.DELIVERED) return PaymentStatus.PAID;
  if (status === OrderStatus.CANCELLED) return i % 2 === 0 ? PaymentStatus.PENDING : PaymentStatus.FAILED;
  return PaymentStatus.PENDING;
}

function getPaymentMethod(i: number): PaymentMethod {
  const mod = i % 10;
  if (mod < 5) return PaymentMethod.CARD;
  if (mod < 8) return PaymentMethod.WALLET;
  return PaymentMethod.CASH;
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('Seeding admins...');

  const devPassword = await bcrypt.hash('password', 12);

  console.log('\nSeeding vendors...');
  for (const v of vendors) {
    const area = lagosAreas[v.areaIndex];
    await prisma.vendor.upsert({
      where: { id: `seed-vendor-${v.areaIndex + 1}` },
      update: {},
      create: {
        id: `seed-vendor-${v.areaIndex + 1}`,
        type: v.type,
        status: VendorStatus.APPROVED,
        name: v.name,
        description: v.description,
        address: area.address,
        lat: area.lat,
        lng: area.lng,
        phone: v.phone,
        email: v.email,
        cuisines: v.cuisines,
        rating: v.rating,
        ratingCount: v.ratingCount,
        deliveryFeeKobo: v.deliveryFeeKobo,
        estimatedMinutes: v.estimatedMinutes,
        isOpen: true,
        isActive: true,
        openingHours,
      },
    });
    console.log(`  ✓ ${v.type} — ${v.name}`);
  }

  const admins = [
    {
      email: 'superadmin@godrop.ng',
      firstName: 'Super',
      lastName: 'Admin',
      type: AdminType.SYSTEM,
      role: AdminRole.SUPER_ADMIN,
      vendorId: null,
    },
    {
      email: 'admin@godrop.ng',
      firstName: 'Tunde',
      lastName: 'Okafor',
      type: AdminType.SYSTEM,
      role: AdminRole.ADMIN,
      vendorId: null,
    },
    {
      email: 'vendor.owner@godrop.ng',
      firstName: 'Ngozi',
      lastName: 'Eze',
      type: AdminType.VENDOR,
      role: AdminRole.OWNER,
      vendorId: 'seed-vendor-1',
    },
  ];

  for (const a of admins) {
    await prisma.admin.upsert({
      where: { email: a.email },
      update: {},
      create: { ...a, password: devPassword, isActive: true },
    });
    console.log(`  ✓ [${a.role}] ${a.email}`);
  }

  console.log('\nSeeding truck types...');
  const truckTypes = [
    {
      name: 'Mini Van',
      description: 'Ideal for medium deliveries and bulk orders',
      capacity: 'Up to 500kg',
      baseFeeKobo: 500000,
      perKmKobo: 80000,
    },
    {
      name: 'Pickup Truck',
      description: 'Suitable for furniture and medium logistics',
      capacity: 'Up to 1 ton',
      baseFeeKobo: 800000,
      perKmKobo: 120000,
    },
    {
      name: 'Box Truck',
      description: 'For large goods and business deliveries',
      capacity: 'Up to 3 tons',
      baseFeeKobo: 1500000,
      perKmKobo: 200000,
    },
    {
      name: 'Trailer',
      description: 'Heavy-duty haulage and relocation',
      capacity: 'Up to 10+ tons',
      baseFeeKobo: 3000000,
      perKmKobo: 350000,
    },
  ];

  for (const t of truckTypes) {
    await prisma.truckType.upsert({
      where: { name: t.name },
      update: {},
      create: { ...t, isActive: true },
    });
    console.log(`  ✓ Truck — ${t.name}`);
  }

  // ── Customers ─────────────────────────────────────────────────
  console.log('\nSeeding customers...');

  const customerDefs = [
    { phone: '+2348011111101', firstName: 'Adaeze',   lastName: 'Okonkwo',    email: 'adaeze.okonkwo@gmail.com',      walletKobo: 500000 },
    { phone: '+2348011111102', firstName: 'Tunde',    lastName: 'Balogun',    email: 'tunde.balogun@yahoo.com',       walletKobo: 150000 },
    { phone: '+2348011111103', firstName: 'Ngozi',    lastName: 'Chibuike',   email: 'ngozi.chibuike@gmail.com',      walletKobo: 800000 },
    { phone: '+2348011111104', firstName: 'Emeka',    lastName: 'Eze',        email: 'emeka.eze@outlook.com',         walletKobo: 250000 },
    { phone: '+2348011111105', firstName: 'Fatima',   lastName: 'Abdullahi',  email: 'fatima.abdullahi@gmail.com',    walletKobo: 0 },
    { phone: '+2348011111106', firstName: 'Chidi',    lastName: 'Nwosu',      email: 'chidi.nwosu@gmail.com',         walletKobo: 1200000 },
    { phone: '+2348011111107', firstName: 'Amina',    lastName: 'Yusuf',      email: 'amina.yusuf@hotmail.com',       walletKobo: 350000 },
    { phone: '+2348011111108', firstName: 'Seun',     lastName: 'Adeleke',    email: 'seun.adeleke@gmail.com',        walletKobo: 750000 },
    { phone: '+2348011111109', firstName: 'Blessing', lastName: 'Obi',        email: 'blessing.obi@gmail.com',        walletKobo: 100000 },
    { phone: '+2348011111110', firstName: 'Kayode',   lastName: 'Adeyemi',    email: 'kayode.adeyemi@gmail.com',      walletKobo: 2000000 },
    { phone: '+2348011111111', firstName: 'Chisom',   lastName: 'Okeke',      email: 'chisom.okeke@outlook.com',      walletKobo: 450000 },
    { phone: '+2348011111112', firstName: 'Musa',     lastName: 'Ibrahim',    email: 'musa.ibrahim@gmail.com',        walletKobo: 0 },
    { phone: '+2348011111113', firstName: 'Taiwo',    lastName: 'Akinwale',   email: 'taiwo.akinwale@gmail.com',      walletKobo: 600000 },
    { phone: '+2348011111114', firstName: 'Chidinma', lastName: 'Okafor',     email: 'chidinma.okafor@yahoo.com',     walletKobo: 300000 },
    { phone: '+2348011111115', firstName: 'Bode',     lastName: 'Olawale',    email: 'bode.olawale@gmail.com',        walletKobo: 50000 },
    { phone: '+2348011111116', firstName: 'Nkiruka',  lastName: 'Onyeka',     email: 'nkiruka.onyeka@gmail.com',      walletKobo: 1500000 },
    { phone: '+2348011111117', firstName: 'Usman',    lastName: 'Garba',      email: 'usman.garba@gmail.com',         walletKobo: 0 },
    { phone: '+2348011111118', firstName: 'Funke',    lastName: 'Olatunji',   email: 'funke.olatunji@hotmail.com',    walletKobo: 900000 },
    { phone: '+2348011111119', firstName: 'Ikenna',   lastName: 'Nwachukwu',  email: 'ikenna.nwachukwu@gmail.com',   walletKobo: 400000 },
    { phone: '+2348011111120', firstName: 'Yetunde',  lastName: 'Fasanya',    email: 'yetunde.fasanya@gmail.com',     walletKobo: 700000 },
  ];

  const customerIds: string[] = [];
  for (const c of customerDefs) {
    const refCode = `REF-${c.firstName.slice(0, 3).toUpperCase()}${c.lastName.slice(0, 3).toUpperCase()}`;
    const user = await prisma.user.upsert({
      where: { phone: c.phone },
      update: {},
      create: {
        phone: c.phone,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        isVerified: true,
        referralCode: refCode,
        wallet: { create: { balanceKobo: c.walletKobo } },
      },
    });
    customerIds.push(user.id);
    console.log(`  ✓ Customer — ${c.firstName} ${c.lastName}`);
  }

  // ── Riders ────────────────────────────────────────────────────
  console.log('\nSeeding riders...');

  const riderDefs = [
    { phone: '+2348022222201', firstName: 'Tayo',     lastName: 'Adesanya',  vehicleType: 'motorcycle', vehiclePlate: 'LSD-234-AA', lat: 6.4314, lng: 3.4703, rating: 4.8, ratingCount: 245 },
    { phone: '+2348022222202', firstName: 'Emeka',    lastName: 'Obiora',    vehicleType: 'motorcycle', vehiclePlate: 'LSD-187-BB', lat: 6.6018, lng: 3.3515, rating: 4.6, ratingCount: 183 },
    { phone: '+2348022222203', firstName: 'Kabiru',   lastName: 'Lawal',     vehicleType: 'motorcycle', vehiclePlate: 'LSD-093-CC', lat: 6.5007, lng: 3.3602, rating: 4.7, ratingCount: 312 },
    { phone: '+2348022222204', firstName: 'Sunday',   lastName: 'Okonkwo',   vehicleType: 'motorcycle', vehiclePlate: 'LSD-541-DD', lat: 6.4281, lng: 3.4219, rating: 4.5, ratingCount: 127 },
    { phone: '+2348022222205', firstName: 'Babatunde',lastName: 'Idowu',     vehicleType: 'motorcycle', vehiclePlate: 'LSD-762-EE', lat: 6.4530, lng: 3.4324, rating: 4.9, ratingCount: 498 },
    { phone: '+2348022222206', firstName: 'Chukwudi', lastName: 'Obi',       vehicleType: 'motorcycle', vehiclePlate: 'LSD-318-FF', lat: 6.4530, lng: 3.3958, rating: 4.4, ratingCount: 89 },
    { phone: '+2348022222207', firstName: 'Adamu',    lastName: 'Sule',      vehicleType: 'motorcycle', vehiclePlate: 'LSD-459-GG', lat: 6.6355, lng: 3.3619, rating: 4.6, ratingCount: 201 },
    { phone: '+2348022222208', firstName: 'Gbenga',   lastName: 'Oluwole',   vehicleType: 'motorcycle', vehiclePlate: 'LSD-874-HH', lat: 6.4888, lng: 3.3213, rating: 4.3, ratingCount: 156 },
    { phone: '+2348022222209', firstName: 'Seyi',     lastName: 'Adegoke',   vehicleType: 'van',        vehiclePlate: 'LSD-112-II', lat: 6.4308, lng: 3.4143, rating: 4.7, ratingCount: 94 },
    { phone: '+2348022222210', firstName: 'Nnamdi',   lastName: 'Eze',       vehicleType: 'van',        vehiclePlate: 'LSD-663-JJ', lat: 6.4445, lng: 3.4826, rating: 4.5, ratingCount: 77 },
    { phone: '+2348022222211', firstName: 'Ibrahim',  lastName: 'Mohammed',  vehicleType: 'motorcycle', vehiclePlate: 'LSD-295-KK', lat: 6.5983, lng: 3.3437, rating: 4.8, ratingCount: 334 },
    { phone: '+2348022222212', firstName: 'Olumide',  lastName: 'Afolabi',   vehicleType: 'motorcycle', vehiclePlate: 'LSD-726-LL', lat: 6.5620, lng: 3.3628, rating: 4.6, ratingCount: 218 },
    { phone: '+2348022222213', firstName: 'Rasheed',  lastName: 'Salami',    vehicleType: 'van',        vehiclePlate: 'LSD-481-MM', lat: 6.5007, lng: 3.3602, rating: 4.4, ratingCount: 63 },
    { phone: '+2348022222214', firstName: 'Godwin',   lastName: 'Okpara',    vehicleType: 'motorcycle', vehiclePlate: 'LSD-937-NN', lat: 6.4561, lng: 3.3878, rating: 4.7, ratingCount: 289 },
    { phone: '+2348022222215', firstName: 'Uche',     lastName: 'Nwosu',     vehicleType: 'van',        vehiclePlate: 'LSD-554-OO', lat: 6.4962, lng: 3.3533, rating: 4.5, ratingCount: 142 },
  ];

  const riderIds: string[] = [];
  for (const r of riderDefs) {
    const rider = await prisma.rider.upsert({
      where: { phone: r.phone },
      update: {},
      create: {
        firstName: r.firstName,
        lastName: r.lastName,
        phone: r.phone,
        vehicleType: r.vehicleType,
        vehiclePlate: r.vehiclePlate,
        lat: r.lat,
        lng: r.lng,
        isAvailable: true,
        isActive: true,
        rating: r.rating,
        ratingCount: r.ratingCount,
      },
    });
    riderIds.push(rider.id);
    console.log(`  ✓ Rider — ${r.firstName} ${r.lastName} (${r.vehicleType})`);
  }

  // ── Orders ────────────────────────────────────────────────────
  console.log('\nSeeding orders...');

  const miniVan = await prisma.truckType.findUnique({ where: { name: 'Mini Van' } });
  const pickupTruck = await prisma.truckType.findUnique({ where: { name: 'Pickup Truck' } });
  const truckTypeIds = [miniVan!.id, pickupTruck!.id];

  const periods = [
    { from: new Date('2026-01-01T07:00:00Z'), to: new Date('2026-01-31T20:00:00Z'), count: 35, index: 0 },
    { from: new Date('2026-02-01T07:00:00Z'), to: new Date('2026-02-28T20:00:00Z'), count: 40, index: 1 },
    { from: new Date('2026-03-01T07:00:00Z'), to: new Date('2026-03-31T20:00:00Z'), count: 45, index: 2 },
    { from: new Date('2026-04-01T07:00:00Z'), to: new Date('2026-04-25T18:00:00Z'), count: 35, index: 3 },
  ];

  let orderCounter = 1;
  let totalOrders = 0;

  for (const period of periods) {
    for (let i = 0; i < period.count; i++) {
      const date = spreadDate(period.from, period.to, i, period.count);
      const type = getOrderType(orderCounter);
      const status = getStatus(period.index, i);
      const paymentStatus = getPaymentStatus(status, i);
      const paymentMethod = getPaymentMethod(i);

      const customerId = customerIds[orderCounter % customerIds.length];
      const needsRider = status !== OrderStatus.PENDING && status !== OrderStatus.CANCELLED;
      const riderId = needsRider ? riderIds[orderCounter % riderIds.length] : null;

      const pickupArea = pick(lagosAreas, orderCounter);
      const dropoffArea = pick(lagosAreas, orderCounter + 3);

      let vendorId: string | null = null;
      let truckTypeId: string | null = null;
      let items: Array<{ name: string; unitPriceKobo: number; quantity: number; totalKobo: number }> = [];
      let deliveryFeeKobo = 0;

      if (type === OrderType.TRUCK) {
        truckTypeId = truckTypeIds[i % truckTypeIds.length];
        deliveryFeeKobo = 800000 + (i % 5) * 200000;
      } else if (type === OrderType.PARCEL) {
        deliveryFeeKobo = 250000 + (i % 4) * 80000;
      } else {
        vendorId = pick(vendorsByType[type], orderCounter);
        deliveryFeeKobo = deliveryFeeByVendor[vendorId] ?? 80000;

        const pool = itemPool[type] ?? [];
        const itemCount = (i % 3) + 1;
        for (let j = 0; j < itemCount; j++) {
          const template = pick(pool, orderCounter + j);
          const qty = j === 0 ? ((i % 2) + 1) : 1;
          items.push({
            name: template.name,
            unitPriceKobo: template.unitPriceKobo,
            quantity: qty,
            totalKobo: template.unitPriceKobo * qty,
          });
        }
      }

      const subtotalKobo = items.reduce((s, item) => s + item.totalKobo, 0);
      const serviceFeeKobo = Math.max(50000, Math.floor(subtotalKobo * 0.05));
      const totalKobo = subtotalKobo + deliveryFeeKobo + serviceFeeKobo;
      const trackingCode = `GD-${String(orderCounter).padStart(7, '0')}`;

      let estimatedMinutes = 35;
      if (type === OrderType.TRUCK) estimatedMinutes = 180;
      else if (type === OrderType.PARCEL) estimatedMinutes = 60;
      else if (type === OrderType.GROCERY) estimatedMinutes = 45;

      await prisma.order.create({
        data: {
          trackingCode,
          customerId,
          type,
          status,
          vendorId,
          truckTypeId,
          pickupAddress: pickupArea.address,
          pickupLat: pickupArea.lat,
          pickupLng: pickupArea.lng,
          dropoffAddress: dropoffArea.address,
          dropoffLat: dropoffArea.lat,
          dropoffLng: dropoffArea.lng,
          riderId,
          paymentMethod,
          paymentStatus,
          subtotalKobo,
          deliveryFeeKobo,
          serviceFeeKobo,
          discountKobo: 0,
          totalKobo,
          estimatedMinutes,
          createdAt: date,
          updatedAt: date,
          items: items.length > 0
            ? { create: items.map(item => ({ name: item.name, unitPriceKobo: item.unitPriceKobo, quantity: item.quantity, totalKobo: item.totalKobo })) }
            : undefined,
          events: {
            create: [{ status, createdAt: date }],
          },
        },
      });

      orderCounter++;
      totalOrders++;
    }
    console.log(`  ✓ Period ${period.index + 1} — ${period.count} orders`);
  }

  console.log(`\n✅ Done. Seeded: ${vendors.length} vendors, ${admins.length} admins, ${truckTypes.length} truck types, ${customerDefs.length} customers, ${riderDefs.length} riders, ${totalOrders} orders.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
