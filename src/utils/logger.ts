import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { config } from 'dotenv';
import winston from 'winston';

config();
// TODO fix all logging issues in all the places to account for stack

const { combine, timestamp, align, colorize, printf, json } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A ZZ',
    }),
    colorize({ all: true }),
    align(),
    json(),
  ),
  transports: [new winston.transports.Console({ format: printf(({ level, message, label, timestamp }) => `[${timestamp}] ${level}: ${message}`) })],
});

// you can get logtail token for remote loggin @https://betterstack.com/ or better still comment out the logtail transport

if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      format: combine(
        json(),
        timestamp({
          format: 'YYYY-MM-DD hh:mm:ss.SSS A ZZ',
        }),
      ),
    }),
  );
  logger.add(new LogtailTransport(new Logtail(process.env.LOGTAIL_PRODUCTION_SOURCE_TOKEN!)));
} else {
  logger.add(new LogtailTransport(new Logtail(process.env.LOGTAIL_DEVELOPMENT_SOURCE_TOKEN!)));
}
export default logger;
