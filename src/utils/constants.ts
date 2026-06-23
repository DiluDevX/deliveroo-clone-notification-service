export enum EnvironmentEnum {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export const RABBITMQ_EXCHANGE = 'deliveroo.events';
export const RABBITMQ_QUEUE = 'notification.events';

export const CONSUMED_ROUTING_KEYS = [
  'order.created',
  'order.confirmed',
  'order.cancelled',
  'payment.succeeded',
  'payment.failed',
  'payment.canceled',
] as const;

export type ConsumedRoutingKey = (typeof CONSUMED_ROUTING_KEYS)[number];
