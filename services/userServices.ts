import { ObjectId, ObjectID } from "mongodb";
import * as yup from "yup";
import bcrypt from "bcrypt";
import { connectToDatabase } from "../mongoHelper";
import { permissions } from "../permissions";
import { getLoginResponse } from "../token";
import { NowRequest, NowResponse } from "@vercel/node";

export async function login(req: NowRequest, res: NowResponse) {
  const db = await connectToDatabase();
  const err = () =>
    res.status(400).json({ msg: "username or password is not correct" });

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

export async function createUser(body) {
  const user = await userSchema.validate(body).catch((err) => err);
  const isValid = await userSchema.isValid(body);
  if (!isValid) return { [user.path]: user.message };

  const db = await connectToDatabase();

  if (user.marineId) {
    const existingMarine = await db
      .collection("marines")
      .findOne({ _id: new ObjectID(body.marineId) });
    if (!existingMarine) return { msg: "Invalid marine id" };
  }

  const existingUser = await db
    .collection("users")
    .findOne({ userName: user.userName });
  if (existingUser) return { msg: `user ${user.userName} already exists` };

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

  return { msg: "user created successfully" };
}
