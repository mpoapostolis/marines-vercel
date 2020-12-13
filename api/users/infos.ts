import { NowRequest, NowResponse } from "@vercel/node";
import * as userService from "../../services/userServices";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      res.json(await userService.getUserInfoById());
      break;

    default:
      break;
  }
}
