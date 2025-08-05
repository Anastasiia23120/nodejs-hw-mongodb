import 'dotenv/config';
import { startServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';
const start = async () => {
  try {
    await initMongoConnection();
    startServer();
  } catch (error) {
    console.error('Failed to initialize app:', error.message);
    process.exit(1);
  }
};

start();
