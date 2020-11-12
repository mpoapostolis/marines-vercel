import { NowRequest, NowResponse } from "@vercel/node";
import * as marineService from "../../services/marineService";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      try {
        res.json(await marineService.getMarineById(`${req.query.id}`));
      } catch (error) {
        res.status(404).json({ msg: "vessel id not found" });
      }
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
