import { NowRequest, NowResponse } from "@vercel/node";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../helpers/mongoHelper";
import { validateToken } from "../helpers/token";
import { getCursorOffset } from "../helpers/utils";

export async function getMarines(req: NowRequest, res: NowResponse) {
  await validateToken(req, res, "view:marines");
  const params = getCursorOffset(req);

  const db = await connectToDatabase();
  const response = await db
    .collection("marines")
    .find({})
    .skip(params.offset)
    .limit(params.limit);
  const data = await response.toArray();
  const total = await response.count();
  res.json({ data, total });
}

export async function deleteMarineById(req: NowRequest, res: NowResponse) {
  await validateToken(req, res, "edit:marines");
  const db = await connectToDatabase();
  await db.collection("marines").deleteOne({
    _id: new ObjectId(`${req.query.id}`),
  });
  res.status(204).send("marine deletedmarine deleted successfully");
}

export async function getMarineById(req: NowRequest, res: NowResponse) {
  await validateToken(req, res);
  const db = await connectToDatabase();
  const data = await db.collection("marines").findOne({
    _id: new ObjectId(`${req.query.id}`),
  });
  res.json(data);
}

export async function createMarine(req: NowRequest, res: NowResponse) {
  await validateToken(req, res, "edit:marines");
  const db = await connectToDatabase();
  const id = await db.collection("marines").insertOne({ ...req.body });
  res.json(id.ops[0]);
}

export async function updateMarine(req: NowRequest, res: NowResponse) {
  await validateToken(req, res, "edit:marines");
  const db = await connectToDatabase();
  const id = await db.collection("marines").updateOne(
    {
      _id: new ObjectId(`${req.query.id}`),
    },
    { $set: { ...req.body } }
  );
  res.json(id);
}
