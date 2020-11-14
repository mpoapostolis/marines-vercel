import { NowRequest, NowResponse } from "@vercel/node";
import * as spotService from "../../services/spotService";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      res.status(200).json(await spotService.getSpots(req.query.coords));

      break;

    case "POST":
      try {
        res.status(201).json(await spotService.createSpot(req.body));
      } catch (error) {
        res.status(400).json(error);
      }
      break;

    default:
      break;
  }
}
