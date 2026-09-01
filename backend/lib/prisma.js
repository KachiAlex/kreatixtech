import { PrismaClient } from '@prisma/client';

let _prisma = null;

function getPrisma() {
  if (!_prisma) {
    _prisma = new PrismaClient();
  }
  return _prisma;
}

const prisma = new Proxy({}, {
  get(_, prop) {
    return getPrisma()[prop];
  }
});

export default prisma;
export { prisma };
