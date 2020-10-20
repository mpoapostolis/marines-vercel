import { NowRequest, NowResponse } from "@vercel/node";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function (req: NowRequest, res: NowResponse) {
  res.json({
    data: await prisma.marines.findMany({
      select: {
        id: true,
        spots: {
          select: {
            id: true,
          },
        },
      },
    }),
  });
}
