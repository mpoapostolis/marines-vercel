import { Db, MongoClient } from "mongodb";
let cachedDb: Db = null;

const prod = `mongodb+srv://mpoapostolis:@cluster0.ri3tg.mongodb.net?retryWrites=true&w=majority`;

export const connectToDatabase = async () => {
  if (cachedDb) {
    console.log("👌 Using existing connection");
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(`mongodb://localhost:27017`, {
    native_parser: true,
    useUnifiedTopology: true,
  }).then((client) => {
    let db = client.db("marines");
    console.log("🔥 New DB Connection");
    cachedDb = db;
    return cachedDb;
  });
};
