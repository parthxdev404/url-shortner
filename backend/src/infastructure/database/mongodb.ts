import mongoose from 'mongoose';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';


mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error({ error }, 'MongoDB connection error');
});

export async function connectMongoDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_URI);

    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.fatal({ error }, 'Failed to connect to MongoDB');
    process.exit(1);
  }
}


export async function disconnectMongoDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error({ error }, 'Error while closing MongoDB connection');
  }
}