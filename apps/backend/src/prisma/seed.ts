import { PrismaClient, AdminType, VendorType, VendorStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── RBAC: default role templates ────────────────────────────────
// Global (vendorId/businessId null), isDefault: true — every vendor/
// business can assign these out of the box, and can create additional
// roles scoped to just their own team from the dashboard.
const DEFAULT_ROLES: {
  name: string;
  type: AdminType;
  permissions: string[];
  description: string;
}[] = [
  // SYSTEM
  { name: 'Super Admin', type: AdminType.SYSTEM, permissions: ['*'], description: 'Full platform access' },
  {
    name: 'Operations Admin', type: AdminType.SYSTEM,
    permissions: ['orders:read', 'orders:write', 'riders:read', 'riders:write', 'riders:payouts', 'trucks:read', 'trucks:write', 'parcels:read', 'parcels:write', 'vendors:read'],
    description: 'Day-to-day logistics: orders, riders, trucks, parcels',
  },
  {
    name: 'Support Admin', type: AdminType.SYSTEM,
    permissions: ['customers:read', 'customers:write', 'disputes:read', 'disputes:write', 'otp:issue', 'orders:read'],
    description: 'Customer support and dispute resolution',
  },
  {
    name: 'Finance Admin', type: AdminType.SYSTEM,
    permissions: ['vendors:read', 'riders:payouts', 'analytics:read', 'audit_logs:read'],
    description: 'Payouts and financial oversight',
  },
  {
    name: 'Marketing Admin', type: AdminType.SYSTEM,
    permissions: ['heroes:write', 'banners:write', 'coupons:write', 'messaging:send', 'push:send'],
    description: 'Growth and marketing tools',
  },
  {
    name: 'Analytics Admin', type: AdminType.SYSTEM,
    permissions: ['analytics:read', 'audit_logs:read'],
    description: 'Read-only analytics and audit oversight',
  },
  // VENDOR
  { name: 'Owner', type: AdminType.VENDOR, permissions: ['*'], description: 'Full vendor account access' },
  {
    name: 'Manager', type: AdminType.VENDOR,
    permissions: ['orders:read', 'orders:write', 'catalog:read', 'catalog:write', 'wallet:read', 'disputes:read', 'disputes:write', 'analytics:read', 'audit_logs:read', 'team:read'],
    description: 'Runs day-to-day operations, no settings/team changes',
  },
  {
    name: 'Staff', type: AdminType.VENDOR,
    permissions: ['orders:read', 'orders:write', 'catalog:read', 'catalog:write', 'disputes:read', 'disputes:write'],
    description: 'Order and catalogue handling only',
  },
  // BUSINESS
  { name: 'Owner', type: AdminType.BUSINESS, permissions: ['*'], description: 'Full business account access' },
  {
    name: 'Manager', type: AdminType.BUSINESS,
    permissions: ['riders:read', 'riders:write', 'wallet:read', 'team:read', 'business:write'],
    description: 'Manages riders and business profile',
  },
  {
    name: 'Staff', type: AdminType.BUSINESS,
    permissions: ['riders:read', 'team:read'],
    description: 'Read-only rider/team visibility',
  },
];

async function main() {
  const password = await bcrypt.hash('password', 12);

  // ─── RBAC roles ────────────────────────────────────────────────
  const roleIds: Record<string, string> = {};
  for (const r of DEFAULT_ROLES) {
    const existing = await prisma.role.findFirst({ where: { name: r.name, type: r.type, vendorId: null, businessId: null } });
    const role = existing
      ? await prisma.role.update({ where: { id: existing.id }, data: { permissions: r.permissions, description: r.description, isDefault: true } })
      : await prisma.role.create({ data: { name: r.name, type: r.type, permissions: r.permissions, description: r.description, isDefault: true } });
    roleIds[`${r.type}:${r.name}`] = role.id;
    console.log(`  ✓ [role] ${r.type} · ${r.name}`);
  }

  // ─── Demo Vendor + Business (FK targets for demo admins) ────────
  let demoVendor = await prisma.vendor.findFirst({ where: { name: 'Godrop Demo Kitchen' } });
  if (!demoVendor) {
    demoVendor = await prisma.vendor.create({
      data: {
        type: VendorType.RESTAURANT,
        status: VendorStatus.APPROVED,
        name: 'Godrop Demo Kitchen',
        address: '12 Admiralty Way, Lekki Phase 1, Lagos',
        lat: 6.4406,
        lng: 3.4531,
        phone: '+2348000000001',
        email: 'demo-vendor@naijagodrop.com',
        isActive: true,
      },
    });
    console.log('  ✓ [vendor] Godrop Demo Kitchen');
  }

  let demoBusiness = await prisma.business.findFirst({ where: { name: 'Godrop Demo Fleet' } });
  if (!demoBusiness) {
    demoBusiness = await prisma.business.create({
      data: {
        name: 'Godrop Demo Fleet',
        email: 'demo-business@naijagodrop.com',
        phone: '+2348000000002',
        address: '4 Admiralty Way, Lekki Phase 1, Lagos',
        serviceAreas: [],
      },
    });
    console.log('  ✓ [business] Godrop Demo Fleet');
  }

  // ─── Admins ──────────────────────────────────────────────────
  const admins: { email: string; firstName: string; lastName: string; type: AdminType; roleId: string; isOwner?: boolean; vendorId?: string; businessId?: string }[] = [
    { email: 'superadmin@naijagodrop.com', firstName: 'Super',    lastName: 'Admin',    type: AdminType.SYSTEM, roleId: roleIds['SYSTEM:Super Admin'] },
    { email: 'admin@naijagodrop.com',      firstName: 'Admin',    lastName: 'Admin',    type: AdminType.SYSTEM, roleId: roleIds['SYSTEM:Operations Admin'] },
    { email: 'samson@naijagodrop.com',     firstName: 'Samson',   lastName: 'Admin',    type: AdminType.SYSTEM, roleId: roleIds['SYSTEM:Operations Admin'] },
    { email: 'harrison@naijagodrop.com',   firstName: 'Harrison', lastName: 'Admin',    type: AdminType.SYSTEM, roleId: roleIds['SYSTEM:Support Admin'] },
    { email: 'iyke@naijagodrop.com',       firstName: 'Iyke',     lastName: 'Admin',    type: AdminType.SYSTEM, roleId: roleIds['SYSTEM:Marketing Admin'] },
    { email: 'vendor-owner@naijagodrop.com',   firstName: 'Vendor',   lastName: 'Owner', type: AdminType.VENDOR,   roleId: roleIds['VENDOR:Owner'],   isOwner: true, vendorId: demoVendor.id },
    { email: 'business-owner@naijagodrop.com', firstName: 'Business', lastName: 'Owner', type: AdminType.BUSINESS, roleId: roleIds['BUSINESS:Owner'], isOwner: true, businessId: demoBusiness.id },
  ];

  for (const a of admins) {
    await prisma.admin.upsert({
      where:  { email: a.email },
      update: { roleId: a.roleId, isOwner: a.isOwner ?? false },
      create: { ...a, password, isActive: true },
    });
    console.log(`  ✓ [${a.type}] ${a.email}  (password: password)`);
  }

  // ─── Invest: vehicle assets ──────────────────────────────────
  const assets = [
    {
      name: 'Keke NAPEP', shortCode: 'KEKE · CLASS A', vehicleClass: 'KEKE' as const,
      description: 'Passenger tricycle · Lagos routes', location: 'Lagos',
      unitPriceKobo: 85_000_000, minInvestKobo: 5_000_000, projectedRoiBps: 3200,
      tenureMonths: 12, monthlyPayoutKobo: 7_240_000, targetKobo: 85_000_000,
      slotsTotal: 20, slotsLeft: 6, isHot: true,
    },
    {
      name: 'City Shuttle', shortCode: 'SHUTTLE · 14-SEAT', vehicleClass: 'SHUTTLE' as const,
      description: '14-seat commuter bus', location: 'Lagos',
      unitPriceKobo: 1_850_000_000, minInvestKobo: 10_000_000, projectedRoiBps: 3800,
      tenureMonths: 18, monthlyPayoutKobo: 14_600_000, targetKobo: 1_850_000_000,
      slotsTotal: 30, slotsLeft: 14, isHot: false,
    },
    {
      name: 'Ride Car', shortCode: 'RIDE-HAIL · SEDAN', vehicleClass: 'RIDE_CAR' as const,
      description: 'Ride-hailing sedan', location: 'Lagos',
      // Kept under Postgres INT4's ~₦21.4M kobo ceiling (unitPriceKobo/targetKobo are `Int` columns) — 2.4bn kobo overflowed it.
      unitPriceKobo: 1_800_000_000, minInvestKobo: 10_000_000, projectedRoiBps: 3400,
      tenureMonths: 24, monthlyPayoutKobo: 14_100_000, targetKobo: 1_800_000_000,
      slotsTotal: 40, slotsLeft: 20, isHot: false,
    },
    {
      name: 'Dispatch Bike', shortCode: 'DISPATCH · COURIER', vehicleClass: 'BIKE' as const,
      description: 'Courier dispatch motorcycle', location: 'Lagos',
      unitPriceKobo: 68_000_000, minInvestKobo: 4_000_000, projectedRoiBps: 3000,
      tenureMonths: 12, monthlyPayoutKobo: 5_780_000, targetKobo: 68_000_000,
      slotsTotal: 12, slotsLeft: 3, isHot: true,
    },
  ];
  for (const a of assets) {
    const existing = await prisma.investmentAsset.findFirst({ where: { name: a.name } });
    if (!existing) {
      await prisma.investmentAsset.create({
        data: { ...a, raisedKobo: Math.round(a.targetKobo * (1 - a.slotsLeft / a.slotsTotal)) },
      });
      console.log(`  ✓ [asset] ${a.name}`);
    }
  }

  // ─── Invest: plans ───────────────────────────────────────────
  const plans = [
    { name: 'Starter', tenureMonths: 6,  monthlyRateBps: 420, minAmountKobo: 5_000_000,   note: 'Short lock, steady payout', isPopular: false, sortOrder: 1 },
    { name: 'Rider',   tenureMonths: 12, monthlyRateBps: 540, minAmountKobo: 25_000_000,  note: 'Most popular · best balance', isPopular: true, sortOrder: 2 },
    { name: 'Fleet',   tenureMonths: 18, monthlyRateBps: 610, minAmountKobo: 100_000_000, note: 'Highest return, longer lock', isPopular: false, sortOrder: 3 },
  ];
  for (const p of plans) {
    const existing = await prisma.investmentPlan.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.investmentPlan.create({ data: p });
      console.log(`  ✓ [plan] ${p.name}`);
    }
  }

  console.log('\n✅ Done..');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
