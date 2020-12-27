import { NowRequest, NowResponse } from "@vercel/node";
import * as marineService from "../../services/marineService";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      await marineService.getMarineById(req, res);
      break;

    case "PUT":
      await marineService.updateMarine(req, res);
      break;

    case "DELETE":
      await marineService.deleteMarineById(req, res);
      break;

    default:
      break;
  }
}
