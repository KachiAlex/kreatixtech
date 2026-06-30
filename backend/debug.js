try {
  const { PrismaClient } = await import('@prisma/client');
  console.log('PrismaClient imported OK');
  const p = new PrismaClient();
  console.log('PrismaClient instantiated OK');
} catch (e) {
  console.log('FAIL:', e.message.substring(0, 200));
}
