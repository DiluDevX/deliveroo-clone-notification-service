import { eventEnvelopeSchema, type EventEnvelope } from '../types/event-envelope';
import { logger } from '../utils/logger';
import { z } from 'zod';
import * as emailService from '../services/email.service';
import { deliveryAddressSchema, orderItemSchema } from '../types/order-details';
import {
  formatDeliveryAddress,
  formatMajorAmount,
  getCustomerName,
  toEmailOrderItems,
} from '../utils/email-formatters';

const orderCreatedDataSchema = z.object({
  orderId: z.string().trim().min(1),
  orderNumber: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  userEmail: z.string().trim().email().optional(),
  userFirstName: z.string().trim().min(1).optional(),
  userLastName: z.string().trim().min(1).optional(),
  restaurantId: z.string().trim().min(1),
  restaurantName: z.string().trim().min(1),
  restaurantAddress: z.string().trim(),
  subtotal: z.number(),
  deliveryFee: z.number(),
  serviceFee: z.number(),
  discountAmount: z.number(),
  totalAmount: z.number(),
  paymentMethod: z.string().nullable(),
  paymentStatus: z.string().trim().min(1),
  status: z.string().trim().min(1),
  deliveryAddress: deliveryAddressSchema,
  items: z.array(orderItemSchema),
  estimatedDeliveryAt: z.string().trim().nullable(),
  createdAt: z.string().trim().min(1),
});

const orderCancelledDataSchema = orderCreatedDataSchema.extend({
  cancellationReason: z.string().trim().nullable().optional(),
  cancelledAt: z.string().trim().nullable().optional(),
});

export async function handleOrderEvent(
  payload: unknown,
  routingKey: string
): Promise<EventEnvelope> {
  const envelope = eventEnvelopeSchema.parse(payload);

  logger.info(
    {
      eventId: envelope.eventId,
      eventType: envelope.eventType,
      occurredAt: envelope.occurredAt,
      producer: envelope.producer,
      routingKey,
    },
    'Order event received'
  );

  if (routingKey === 'order.created') {
    const order = orderCreatedDataSchema.parse(envelope.data);

    if (!order.userEmail) {
      logger.warn(
        { eventId: envelope.eventId, orderId: order.orderId, userId: order.userId },
        'Order event does not include user email. Email notification skipped'
      );
      return envelope;
    }

    if (order.paymentMethod?.toLowerCase() === 'card') {
      logger.info(
        { eventId: envelope.eventId, orderId: order.orderId },
        'Card order created. Waiting for payment event before sending email'
      );
      return envelope;
    }

    await emailService.sendOrderPlacedEmail({
      to: order.userEmail,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customerName: getCustomerName(order.userFirstName, order.userLastName),
      restaurantName: order.restaurantName,
      totalAmount: formatMajorAmount(order.totalAmount),
      paymentMethod: order.paymentMethod ?? 'Unknown',
      deliveryAddress: formatDeliveryAddress(order.deliveryAddress),
      items: toEmailOrderItems(order.items),
    });

    logger.info(
      { eventId: envelope.eventId, orderId: order.orderId, to: order.userEmail },
      'Order placed email sent'
    );
  }

  if (routingKey === 'order.cancelled') {
    const order = orderCancelledDataSchema.parse(envelope.data);

    if (!order.userEmail) {
      logger.warn(
        { eventId: envelope.eventId, orderId: order.orderId, userId: order.userId },
        'Order event does not include user email. Email notification skipped'
      );
      return envelope;
    }

    await emailService.sendOrderCancelledEmail({
      to: order.userEmail,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customerName: getCustomerName(order.userFirstName, order.userLastName),
      restaurantName: order.restaurantName,
      totalAmount: formatMajorAmount(order.totalAmount),
      cancellationReason: order.cancellationReason ?? undefined,
    });

    logger.info(
      { eventId: envelope.eventId, orderId: order.orderId, to: order.userEmail },
      'Order cancelled email sent'
    );
  }

  if (routingKey === 'order.confirmed') {
    logger.info(
      { eventId: envelope.eventId },
      'Order confirmed event received. Email skipped to avoid duplicate confirmation messages'
    );
  }

  return envelope;
}
