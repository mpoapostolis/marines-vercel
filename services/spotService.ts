import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getSpots(c) {
  const q = `SELECT coords from spots WHERE
  ST_GeogFromText('POINT(${c[0]} ${c[1]})'),
  ST_DWithin(geom,
                 1000, false);
  `;
  return await prisma.$queryRaw(q);
}

export async function createSpot(spotInfo) {
  const { marine_id, ...rest } = spotInfo;
  const data = await prisma.spots.create({
    data: {
      ...rest,
      marines: {
        connect: { id: marine_id },
      },
    },
  });
  await prisma.$queryRaw<any[]>(`
      UPDATE spots SET geom = ST_GeomFromText('POINT(${rest.coords[0]} ${rest.coords[1]})') where id = '${data.id}';
   `);
  return data;
}
