import { z } from 'zod';
import { environment } from '../config/environment';
import { orderDetailsSchema, type OrderDetails } from '../types/order-details';
import { logger } from '../utils/logger';

const orderResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: orderDetailsSchema.optional(),
});

export const getOrderById = async (orderId: string): Promise<OrderDetails | null> => {
  const url = new URL(`/v1/orders/${encodeURIComponent(orderId)}`, environment.orderService.url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': environment.orderService.apiKey,
        'x-actor-id': environment.serviceName,
        'x-actor-type': 'SYSTEM',
      },
    });

    if (!response.ok) {
      const body = await response.text();
      logger.warn({ orderId, status: response.status, body }, 'Order service lookup failed');
      return null;
    }

    const payload = orderResponseSchema.safeParse(await response.json());

    if (!payload.success || !payload.data.data) {
      logger.warn(
        { orderId, issues: payload.success ? undefined : payload.error.issues },
        'Order service response validation failed'
      );
      return null;
    }

    return payload.data.data;
  } catch (error) {
    logger.warn({ orderId, error }, 'Failed to fetch order details');
    return null;
  }
};
