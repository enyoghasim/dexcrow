import redis from 'redis';

const redisClient = redis.createClient({
  url: process.env.REDIS_URI,
  password: process.env.REDIS_PASSWORD,
});

await redisClient.connect();

export default redisClient;
