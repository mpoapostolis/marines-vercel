import { NowRequest, NowResponse } from "@vercel/node";
import * as userService from "../../services/userServices";
import * as vesselServices from "../../services/vesselService";

export default async function (req: NowRequest, res: NowResponse) {
  const { type } = req.query;
  switch (req.method) {
    case "GET":
      if (type === "vessel") await vesselServices.getVessels(req, res);

      break;

    case "POST":
      if (type === "register") await userService.createUser(req, res);
      if (type === "login") await userService.loginUser(req, res);
      if (type === "vessel") await vesselServices.createVessel(req, res);

      break;

    case "PATCH":
      await vesselServices.updateVessel(req, res);
      break;

    case "DELETE":
      await vesselServices.deleteVesselById(req, res);
      break;

    default:
      break;
  }
}
