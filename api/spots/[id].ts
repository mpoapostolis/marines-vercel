import { NowRequest, NowResponse } from "@vercel/node";
import * as spotService from "../../services/spotService";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      await spotService.getSpotById(req, res);
      break;

    case "PUT":
      await spotService.updateSpot(req, res);

      break;

    case "DELETE":
      await spotService.deleteSpotById(req, res);

      break;

    default:
      break;
  }
}
