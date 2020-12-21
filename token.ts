import { NowRequest, NowResponse } from "@vercel/node";
import * as jwt from "jsonwebtoken";
require("dotenv").config();

export type UserTypeToken = {
  id: string;
  marineId?: string;
};

export function generateToken(obj: Record<string, any>, duration: string) {
  const { _id, marineId } = obj;

  return jwt.sign({ _id, marineId }, process.env["TOKEN"], {
    expiresIn: duration,
  });
}

export function validateToken(req: NowRequest, res: NowResponse) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401);

  jwt.verify(token, process.env["TOKEN"], (err, user: UserTypeToken) => {
    if (err) return res.status(403);
    req["user"] = user;
  });
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
