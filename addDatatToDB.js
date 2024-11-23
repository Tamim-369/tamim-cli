const mongoose = require('mongoose');

export async function addDataToDB(
  model,
  data,
  mongodb_uri = 'mongodb://localhost:27017',
  dbName = 'test'
) {
  await mongoose.connect(`${mongodb_uri}/${dbName}`);
  await model.insertMany(data);
}
