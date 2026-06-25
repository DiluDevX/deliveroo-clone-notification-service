import { eventEnvelopeSchema, type EventEnvelope } from '../types/event-envelope';
import { logger } from '../utils/logger';
import { z } from 'zod';
import * as emailService from '../services/email.service';

const orderCreatedDataSchema = z.object({
  orderId: z.string().trim().min(1),
  orderNumber: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  userEmail: z.string().trim().email().optional(),
  userFirstName: z.string().trim().min(1).optional(),
  userLastName: z.string().trim().min(1).optional(),
  totalAmount: z.number(),
  paymentMethod: z.string().nullable(),
});

const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);

const getCustomerName = (firstName?: string, lastName?: string): string => {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || 'there';
};

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
      totalAmount: formatAmount(order.totalAmount),
      paymentMethod: order.paymentMethod ?? 'Unknown',
    });

    logger.info(
      { eventId: envelope.eventId, orderId: order.orderId, to: order.userEmail },
      'Order placed email sent'
    );
  }

  return envelope;
}
