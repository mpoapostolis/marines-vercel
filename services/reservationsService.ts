import { NowRequest, NowResponse } from "@vercel/node";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../helpers/mongoHelper";
import * as yup from "yup";
import startOfDay from "date-fns/startOfDay";
import { endOfDay } from "date-fns";
import { validateToken } from "../helpers/token";

const getReservationParams = yup
  .object()
  .noUnknown(true)
  .shape({
    fromDate: yup.number(),
    toDate: yup.number(),
    status: yup.string().oneOf(["PENDING", "ACTIVE", "COMPLETE"]),
  });

export async function getReservations(req: NowRequest, res: NowResponse) {
  const user = await validateToken(req, res, "view:reservations");

  const params = await getReservationParams
    .validate(req.query)
    .catch((err) => err);
  const isValid = await getReservationParams.isValid(params);
  if (!isValid) res.status(400).json({ [params.path]: params.message });

  const findObj = {};
  if (params.status) findObj["status"] = params.status;
  if (params.fromDate && params.toDate) {
    findObj["fromDate"] = { $gte: params.fromDate };
    findObj["toDate"] = { $lte: params.fromDate };
  }

  const db = await connectToDatabase();
  const results = await db.collection("reservations").find({
    marineId: new ObjectId(user.marineId),
    ...findObj,
  });

  const total = await results.count();
  const data = await results.toArray();

  res.json({
    data,
    total,
  });
}

const reserveASpotParams = yup
  .object()
  .noUnknown(true)
  .shape({
    fromDate: yup.number().required(),
    toDate: yup.number().required(),
    userId: yup.string().min(24).max(24),
    name: yup.string(),
    spotId: yup.string().min(24).max(24),
    marineId: yup.string().min(24).max(24).required(),
  });
export async function reserveASpot(req: NowRequest, res: NowResponse) {
  const params = await reserveASpotParams
    .validate(req.body)
    .catch((err) => err);
  const isValid = await getReservationParams.isValid(params);
  if (!isValid) res.status(400).json({ [params.path]: params.message });

  const from = startOfDay(params.fromDate);
  const to = endOfDay(params.toDate);

  const db = await connectToDatabase();
  // need to find a date between my range
  // example i need a reservation for 1/02 - 10/02
  // if a reservation is for 2/02 - 11/02 we exclude it
  const reservedSpots = await db
    .collection("reservations")
    .find({
      $or: [
        { $and: [{ fromDate: { $gte: from } }, { fromDate: { $lte: to } }] },
        { $and: [{ toDate: { $gte: from } }, { toDate: { $lte: to } }] },
      ],
    })
    .project({
      spotId: true,
    })
    .toArray();

  const spot = await db
    .collection("spots")
    .find(
      {
        _id: {
          $nin: reservedSpots.map(({ spotId }) => new ObjectId(spotId)),
        },
      },
      {
        limit: 1,
      }
    )
    .sort({ price: 1 })
    .toArray();

  if (spot.length < 1)
    return res.status(400).json({
      msg: "not available spots",
    });

  await db.collection("reservations").insertOne({
    fromDate: from,
    toDate: to,
    status: "PENDING",
    userId: new ObjectId(params.userId),
    marineId: new ObjectId(params.marineId),
    spotId: new ObjectId(spot[0]._id),
    spotLabel: spot[0].label,
    spotNumber: spot[0].number,
    spotPrice: spot[0].price,
  });

  res.json({
    spot: spot[0],
  });
}
