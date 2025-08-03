import 'dotenv/config';
import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

const start = async () => {
  const PORT = process.env.PORT || 8080;

  await initMongoConnection();
  const app = setupServer();

  app.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`);
  });
};

start();
