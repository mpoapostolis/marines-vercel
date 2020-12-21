import { NowRequest, NowResponse } from "@vercel/node";
import * as spotService from "../../services/spotService";
import { getCursorOffset } from "../../utils";

export default async function (req: NowRequest, res: NowResponse) {
  const params = getCursorOffset(req);
  switch (req.method) {
    case "GET":
      if (req.query.marine_id) {
      } else {
        res.status(200).json(await spotService.getSpots(params));
      }

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
