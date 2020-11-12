import { NowRequest, NowResponse } from "@vercel/node";
import * as vesselService from "../../services/vesselService";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      res.json(await vesselService.getVessels(req.query.userId?.toString()));
      break;

    case "POST":
      try {
        res.status(201).json(await vesselService.createVessel(req.body));
      } catch (error) {
        res.status(400).json(error);
      }
      break;

    default:
      break;
  }
}
