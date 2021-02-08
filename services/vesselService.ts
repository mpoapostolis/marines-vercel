import { NowRequest, NowResponse } from "@vercel/node";
import { validateToken } from "../helpers/token";
import { connectToDatabase } from "../helpers/mongoHelper";
import { ObjectId } from "mongodb";
import { getCursorOffset } from "../helpers/utils";

export async function getVessels(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "view:vessels");

  const params = getCursorOffset(req);
  const db = await connectToDatabase();
  const response = await db
    .collection("vessels")
    .find({ userId: new ObjectId(user._id) })
    .skip(params.offset)
    .limit(params.limit);

  const data = await response.toArray();
  const total = await response.count();
  res.json({ data, total });
}

export async function getVesselById(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "view:vessels");

  const db = await connectToDatabase();
  const response = await db.collection("vessels").findOne({
    _id: new ObjectId(`${req.query.id}`),
    userId: new ObjectId(user._id),
  });
  res.json(response);
}

export async function updateVessel(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "edit:vessels");
  const db = await connectToDatabase();
  const id = await db.collection("vessels").updateOne(
    {
      _id: new ObjectId(`${req.query.id}`),
      userId: new ObjectId(user._id),
    },
    { $set: { ...req.body, userId: new ObjectId(user._id) } }
  );
  res.json(id);
}

export async function createVessel(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "view:vessels");

  const db = await connectToDatabase();
  const id = await db.collection("vessels").insertOne({
    ...req.body,
    userId: new ObjectId(user._id),
  });
  res.json(id.ops[0]);
}

export async function deleteVesselById(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "edit:vessels");

  const db = await connectToDatabase();
  try {
    await db.collection("vessels").deleteOne({
      _id: new ObjectId(`${req.query.id}`),
      userId: new ObjectId(user._id),
    });
    res.status(204).send("marine deletedmarine deleted successfully");
  } catch (error) {
    res.status(400).json(error);
  }
}
