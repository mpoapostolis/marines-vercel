import { ObjectID } from "mongodb";
import * as yup from "yup";
import bcrypt from "bcrypt";
import { connectToDatabase } from "../mongoHelper";

export async function getUsers() {
  return {};
}

export async function getUserById(id: string) {
  return {};
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
  const existingMarine = await db
    .collection("marines")
    .findOne({ _id: new ObjectID(body.marineId) });
  if (!existingMarine) return { msg: "Invalid marine id" };

  const existingUser = await db
    .collection("users")
    .findOne({ userName: user.userName });
  if (existingUser) return { msg: `user ${user.userName} already exists` };

  const password = await bcrypt.hash(user.password, 10);

  await (await db.collection("users").insertOne({ ...user, password })).ops;

  return { msg: "user created successfully" };
}
