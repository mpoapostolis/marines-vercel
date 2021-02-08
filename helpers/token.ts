import { NowRequest, NowResponse } from "@vercel/node";
import * as jwt from "jsonwebtoken";
require("dotenv").config();

export type UserTypeToken = {
  _id: string;
  marineId?: string;
  permissions: string[];
};

export function generateToken(obj: Record<string, any>, duration: string) {
  const { _id, marineId, permissions } = obj;

  return jwt.sign({ _id, marineId, permissions }, process.env["TOKEN"], {
    expiresIn: duration,
  });
}

export async function validateToken(
  req: NowRequest,
  res: NowResponse,
  reqPerm?: string
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) res.status(401);
  try {
    const user = (await jwt.verify(
      token,
      process.env["TOKEN"]
    )) as UserTypeToken;

    const doIHavePerm = ~user.permissions.findIndex((perm) => perm === reqPerm);

    if (reqPerm && !doIHavePerm) {
      res.status(401);
      res.json({ msg: "unauthorized" });
      return;
    }
    return user;
  } catch (error) {
    res.status(403);
    res.json({ msg: "You don't have the required permission for this action" });
  }
}

export async function getLoginResponse(obj: Record<string, any>) {
  const { password, fbId, ...infos } = obj;
  const token = await generateToken(obj, "3h");
  const refresh_token = await generateToken(obj, "2d");
  return {
    ...infos,
    token,
    refresh_token,
  };
}
