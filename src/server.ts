import express from 'express';
import compression from 'compression';
import cors from 'cors';
import connectToDb from './config/mongodb.js';
import Routes from './routes/index.js';
import session from 'express-session';
import sessionStore from './config/sessionStore.js';
import { Types } from 'mongoose';
import { requireAuth } from './middlewares/auth.m.js';
import resend, { compileTemplate } from './config/email.js';
import logger from './utils/logger.js';

const server = async () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.disable('x-powered-by');
  app.use(compression());

  app.use(
    cors({
      origin: [
        'http://localhost:5173',
        'http://192.168.1.23:5173',
        'http://172.20.10.2:5173',
        'https://www.dexcrow.fun',
        'http://192.168.29.182:5173',
        'https://dexcrow.fun',
      ],
      credentials: true,
    }),
  );

  app.use(
    session({
      secret: process.env.SESSION_SECRET! as string,
      resave: true,
      saveUninitialized: true,
      store: sessionStore,
      // proxy: true,
      cookie: {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        sameSite: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  app.use('/api', Routes);

  app.get('/health', (_, res) => {
    return res.send({
      status: 'ok',
    });
  });

  connectToDb()
    .then(() => {
      logger.info('Connected to DB');
    })
    .then(() => {
      app.listen(process.env.PORT! as string, () => {
        logger.info(`Listening on port http://localhost:${process.env.PORT}`);
      });
    });
};

export default server;
