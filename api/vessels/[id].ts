import { NowRequest, NowResponse } from "@vercel/node";
import * as userServices from "../../services/userServices";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      try {
        res.json(await userServices.getUserById(`${req.query.id}`));
      } catch (error) {
        res.status(404).json({ msg: "user id not found" });
      }
      break;

    default:
      break;
  }
}
