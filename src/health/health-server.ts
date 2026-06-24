import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'http';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

interface HealthServerOptions {
  isReady: () => boolean;
}

interface HealthResponse {
  success: boolean;
  message: string;
  data?: {
    service: string;
    timestamp: string;
    version?: string;
    rabbitmq?: 'connected' | 'disconnected';
  };
}

const writeJson = (res: ServerResponse, statusCode: number, body: HealthResponse): void => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

const notFound = (res: ServerResponse): void => {
  writeJson(res, 404, {
    success: false,
    message: 'Route not found',
  });
};

const createHealthResponse = (message: string): HealthResponse => ({
  success: true,
  message,
  data: {
    service: environment.serviceName,
    timestamp: new Date().toISOString(),
    version: environment.version,
  },
});

export class HealthServer {
  private server: Server | null = null;

  constructor(private readonly options: HealthServerOptions) {}

  start(): Promise<void> {
    if (this.server) {
      return Promise.resolve();
    }

    this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const path = req.url?.split('?')[0] ?? '/';

      if (req.method !== 'GET') {
        notFound(res);
        return;
      }

      if (path === '/' || path === '/health') {
        writeJson(res, 200, createHealthResponse('Health check successful'));
        return;
      }

      if (path === '/health/live') {
        writeJson(res, 200, createHealthResponse('Service is alive'));
        return;
      }

      if (path === '/health/ready') {
        const isReady = this.options.isReady();
        writeJson(res, isReady ? 200 : 503, {
          success: isReady,
          message: isReady ? 'Service is ready' : 'Service is not ready',
          data: {
            service: environment.serviceName,
            timestamp: new Date().toISOString(),
            version: environment.version,
            rabbitmq: isReady ? 'connected' : 'disconnected',
          },
        });
        return;
      }

      notFound(res);
    });

    return new Promise((resolve, reject) => {
      this.server?.once('error', reject);
      this.server?.listen(environment.port, () => {
        this.server?.off('error', reject);
        logger.info({ port: environment.port }, 'Health server started');
        resolve();
      });
    });
  }

  stop(): Promise<void> {
    if (!this.server) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.server?.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        this.server = null;
        logger.info('Health server stopped');
        resolve();
      });
    });
  }
}
