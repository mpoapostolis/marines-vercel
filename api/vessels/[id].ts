import { NowRequest, NowResponse } from "@vercel/node";
import * as vesselService from "../../services/vesselService";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      await vesselService.getVesselById(req, res);
      break;

    case "PUT":
      await vesselService.updateVessel(req, res);

      break;

    case "DELETE":
      await vesselService.deleteVesselById(req, res);

      break;

    default:
      break;
  }
}
