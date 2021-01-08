import { NowRequest, NowResponse } from "@vercel/node";
import * as vesselService from "../../services/vesselService";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      await vesselService.getVessels(req, res);

      break;

    case "POST":
      await vesselService.createVessel(req, res);
      break;

    case "PUT":
      break;

    case "DELETE":
      break;

    default:
      break;
  }
}
