import { PrismaClient, AdminType, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password', 12);

  // ─── Admins ──────────────────────────────────────────────────
  const admins = [
    { email: 'superadmin@naijagodrop.com', firstName: 'Super',  lastName: 'Admin',  type: AdminType.SYSTEM, role: AdminRole.SUPER_ADMIN },
    { email: 'admin@naijagodrop.com',      firstName: 'Admin',  lastName: 'Admin', type: AdminType.SYSTEM, role: AdminRole.ADMIN },
    { email: 'samson@naijagodrop.com',      firstName: 'Samson',  lastName: 'Admin', type: AdminType.SYSTEM, role: AdminRole.ADMIN },
    { email: 'harrison@naijagodrop.com',      firstName: 'Harrison',  lastName: 'Admin', type: AdminType.SYSTEM, role: AdminRole.ADMIN },
    { email: 'iyke@naijagodrop.com',      firstName: 'Iyke',  lastName: 'Admin', type: AdminType.SYSTEM, role: AdminRole.ADMIN },
  ];

  for (const a of admins) {
    await prisma.admin.upsert({
      where:  { email: a.email },
      update: {},
      create: { ...a, password, isActive: true },
    });
    console.log(`  ✓ [${a.role}] ${a.email}  (password: password)`);
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
      unitPriceKobo: 2_400_000_000, minInvestKobo: 10_000_000, projectedRoiBps: 3400,
      tenureMonths: 24, monthlyPayoutKobo: 18_800_000, targetKobo: 2_400_000_000,
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
