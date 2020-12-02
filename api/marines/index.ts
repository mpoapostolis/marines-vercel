import { NowRequest, NowResponse } from "@vercel/node";
import * as marineService from "../../services/marineService";
import { getCursorOffset } from "../../utils";

export default async function (req: NowRequest, res: NowResponse) {
  const params = getCursorOffset(req);
  switch (req.method) {
    case "GET":
      res.json(await marineService.getMarines(params));
      break;

    case "POST":
      try {
        res.status(201).json(await marineService.createMarine(req.body.name));
      } catch (error) {
        res.status(400).json(error);
      }
      break;

    default:
      break;
  }
}
