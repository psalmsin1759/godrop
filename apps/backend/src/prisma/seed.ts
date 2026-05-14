import { PrismaClient, AdminType, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password', 12);

  const admins = [
    { email: 'superadmin@godrop.ng', firstName: 'Super',  lastName: 'Admin',  type: AdminType.SYSTEM, role: AdminRole.SUPER_ADMIN },
    { email: 'admin@godrop.ng',      firstName: 'Tunde',  lastName: 'Okafor', type: AdminType.SYSTEM, role: AdminRole.ADMIN },
  ];

  for (const a of admins) {
    await prisma.admin.upsert({
      where: { email: a.email },
      update: {},
      create: { ...a, password, isActive: true },
    });
    console.log(`  ✓ [${a.role}] ${a.email}  (password: password)`);
  }

  // ─── Heroes ─────────────────────────────────────────────────
  const heroes = [
    {
      badge: null,
      heading: "GODROP",
      subheading: "Nigeria's On-Demand Delivery Platform",
      align: "center",
      isActive: true,
      sortOrder: 0,
      ctaLabel: null,
      ctaLink: null,
    },
    {
      badge: "🍔  FOOD DELIVERY",
      heading: "Hot Meals,\nFast Drops",
      subheading: "Restaurant favourites at your doorstep in minutes",
      align: "left",
      isActive: true,
      sortOrder: 1,
      ctaLabel: null,
      ctaLink: null,
    },
    {
      badge: "🛒  GROCERY DELIVERY",
      heading: "Fresh Picks,\nDelivered",
      subheading: "Markets & supermarkets, straight to your kitchen",
      align: "left",
      isActive: true,
      sortOrder: 2,
      ctaLabel: null,
      ctaLink: null,
    },
    {
      badge: "📦  PARCEL & RETAIL",
      heading: "Any Package.\nAnywhere.",
      subheading: "From small parcels to large retail orders — we move it",
      align: "left",
      isActive: true,
      sortOrder: 3,
      ctaLabel: null,
      ctaLink: null,
    },
    {
      badge: "🚛  TRUCK BOOKING",
      heading: "Move Homes.\nMove Offices.",
      subheading: "Book a truck for relocation across Lagos & beyond",
      align: "left",
      isActive: true,
      sortOrder: 4,
      ctaLabel: null,
      ctaLink: null,
    },
  ];

  for (const h of heroes) {
    await prisma.hero.upsert({
      where: { id: `seed-hero-${h.sortOrder}` },
      update: h,
      create: { id: `seed-hero-${h.sortOrder}`, ...h },
    });
    console.log(`  ✓ [Hero ${h.sortOrder}] ${h.heading.split('\n')[0]}`);
  }

  console.log('\n✅ Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
