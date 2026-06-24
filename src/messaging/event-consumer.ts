import { type Channel, type ConsumeMessage } from 'amqplib';
import { ZodError } from 'zod';
import { handleOrderEvent } from '../handlers/order-events.handler';
import { handlePaymentEvent } from '../handlers/payment-events.handler';
import { environment } from '../config/environment';
import { RabbitMqClient } from './rabbitmq.client';
import { logger } from '../utils/logger';
import { eventEnvelopeSchema } from '../types/event-envelope';

export class EventConsumer {
  private readonly rabbitMqClient = new RabbitMqClient();

  private channel: Channel | null = null;

  private consumerTag: string | null = null;

  private isConsuming = false;

  async start(): Promise<void> {
    this.channel = await this.rabbitMqClient.connect();
    await this.channel.prefetch(10);

    const consumed = await this.channel.consume(
      environment.rabbitmq.queue,
      async (message) => {
        await this.consumeMessage(message);
      },
      { noAck: false }
    );

    this.consumerTag = consumed.consumerTag;
    this.isConsuming = true;

    logger.info(
      {
        exchange: environment.rabbitmq.exchange,
        queue: environment.rabbitmq.queue,
        routingKeys: environment.rabbitmq.routingKeys,
      },
      'Event consumer started'
    );
  }

  async stop(): Promise<void> {
    if (this.channel && this.consumerTag) {
      await this.channel.cancel(this.consumerTag);
    }

    this.consumerTag = null;
    this.channel = null;
    this.isConsuming = false;

    await this.rabbitMqClient.close();

    logger.info('Event consumer stopped');
  }

  isReady(): boolean {
    return this.isConsuming && this.channel !== null && this.rabbitMqClient.isConnected();
  }

  private async consumeMessage(message: ConsumeMessage | null): Promise<void> {
    if (!message || !this.channel) {
      return;
    }

    const routingKey = message.fields.routingKey;
    const payload = this.decodeMessage(message.content);

    if (!payload) {
      logger.error({ routingKey }, 'Failed to decode message payload');
      this.channel.nack(message, false, false);
      return;
    }

    try {
      switch (routingKey) {
        case 'order.created':
        case 'order.confirmed':
        case 'order.cancelled':
          await handleOrderEvent(payload, routingKey);
          this.channel.ack(message);
          return;
        case 'payment.succeeded':
        case 'payment.failed':
        case 'payment.canceled':
          await handlePaymentEvent(payload, routingKey);
          this.channel.ack(message);
          return;
        default:
          logger.warn({ routingKey }, 'Unhandled routing key received');
          this.channel.nack(message, false, false);
      }
    } catch (error) {
      const maybeEnvelope = eventEnvelopeSchema.safeParse(payload);
      const eventId = maybeEnvelope.success ? maybeEnvelope.data.eventId : undefined;

      if (error instanceof ZodError) {
        logger.error(
          { eventId, routingKey, issues: error.issues },
          'Invalid event envelope received. Message will be nacked without requeue'
        );
      } else {
        logger.error({ eventId, routingKey, error }, 'Event handler failure');
      }

      this.channel.nack(message, false, false);
    }
  }

  private decodeMessage(content: Buffer): unknown | null {
    try {
      return JSON.parse(content.toString('utf-8')) as unknown;
    } catch {
      return null;
    }
  }
}
