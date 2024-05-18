import express from 'express';
import compression from 'compression';
import cors from 'cors';
import connectToDb from './config/mongodb.js';
import Routes from './routes/index.js';

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
        'https://www.accountmarket.shop',
        'https://accountmarket.shop',
      ],
      credentials: true,
    }),
  );

  app.use('/api', Routes);

  connectToDb()
    .then(() => {
      console.log('Connected to DB');
    })
    .then(() => {
      app.listen(process.env.PORT! as string, () => {
        console.log(`Listening on port http://localhost:${process.env.PORT}`);
      });
    });
};

export default server;
