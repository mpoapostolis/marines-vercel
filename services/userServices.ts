import { ObjectId, ObjectID } from "mongodb";
import * as yup from "yup";
import bcrypt from "bcrypt";
import { connectToDatabase } from "../helpers/mongoHelper";
import { permissions } from "../helpers/permissions";
import { getLoginResponse } from "../helpers/token";
import { NowRequest, NowResponse } from "@vercel/node";

export async function loginUser(req: NowRequest, res: NowResponse) {
  const db = await connectToDatabase();
  const err = () =>
    res.status(400).json({
      key: "userName",
      msg: "username or password is not correct",
    });

  const existingUser = await db
    .collection("users")
    .findOne({ userName: req.body.userName });
  if (existingUser) {
    const correctPass = bcrypt.compareSync(
      req.body.password,
      existingUser.password
    );

    if (correctPass) res.json(await getLoginResponse(existingUser));
    else err();
  } else err();
}

let userSchema = yup
  .object()
  .noUnknown(true)
  .shape({
    userName: yup.string().required(),
    password: yup.string().required(),
    marineId: yup.string().min(24).max(24),
    email: yup.string().email(),
  });

export async function createUser(req: NowRequest, res: NowResponse) {
  const user = await userSchema.validate(req.body).catch((err) => err);
  const isValid = await userSchema.isValid(req.body);
  if (!isValid) return { [user.path]: user.message };

  const db = await connectToDatabase();

  if (user.marineId) {
    const existingMarine = await db
      .collection("marines")
      .findOne({ _id: new ObjectID(req.body.marineId) });
    if (!existingMarine)
      return res.status(400).json({
        key: "marineId",
        msg: "Invalid marine id",
      });
  }

  const existingUser = await db
    .collection("users")
    .findOne({ userName: user.userName });
  if (existingUser)
    return res.status(409).json({
      key: "userName",
      msg: `user ${user.userName} already exists`,
    });

  const password = await bcrypt.hash(user.password, 10);
  const userBody = {
    ...user,
    password,
    permissions: user.marineId ? permissions.marine : permissions.user,
  };

  if ("marineId" in user) {
    userBody["marineId"] = new ObjectId(user.marineId);
  }

  await (await db.collection("users").insertOne(userBody)).ops;

  res.status(201).json({ msg: "user created successfully" });
}
