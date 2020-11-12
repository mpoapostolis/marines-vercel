import { NowRequest, NowResponse } from "@vercel/node";
import * as userService from "../../services/userServices";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      res.json(await userService.getUsers());
      break;

    case "POST":
      try {
        res.status(201).json(await userService.createUser(req.body));
      } catch (error) {
        res.status(400).json(error);
      }
      break;

    default:
      break;
  }
}
