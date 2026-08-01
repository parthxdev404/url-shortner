import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export async function connectTestDB() {
  mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
}

export async function clearDatabase() {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    const collection = collections[key];

    await collection?.deleteMany({});
  }
}

export async function disconnectTestDB() {
  await mongoose.disconnect();

  await mongoServer.stop();
}
