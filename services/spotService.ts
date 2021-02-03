import { NowRequest, NowResponse } from "@vercel/node";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../mongoHelper";
import { validateToken } from "../token";
import { getCursorOffset } from "../utils";

async function adminSpots(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res);

  const pagenatedParams = getCursorOffset(req);
  const db = await connectToDatabase();
  const response = await db
    .collection("spots")
    .find({ marineId: new ObjectId(user.marineId) })
    .skip(pagenatedParams.offset)
    .limit(pagenatedParams.limit);
  const data = await response.toArray();
  const total = await response.count();

  res.json({ data, total });
}

async function clientSpots(req: NowRequest, res: NowResponse) {
  const {
    draught = Infinity,
    from = undefined,
    to = undefined,
    latitude = "",
    length = Infinity,
    longitude = "",
    radius = 5,
    width = Infinity,
  } = req.query;

  const db = await connectToDatabase();

  const geoPipeLine = {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [
          parseFloat(String(longitude)),
          parseFloat(String(latitude)),
        ],
      },
      maxDistance: +radius * 1000,
      distanceField: "distance",
      spherical: true,
    },
  };
  const aggregation = [
    {
      $match: {
        $and: [
          { draught: { $lte: draught } },
          { length: { $lte: length } },
          { width: { $lte: width } },
        ],
      },
    },
    {
      $group: {
        _id: "$marineName",
        count: { $sum: 1 },
        distance: { $first: "$distance" },
        name: { $first: "$marineName" },
      },
    },
  ];

  const response = await db
    .collection("spots")
    .aggregate(
      longitude && latitude ? [geoPipeLine, ...aggregation] : aggregation
    )
    .toArray();

  res.json(response);
}

export async function getSpots(req: NowRequest, res: NowResponse) {
  if (req.query.type === "client") {
    return await clientSpots(req, res);
  } else {
    return await adminSpots(req, res);
  }
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
