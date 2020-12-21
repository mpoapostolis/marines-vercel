import { NowRequest, NowResponse } from "@vercel/node";
import * as userService from "../../services/userServices";

export default async function (req: NowRequest, res: NowResponse) {
  const { type } = req.query;
  switch (req.method) {
    case "POST":
      if (type === "register")
        res.status(201).json(await userService.createUser(req.body));
      if (type === "login") userService.login(req, res);
      break;

    default:
      break;
  }
}
