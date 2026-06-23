# deliveroo-clone-notification-service

Backend worker service for consuming Deliveroo domain events from RabbitMQ and processing notification-related events.

## What this service does

- Connects to RabbitMQ using `RABBITMQ_URL`
- Consumes events from exchange `deliveroo.events`
- Uses queue `notification.events`
- Handles routing keys:
  - `order.created`
  - `order.confirmed`
  - `order.cancelled`
  - `payment.succeeded`
  - `payment.failed`
  - `payment.canceled`
- Validates event envelope shape and logs structured messages
- Uses manual ack/nack (`nack` without requeue for invalid/unhandled events)

## Event envelope

```ts
{
  eventId: string;
  eventType: string;
  occurredAt: string;
  producer: string;
  data: unknown;
}
```

## Required environment variables

| Variable            | Required | Default                                | Description                            |
| ------------------- | -------- | -------------------------------------- | -------------------------------------- |
| `RABBITMQ_URL`      | Yes      | -                                      | RabbitMQ connection URL (`amqp://...`) |
| `SERVICE_NAME`      | No       | `deliveroo-clone-notification-service` | Service name in logs                   |
| `NODE_ENV`          | No       | `development`                          | `development`, `production`, `test`    |
| `LOG_LEVEL`         | No       | `info`                                 | Pino log level                         |
| `APP_VERSION`       | No       | `1.0.0`                                | Application version logged at startup  |
| `RABBITMQ_EXCHANGE` | No       | `deliveroo.events`                     | Topic exchange name                    |
| `RABBITMQ_QUEUE`    | No       | `notification.events`                  | Queue name                             |

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

## RabbitMQ via Docker

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

Management UI: <http://localhost:15672> (default `guest` / `guest`)

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint:check
npm run format:check
npm run types:check
```
