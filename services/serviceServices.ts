import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getServices(id?: string) {
  const qWhere = Boolean(id)
    ? {
        where: {
          marine_id: id,
        },
      }
    : undefined;

  return await prisma.services.findMany(qWhere);
}

export async function createService(vessel) {
  const { marine_id, ...rest } = vessel;
  return await prisma.services.create({
    data: {
      ...rest,
      marine_id,
    },
  });
}
