import { NowRequest, NowResponse } from "@vercel/node";
import { validateToken } from "../helpers/token";
import { connectToDatabase } from "../helpers/mongoHelper";
import { ObjectId } from "mongodb";
import * as yup from "yup";

export async function getVessels(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "view:vessels");

  const db = await connectToDatabase();
  const response = await db
    .collection("vessels")
    .find({ userId: new ObjectId(user._id) });

  const data = await response.toArray();
  res.json(data);
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

let vesselUpdateSchema = yup
  .object()
  .noUnknown(true)
  .shape({
    name: yup.string(),
    width: yup.number(),
    length: yup.number(),
    draught: yup.number(),
    vesselId: yup.string().min(24).max(24).required(),
  });

export async function updateVessel(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "edit:vessels");

  const params = await vesselUpdateSchema
    .validate(req.body)
    .catch((err) => err);
  const isValid = await vesselUpdateSchema.isValid(req.body);
  if (!isValid) res.status(400).json({ [params.path]: params.message });

  const db = await connectToDatabase();
  const { vesselId, userId, ...body } = req.body;

  await db.collection("vessels").updateOne(
    {
      _id: new ObjectId(params.vesselId),
      userId: new ObjectId(user._id),
    },
    { $set: body }
  );
  res.status(204).json({});
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

let vesselDeleteSchema = yup
  .object()
  .noUnknown(true)
  .shape({
    vesselId: yup.string().min(24).max(24).required(),
  });

export async function deleteVesselById(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "edit:vessels");

  const params = await vesselDeleteSchema
    .validate(req.query)
    .catch((err) => err);
  const isValid = await vesselDeleteSchema.isValid(req.query);
  if (!isValid) res.status(400).json({ [params.path]: params.message });

  const db = await connectToDatabase();
  try {
    await db.collection("vessels").deleteOne({
      _id: new ObjectId(params.vesselId),
      userId: new ObjectId(user._id),
    });
    res.status(204).send("vessel deleted successfully");
  } catch (error) {
    res.status(400).json(error);
  }
}
