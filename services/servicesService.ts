import { NowRequest, NowResponse } from "@vercel/node";
import { ObjectId } from "mongodb";

import { connectToDatabase } from "../helpers/mongoHelper";
import { validateToken } from "../helpers/token";
import { getCursorOffset } from "../helpers/utils";

async function getServiceById(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "view:services");

  const db = await connectToDatabase();
  const data = await db.collection("services").findOne({
    _id: new ObjectId(`${req.query.id}`),
    $or: [{ marineId: new ObjectId(user.marineId) }, { marineId: "public" }],
  });
  res.json(data);
}

export async function getServices(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "view:services");
  // get by id do cause i dont want to spend another serverless function we have limit to 12
  if (req.query.id) return await getServiceById(req, res);

  const params = getCursorOffset(req);
  const db = await connectToDatabase();
  const response = await db
    .collection("services")
    .find({
      $or: [{ marineId: new ObjectId(user.marineId) }, { marineId: "public" }],
    })
    .skip(params.offset)
    .limit(params.limit);
  const data = await response.toArray();
  const total = await response.count();
  res.json({ data, total });
}

export async function createService(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "edit:services");

  const db = await connectToDatabase();

  const id = await db.collection("services").insertOne({
    ...req.body,
    marineId: new ObjectId(user.marineId),
  });

  res.json(id.ops[0]);
}

export async function deleteService(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "edit:services");

  const db = await connectToDatabase();
  try {
    await db.collection("services").deleteOne({
      _id: new ObjectId(`${req.query.id}`),
      marineId: new ObjectId(user.marineId),
    });
    res.status(204).send("service deleted successfully");
  } catch (error) {
    res.status(400).json(error);
  }
}

export async function updateService(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "edit:services");
  const db = await connectToDatabase();
  const id = await db.collection("services").updateOne(
    {
      _id: new ObjectId(`${req.query.id}`),
      marineId: new ObjectId(`${user.marineId}`),
    },
    { $set: { ...req.body } }
  );
  res.json(id);
}
