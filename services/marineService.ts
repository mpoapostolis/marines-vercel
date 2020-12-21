import { connectToDatabase } from "../mongoHelper";
import { OffsetLimitType } from "../utils";

export async function getMarines(params: OffsetLimitType) {
  const db = await connectToDatabase();
  const response = await db
    .collection("spots")
    .find({})
    .skip(params.offset)
    .limit(params.limit);
  const data = await response.toArray();
  const total = await response.count();

  return { data, total };
}

export async function deleteMarineById(id: string) {
  return await {};
}

export async function createMarine(name: string) {
  return await {};
}
