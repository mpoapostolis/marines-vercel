import { NowRequest, NowResponse } from "@vercel/node";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../helpers/mongoHelper";
import { validateToken } from "../helpers/token";
import { getCursorOffset } from "../helpers/utils";
import * as yup from "yup";
import { endOfDay, startOfDay } from "date-fns";

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

const clientSpotParam = yup
  .object()
  .noUnknown(true)
  .shape({
    fromDate: yup.number(),
    toDate: yup.number(),
    marineId: yup.string().min(24).max(24),
    draught: yup.number().default(-Infinity),
    length: yup.number().default(-Infinity),
    radius: yup.number().default(5),
    min: yup.number().default(-Infinity),
    max: yup.number().default(Infinity),
    width: yup.number().default(-Infinity),
    latitude: yup.number(),
    longitude: yup.number(),
    sort: yup.string().oneOf(["price", "distance", "count"]).default("price"),
  });

async function clientSpots(req: NowRequest, res: NowResponse) {
  const params = await clientSpotParam.validate(req.query).catch((err) => err);
  const isValid = await clientSpotParam.isValid(params);
  if (!isValid) res.status(400).json({ [params.path]: params.message });

  const db = await connectToDatabase();

  const reserverdSpots =
    params.fromDate && params.toDate
      ? await db
          .collection("reservations")
          .find({
            $or: [
              {
                $and: [
                  { fromDate: { $gte: startOfDay(params.fromDate) } },
                  { fromDate: { $lte: startOfDay(params.toDate) } },
                ],
              },
              {
                $and: [
                  { toDate: { $gte: endOfDay(params.fromDate) } },
                  { toDate: { $lte: endOfDay(params.toDate) } },
                ],
              },
            ],
          })
          .project({
            spotId: true,
          })
          .toArray()
      : [];

  const geoPipeLine = {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [
          parseFloat(params.longitude),
          parseFloat(params.latitude),
        ],
      },
      maxDistance: params.radius * 1000,
      distanceField: "distance",
      spherical: true,
    },
  };

  const marinePipeLine = params.marineId
    ? {
        marineId: new ObjectId(params.marineId),
      }
    : {};

  const aggregation = [
    {
      $match: marinePipeLine,
    },

    {
      $match: {
        draught: { $gte: params.draught },
        length: { $gte: params.length },
        width: { $gte: params.width },
        price: { $gte: params.min, $lte: params.max },
        _id: {
          $nin: reserverdSpots.map(({ spotId }) => new ObjectId(spotId)),
        },
      },
    },

    {
      $group: {
        _id: "$marineName",
        count: { $sum: 1 },
        distance: { $first: "$distance" },
        marineId: { $first: "$marineId" },
        name: { $first: "$marineName" },
        price: { $first: "$price" },
        services: { $first: "$services" },
      },
    },
    { $sort: { [params.sort]: 1 } },
  ];

  console.log(params.longitude && params.latitude);

  const response = await db
    .collection("spots")
    .aggregate(
      params.longitude && params.latitude
        ? [geoPipeLine, ...aggregation]
        : aggregation
    )
    .toArray();

  res.json(response);
}

export async function getSpots(req: NowRequest, res: NowResponse) {
  switch (req.query.type) {
    case "client":
      return await clientSpots(req, res);

    default:
      return await adminSpots(req, res);
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
