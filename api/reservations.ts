import { NowRequest, NowResponse } from "@vercel/node";
import * as bookingServices from "../services/reservationsService";

export default async function (req: NowRequest, res: NowResponse) {
  console.log("--");
  switch (req.method) {
    case "GET":
      await bookingServices.getReservations(req, res);
      break;
    case "POST":
      await bookingServices.reserveASpot(req, res);
      break;

    case "PUT":
      break;
    case "DELETE":
      break;

    default:
      break;
  }
}
