import mongoose from 'mongoose';

let isConnected = false;

export async function connectMongo(uri: string): Promise<void> {
  if (isConnected) return;

  await mongoose.connect(uri, {
    dbName: 'moneycouple_ia',
  });

  isConnected = true;
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
  });
}

export async function disconnectMongo(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}

export { mongoose };
