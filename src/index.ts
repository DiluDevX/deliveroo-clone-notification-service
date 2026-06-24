import { EventConsumer } from './messaging/event-consumer';
import { environment } from './config/environment';
import { HealthServer } from './health/health-server';
import { logger } from './utils/logger';

const consumer = new EventConsumer();
const healthServer = new HealthServer({
  isReady: () => consumer.isReady(),
});

let isShuttingDown = false;

async function startWorker(): Promise<void> {
  try {
    await consumer.start();
    try {
      await healthServer.start();
    } catch (error) {
      await consumer.stop();
      throw error;
    }

    logger.info(
      {
        env: environment.env,
        service: environment.serviceName,
      },
      'Notification worker started'
    );
  } catch (error) {
    logger.fatal({ error }, 'Failed to start notification worker');
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info({ signal }, 'Shutdown signal received');

  try {
    await healthServer.stop();
    await consumer.stop();
    logger.info('Notification worker shut down gracefully');
    process.exit(0);
  } catch (error) {
    logger.fatal({ error }, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  void shutdown('uncaughtException');
});

void startWorker();
