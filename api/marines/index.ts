import { NowRequest, NowResponse } from "@vercel/node";
import * as marineService from "../../services/marineService";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      await marineService.getMarines(req, res);
      break;

    case "POST":
      await marineService.createMarine(req, res);
      break;

    default:
      break;
  }
}
