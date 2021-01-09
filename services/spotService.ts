import { NowRequest, NowResponse } from "@vercel/node";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../mongoHelper";
import { validateToken } from "../token";
import { getCursorOffset } from "../utils";

const params = {};

export async function getSpots(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "view:spots");
  const {
    draught = Infinity,
    from = undefined,
    to = undefined,
    latitude = undefined,
    length = Infinity,
    longitude = undefined,
    marineId = undefined,
    radius = Infinity,
    width = Infinity,
  } = req.query;
  const searchObj = user?.marineId
    ? { marineId: new ObjectId(user.marineId) }
    : {
        $and: [
          { draught: { $lte: +draught } },
          { length: { $lte: +length } },
          { width: { $lte: +width } },
        ],
      };

  if (latitude && longitude && radius) {
    searchObj["location"] = {
      $near: {
        $geometry: { type: "Point", coordinates: [+longitude, +latitude] },
        $maxDistance: +radius * 1000,
      },
    };
  }

  const pagenatedParams = getCursorOffset(req);
  const db = await connectToDatabase();
  const response = await db
    .collection("spots")
    .find(searchObj)
    .skip(pagenatedParams.offset)
    .limit(pagenatedParams.limit);
  const data = await response.toArray();
  const total = await response.count();

  res.json({ data, total });
}

export async function getSpotById(req: NowRequest, res: NowResponse) {
  await validateToken(req, res, "view:spots");

  const db = await connectToDatabase();
  const response = await db.collection("spots").findOne({
    _id: new ObjectId(`${req.query.id}`),
  });
  res.json(response);
}

export async function deleteSpotById(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "edit:spots");

  const db = await connectToDatabase();
  try {
    await db.collection("spots").deleteOne({
      _id: new ObjectId(`${req.query.id}`),
      marineId: new ObjectId(user.marineId),
    });
    res.status(204).send("spots deleted successfully");
  } catch (error) {
    res.status(400).json(error);
  }
}

export async function updateSpot(req: NowRequest, res: NowResponse) {
  await validateToken(req, res, "edit:spots");
  const db = await connectToDatabase();
  const { marineId, ...body } = req.body;
  const id = await db.collection("spots").updateOne(
    {
      _id: new ObjectId(`${req.query.id}`),
      marineId: new ObjectId(`${marineId}`),
    },
    { $set: { ...body } }
  );
  res.json(id);
}

export async function createSpot(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "edit:spots");

  const db = await connectToDatabase();
  const marine = await db.collection("marines").findOne({
    _id: new ObjectId(user.marineId),
  });
  const id = await db.collection("spots").insertOne({
    ...req.body,
    marineName: marine.name,
    location: {
      type: "Point",
      coordinates: [req.body.coords[0].lng, req.body.coords[1].lat],
    },
    marineId: new ObjectId(user.marineId),
  });

  res.json(id.ops[0]);
}
