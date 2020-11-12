import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getUsers() {
  return await prisma.users.findMany({
    include: { vessels: true },
  });
}

export async function getUserById(id: string) {
  return await prisma.users.findOne({
    where: {
      id,
    },
  });
}

export async function createUser(user) {
  return await prisma.users.create({
    data: {
      ...user,
    },
  });
}
