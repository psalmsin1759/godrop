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

  console.log('\n✅ Done..');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
