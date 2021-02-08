import { NowRequest, NowResponse } from "@vercel/node";
import { ObjectID, ObjectId } from "mongodb";
import { connectToDatabase } from "../mongoHelper";
import { validateToken } from "../token";
import { getCursorOffset } from "../utils";
import * as yup from "yup";
import startOfDay from "date-fns/startOfDay";
import { endOfDay } from "date-fns";

const getReservationParams = yup.object().noUnknown(true).shape({
  fromDate: yup.number().required(),
  toDate: yup.number().required(),
});

export async function getReservations(req: NowRequest, res: NowResponse) {
  // await validateToken(req, res, "edit:marines");

  const params = await getReservationParams
    .validate(req.query)
    .catch((err) => err);
  const isValid = await getReservationParams.isValid(params);
  if (!isValid) res.json({ [params.path]: params.message });

  const db = await connectToDatabase();
  const data = await db
    .collection("reservations")
    .find({
      date: { $not: { $gte: req.query.fromDate, $lt: req.query.toDate } },
    })
    .toArray();

  res.json(data);
}

const reserveASpotParams = yup
  .object()
  .noUnknown(true)
  .shape({
    fromDate: yup.number().required(),
    toDate: yup.number().required(),
    userId: yup.string().min(24).max(24).required(),
    spotId: yup.string().min(24).max(24),
  });
export async function reserveASpot(req: NowRequest, res: NowResponse) {
  const params = await reserveASpotParams
    .validate(req.body)
    .catch((err) => err);
  const isValid = await getReservationParams.isValid(params);
  if (!isValid) res.json({ [params.path]: params.message });

  const db = await connectToDatabase();
  const reservedSpots = await db
    .collection("reservations")
    .find({
      fromDate: { $gte: req.query.fromDate },
      toDate: { $lt: req.query.toDate },
    })
    .project({
      _id: true,
    })
    .toArray();

  console.log(reservedSpots);

  const spot = await db
    .collection("spots")
    .find(
      {
        _id: {
          $nin: reservedSpots.map((id) => new ObjectId(id)),
        },
      },
      {
        limit: 1,
        fields: {
          _id: 1,
        },
      }
    )
    .toArray();

  await db.collection("reservations").insertOne({
    fromDate: startOfDay(req.body.fromDate),
    toDate: endOfDay(req.body.toDate),
    userId: new ObjectId(req.body.userId),
    spotId: new ObjectId(spot[0]._id),
  });

  res.json({
    msg: "booked successfully",
  });
}
