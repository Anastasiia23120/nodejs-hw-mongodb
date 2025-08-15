import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

import contactsRouter from './routers/contactsRouter.js';
import authRouter from './routers/authRouter.js';

import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startServer = () => {
  const app = express();
  const PORT = process.env.PORT || 8080;

  const swaggerPath = path.join(__dirname, '../docs/swagger.json');
  if (!fs.existsSync(swaggerPath)) {
    console.error('Swagger file not found! Run "npm run build-docs" first.');
    process.exit(1);
  }
  const swaggerFile = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

  app.use(cors());
  app.use(pino());
  app.use(express.json());
  app.use(cookieParser());

  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  });
};
