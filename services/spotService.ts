import { NowRequest, NowResponse } from "@vercel/node";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../mongoHelper";
import { validateToken } from "../token";
import { getCursorOffset } from "../utils";

export async function getSpots(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "view:spots");
  const searchObj = user?.marineId ? { marineId: user.marineId } : {};

  const params = getCursorOffset(req);
  const db = await connectToDatabase();
  const response = await db
    .collection("spots")
    .find(searchObj)
    .skip(params.offset)
    .limit(params.limit);
  const data = await response.toArray();
  const total = await response.count();

  return { data, total };
}

export async function getSpotById(req: NowRequest, res: NowResponse) {
  validateToken(req, res);

  const db = await connectToDatabase();
  const response = await db
    .collection("spots")
    .find({ _id: new ObjectId(`${req.query.id}`) });

  return response;
}

export async function createSpot(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res);

  const db = await connectToDatabase();
  const id = await db
    .collection("spots")
    .insertOne({ ...req.body, marineId: new ObjectId(user.marineId) });

  res.json(id.ops[0]);
}
