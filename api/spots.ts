import { NowRequest, NowResponse } from "@vercel/node";
import * as spotService from "../services/spotService";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      await spotService.getSpots(req, res);

      break;

    case "POST":
      await spotService.updateSpot(req, res);
      break;

    default:
      break;
  }
}
