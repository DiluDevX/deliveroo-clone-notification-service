# deliveroo-clone-notification-service

Backend worker service for consuming Deliveroo domain events from RabbitMQ and processing notification-related events.

## What this service does

- Connects to RabbitMQ using `RABBITMQ_URL`
- Exposes lightweight health endpoints for container/deploy checks
- Consumes events from exchange `deliveroo.events`
- Uses queue `notification.events`
- Handles routing keys:
  - `order.created`
  - `order.confirmed`
  - `order.cancelled`
  - `payment.succeeded`
  - `payment.failed`
  - `payment.canceled`
  - `payment.refunded`
- Validates event envelope shape and logs structured messages
- Sends enriched order/payment emails using order snapshots from events or order-service lookups
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

| Variable                | Required | Default                                | Description                            |
| ----------------------- | -------- | -------------------------------------- | -------------------------------------- |
| `PORT`                  | No       | `4010`                                 | Health server port                     |
| `RABBITMQ_URL`          | Yes      | -                                      | RabbitMQ connection URL (`amqp://...`) |
| `SERVICE_NAME`          | No       | `deliveroo-clone-notification-service` | Service name in logs                   |
| `NODE_ENV`              | No       | `development`                          | `development`, `production`, `test`    |
| `LOG_LEVEL`             | No       | `info`                                 | Pino log level                         |
| `APP_VERSION`           | No       | `1.0.0`                                | Application version logged at startup  |
| `RABBITMQ_EXCHANGE`     | No       | `deliveroo.events`                     | Topic exchange name                    |
| `RABBITMQ_QUEUE`        | No       | `notification.events`                  | Queue name                             |
| `COMPANY_NAME`          | No       | `Deliveroo Clone`                      | Sender/display company name            |
| `COMPANY_EMAIL`         | No       | `noreply@deliveroo-clone.local`        | Resend sender email                    |
| `LOGO_URL`              | No       | `https://via.placeholder.com/150`      | Logo used in email templates           |
| `SUPPORT_EMAIL`         | No       | `support@deliveroo-clone.local`        | Support email shown in templates       |
| `APP_URL`               | No       | `http://localhost:3000`                | Frontend URL used for email links      |
| `RESEND_API_KEY`        | No       | `re_development_key`                   | Resend API key                         |
| `ORDER_SERVICE_URL`     | No       | `http://localhost:4002`                | Internal order-service base URL        |
| `ORDER_SERVICE_API_KEY` | No       | `order-service-api-key`                | API key for order-service lookups      |

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

## Health endpoints

The service is still a worker, but it exposes a small HTTP server for deployment checks.

| Endpoint        | Meaning                                                   |
| --------------- | --------------------------------------------------------- |
| `/`             | Basic health check                                        |
| `/health`       | Basic health check                                        |
| `/health/live`  | Process liveness check                                    |
| `/health/ready` | Readiness check; requires RabbitMQ consumer to be running |

Example:

```bash
curl http://localhost:4010/health/ready
```

## Azure VM environment

For GitHub Actions development deployment, create the environment secret:

```txt
NOTIFICATION_SERVICE_ENV_DEV
```

Example value:

```env
NODE_ENV=development
PORT=4010
SERVICE_NAME=deliveroo-clone-notification-service
LOG_LEVEL=info
RABBITMQ_URL=amqp://deliveroo:strong-password@rabbitmq:5672
RABBITMQ_EXCHANGE=deliveroo.events
RABBITMQ_QUEUE=notification.events
ORDER_SERVICE_URL=http://order-service:4002
ORDER_SERVICE_API_KEY=order-service-api-key
```

This service also expects the same repository/environment values used by the other Azure-deployed services:

- `ACR_LOGIN_SERVER_DEV`
- `ACR_USERNAME_DEV`
- `ACR_PASSWORD_DEV`
- `RELEASE_TOKEN`

The reusable Azure workflow also supports production names if you later create a separate production environment:

- `ACR_LOGIN_SERVER_PROD`
- `ACR_USERNAME_PROD`
- `ACR_PASSWORD_PROD`
- `NOTIFICATION_SERVICE_ENV_PROD`

## RabbitMQ on the Azure VM

Run RabbitMQ on the same Docker network as the services:

```bash
docker network inspect deliveroo-dev >/dev/null 2>&1 || docker network create deliveroo-dev

docker run -d \
  --name rabbitmq \
  --network deliveroo-dev \
  --restart unless-stopped \
  -e RABBITMQ_DEFAULT_USER=deliveroo \
  -e RABBITMQ_DEFAULT_PASS=strong-password \
  -p 127.0.0.1:15672:15672 \
  rabbitmq:3-management
```

Do not expose RabbitMQ port `5672` or the management UI publicly. Use an SSH tunnel for the UI:

```bash
ssh -i path/to/key.pem -L 15672:127.0.0.1:15672 deliveroo@your-vm-ip
```

Then open <http://localhost:15672>.
