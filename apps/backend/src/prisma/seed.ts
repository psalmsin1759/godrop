import { PrismaClient, AdminType, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password', 12);

  // ─── Admins ──────────────────────────────────────────────────
  const admins = [
    { email: 'superadmin@godrop.ng', firstName: 'Super',  lastName: 'Admin',  type: AdminType.SYSTEM, role: AdminRole.SUPER_ADMIN },
    { email: 'admin@godrop.ng',      firstName: 'Tunde',  lastName: 'Okafor', type: AdminType.SYSTEM, role: AdminRole.ADMIN },
  ];

  for (const a of admins) {
    await prisma.admin.upsert({
      where:  { email: a.email },
      update: {},
      create: { ...a, password, isActive: true },
    });
    console.log(`  ✓ [${a.role}] ${a.email}  (password: password)`);
  }

  console.log('\n✅ Done..');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
