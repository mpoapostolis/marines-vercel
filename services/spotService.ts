import { NowRequest, NowResponse } from "@vercel/node";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../helpers/mongoHelper";
import { validateToken } from "../helpers/token";
import { getCursorOffset } from "../helpers/utils";

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
    min = -Infinity,
    max = Infinity,
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
          { price: { $gte: +min, $lte: +max } },
        ],
      },
    },

    {
      $group: {
        _id: "$marineName",
        count: { $sum: 1 },
        distance: { $first: "$distance" },
        marineId: { $first: "$marineId" },
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
  switch (req.query.type) {
    case "client":
      return await clientSpots(req, res);
    case "admin":
      return await adminSpots(req, res);

    default:
      res.json({});
      break;
  }
}

export async function updateSpot(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "edit:spots");
  const db = await connectToDatabase();
  const marine = await db.collection("marines").findOne({
    _id: new ObjectId(user.marineId),
  });
  await db.collection("spots").deleteMany({
    marineId: new ObjectId(user.marineId),
  });
  const docs = req.body.map((spot) => {
    const { _id, ...rest } = spot;
    return {
      ...rest,
      marineName: marine.name,
      marineId: new ObjectId(user.marineId),
    };
  });
  const id = await db.collection("spots").insertMany(docs);
  res.json({ id });
}
