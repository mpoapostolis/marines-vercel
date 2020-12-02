import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getMarines() {
  return await prisma.marines.findMany({
    include: {
      spots: true,
    },
  });
}

export async function getMarineById(id: string) {
  return await prisma.marines.findOne({
    where: {
      id,
    },
  });
}

export async function createMarine(marineName: string) {
  return await prisma.marines.create({
    data: {
      name: marineName,
    },
  });
}
