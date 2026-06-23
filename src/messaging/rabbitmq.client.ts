import amqp, { type Channel, type ChannelModel } from 'amqplib';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

export class RabbitMqClient {
  private connection: ChannelModel | null = null;

  private channel: Channel | null = null;

  async connect(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    this.connection = await amqp.connect(environment.rabbitmq.url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(environment.rabbitmq.exchange, 'topic', { durable: true });

    await this.channel.assertQueue(environment.rabbitmq.queue, { durable: true });

    for (const routingKey of environment.rabbitmq.routingKeys) {
      await this.channel.bindQueue(
        environment.rabbitmq.queue,
        environment.rabbitmq.exchange,
        routingKey
      );
    }

    logger.info(
      {
        exchange: environment.rabbitmq.exchange,
        queue: environment.rabbitmq.queue,
        routingKeys: environment.rabbitmq.routingKeys,
      },
      'Connected to RabbitMQ'
    );

    return this.channel;
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
    } finally {
      this.channel = null;
      if (this.connection) {
        await this.connection.close();
      }
      this.connection = null;
    }
  }
}
