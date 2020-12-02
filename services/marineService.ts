import { PrismaClient } from "@prisma/client";
import { OffsetLimitType } from "../utils";
const prisma = new PrismaClient();

export async function getMarines(params: OffsetLimitType) {
  const data = await prisma.marines.findMany({
    take: params.limit,
    skip: params.offset,
    include: {
      spots: true,
    },
  });
  const total = await prisma.marines.count();
  return {
    data,
    total,
  };
}

export async function getMarineById(id: string) {
  return await prisma.marines.findOne({
    where: {
      id,
    },
  });
}

export async function deleteMarineById(id: string) {
  return await prisma.marines.delete({
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
