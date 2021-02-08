import { Db, MongoClient } from "mongodb";
let cachedDb: Db = null;
require("dotenv").config();

export const connectToDatabase = async () => {
  if (cachedDb) {
    console.log("👌 Using existing connection");
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(
    process.env.MONGOURL || `mongodb://localhost:27017`,
    {
      native_parser: true,
      useUnifiedTopology: true,
    }
  ).then((client) => {
    let db = client.db("marines");
    console.log("🔥 New DB Connection");
    cachedDb = db;
    return cachedDb;
  });
};
