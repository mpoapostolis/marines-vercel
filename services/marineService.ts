import { PrismaClient } from "@prisma/client";
import { OffsetLimitType } from "../utils";
const prisma = new PrismaClient();
import faunadb, { query as q } from "faunadb";

var adminClient = new faunadb.Client({
  secret: "fnAD8u47AOACB8eyemkCLFhw8XFJH0jJZcD5DZML",
});

export async function getMarines(params: OffsetLimitType) {
  return await adminClient.query(
    q.Map(
      q.Paginate(q.Match(q.Index("get_all_marines")), {
        size: 10,
      }),
      q.Lambda(
        "ref",
        q.Let(
          {
            ref: q.Get(q.Var("ref")),
          },
          {
            id: q.Select(["ref", "id"], q.Var("ref")),
            name: q.Select(["data", "name"], q.Var("ref")),
          }
        )
      )
    )
  );
}

export async function deleteMarineById(id: string) {
  return await prisma.marines.delete({
    where: {
      id,
    },
  });
}

export async function createMarine(name: string) {
  return await adminClient.query(
    q.Create(q.Collection("marines"), {
      data: { name },
    })
  );
}
