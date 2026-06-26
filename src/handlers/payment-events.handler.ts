import { eventEnvelopeSchema, type EventEnvelope } from '../types/event-envelope';
import { logger } from '../utils/logger';
import { z } from 'zod';
import * as emailService from '../services/email.service';
import * as orderService from '../services/order.service';
import {
  formatMajorAmount,
  formatMinorAmount,
  getCustomerName,
  toEmailOrderItems,
} from '../utils/email-formatters';

const paymentEventDataSchema = z.object({
  paymentId: z.string().trim().min(1),
  orderId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  userEmail: z.string().trim().email().optional(),
  userFirstName: z.string().trim().min(1).optional(),
  userLastName: z.string().trim().min(1).optional(),
  amount: z.number(),
  currency: z.string().trim().min(1).optional(),
  paymentMethod: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  provider: z.string().trim().min(1).optional(),
  providerPaymentId: z.string().trim().nullable().optional(),
  providerPaymentIntentId: z.string().trim().nullable().optional(),
  paidAt: z.string().trim().optional(),
});

export async function handlePaymentEvent(
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
    'Payment event received'
  );

  if (routingKey === 'payment.succeeded') {
    const payment = paymentEventDataSchema.parse(envelope.data);

    if (!payment.userEmail) {
      logger.warn(
        { eventId: envelope.eventId, paymentId: payment.paymentId, userId: payment.userId },
        'Payment event does not include user email. Email notification skipped'
      );
      return envelope;
    }

    const order = await orderService.getOrderById(payment.orderId);

    if (!order) {
      logger.warn(
        { eventId: envelope.eventId, paymentId: payment.paymentId, orderId: payment.orderId },
        'Payment email will be sent without order details'
      );
    }

    await emailService.sendPaymentSucceededEmail({
      to: payment.userEmail,
      orderId: payment.orderId,
      orderNumber: order?.orderNumber,
      customerName: getCustomerName(payment.userFirstName, payment.userLastName),
      restaurantName: order?.restaurantName,
      totalAmount: order ? formatMajorAmount(order.totalAmount) : formatMinorAmount(payment.amount),
      items: order ? toEmailOrderItems(order.items) : undefined,
    });

    logger.info(
      { eventId: envelope.eventId, paymentId: payment.paymentId, to: payment.userEmail },
      'Payment succeeded email sent'
    );
  }

  return envelope;
}
