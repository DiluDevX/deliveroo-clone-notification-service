import dotenv from 'dotenv';
import { z } from 'zod';
import {
  CONSUMED_ROUTING_KEYS,
  EnvironmentEnum,
  RABBITMQ_EXCHANGE,
  RABBITMQ_QUEUE,
} from '../utils/constants';

dotenv.config();

const environmentSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4010),
  NODE_ENV: z
    .enum([EnvironmentEnum.Development, EnvironmentEnum.Production, EnvironmentEnum.Test])
    .default(EnvironmentEnum.Development),
  SERVICE_NAME: z.string().trim().min(1).default('deliveroo-clone-notification-service'),
  LOG_LEVEL: z.string().trim().min(1).default('info'),
  APP_VERSION: z.string().trim().min(1).default('1.0.0'),
  RABBITMQ_URL: z
    .string()
    .trim()
    .min(1)
    .refine((value) => {
      try {
        const protocol = new URL(value).protocol;
        return protocol === 'amqp:' || protocol === 'amqps:';
      } catch {
        return false;
      }
    }, 'RABBITMQ_URL must be a valid amqp/amqps URL'),
  RABBITMQ_EXCHANGE: z.string().trim().min(1).default(RABBITMQ_EXCHANGE),
  RABBITMQ_QUEUE: z.string().trim().min(1).default(RABBITMQ_QUEUE),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  throw new Error(
    `Invalid environment variables: ${parsedEnvironment.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join(', ')}`
  );
}

const env = parsedEnvironment.data;

export const environment = {
  port: env.PORT,
  env: env.NODE_ENV,
  serviceName: env.SERVICE_NAME,
  version: env.APP_VERSION,
  logging: {
    level: env.LOG_LEVEL,
  },
  rabbitmq: {
    url: env.RABBITMQ_URL,
    exchange: env.RABBITMQ_EXCHANGE,
    queue: env.RABBITMQ_QUEUE,
    routingKeys: [...CONSUMED_ROUTING_KEYS],
  },
} as const;
