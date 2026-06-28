import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('dikaoliver2660', 10);

  let org = await prisma.organization.findFirst({
    where: { subdomain: 'kreatix-admin' }
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        subdomain: 'kreatix-admin',
        name: 'Kreatix Technologies',
        contactEmail: 'info@kreatixtech.com',
      }
    });
  }

  const user = await prisma.user.create({
    data: {
      email: 'akoma@kreatixtech.com',
      passwordHash: hashedPassword,
      name: 'Akoma',
      role: 'ADMIN',
      orgId: org.id,
    }
  });

  console.log(`✅ Admin created: ${user.email} (ID: ${user.id})`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
