import RedisStore from 'connect-redis';
import session from 'express-session';
import redisClient from './redis.js';

const sessionStore = new RedisStore({
  client: redisClient,
  prefix: 'session:',
});

export default sessionStore;

// export default ;
