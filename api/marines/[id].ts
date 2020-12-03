import { NowRequest, NowResponse } from "@vercel/node";
import * as marineService from "../../services/marineService";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      res.json(await marineService.getMarineById(`${req.query.id}`));

      break;

    case "DELETE":
      try {
        res
          .status(202)
          .json(await marineService.deleteMarineById(`${req.query.id}`));
      } catch (error) {
        res.status(400).json(error);
      }
      break;

    default:
      break;
  }
}
