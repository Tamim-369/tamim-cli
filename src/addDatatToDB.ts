import { Model } from "mongoose";
import mongoose from "mongoose";

export async function addDataToDB(
  model: Model<any>,
  data: Array<any>,
  mongodb_uri = "mongodb://localhost:27017",
  dbName = "test"
) {
  await mongoose.connect(`${mongodb_uri}/${dbName}`);
  await model.insertMany(data);
}
