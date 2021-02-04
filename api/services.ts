import { NowRequest, NowResponse } from "@vercel/node";
import * as serviceServices from "../services/servicesService";

export default async function (req: NowRequest, res: NowResponse) {
  switch (req.method) {
    case "GET":
      await serviceServices.getServices(req, res);
      break;
    case "POST":
      await serviceServices.createService(req, res);
      break;

    case "PUT":
      await serviceServices.updateService(req, res);
      break;
    case "DELETE":
      await serviceServices.deleteService(req, res);
      break;

    default:
      break;
  }
}
