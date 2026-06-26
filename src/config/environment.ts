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
  COMPANY_NAME: z.string().trim().min(1).default('Deliveroo Clone'),
  COMPANY_EMAIL: z.string().trim().email().default('noreply@deliveroo-clone.local'),
  LOGO_URL: z.string().trim().url().default('https://via.placeholder.com/150'),
  SUPPORT_EMAIL: z.string().trim().email().default('support@deliveroo-clone.local'),
  APP_URL: z.string().trim().url().default('http://localhost:3000'),
  RESEND_API_KEY: z.string().trim().min(1).default('re_development_key'),
  ORDER_SERVICE_URL: z.string().trim().url().default('http://localhost:4002'),
  ORDER_SERVICE_API_KEY: z.string().trim().min(1).default('order-service-api-key'),
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
  mail: {
    companyName: env.COMPANY_NAME,
    companyEmail: env.COMPANY_EMAIL,
    logoUrl: env.LOGO_URL,
    supportEmail: env.SUPPORT_EMAIL,
    appUrl: env.APP_URL,
    resendApiKey: env.RESEND_API_KEY,
  },
  orderService: {
    url: env.ORDER_SERVICE_URL,
    apiKey: env.ORDER_SERVICE_API_KEY,
  },
} as const;
