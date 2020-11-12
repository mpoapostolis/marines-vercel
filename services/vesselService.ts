import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getVessels(id?: string) {
  const qWhere = Boolean(id)
    ? {
        where: {
          user_id: id,
        },
      }
    : undefined;
  return await prisma.vessels.findMany(qWhere);
}

export async function createVessel(vessel) {
  const { userId, ...rest } = vessel;
  return await prisma.vessels.create({
    data: {
      ...rest,
      users: {
        connect: {
          id: userId,
        },
      },
    },
  });
}
