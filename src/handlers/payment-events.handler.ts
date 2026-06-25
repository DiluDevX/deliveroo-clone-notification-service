import { eventEnvelopeSchema, type EventEnvelope } from '../types/event-envelope';
import { logger } from '../utils/logger';
import { z } from 'zod';
import * as emailService from '../services/email.service';

const paymentEventDataSchema = z.object({
  paymentId: z.string().trim().min(1),
  orderId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  userEmail: z.string().trim().email().optional(),
  userFirstName: z.string().trim().min(1).optional(),
  userLastName: z.string().trim().min(1).optional(),
  amount: z.number(),
});

const formatMinorAmount = (amount: number): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount / 100);

const getCustomerName = (firstName?: string, lastName?: string): string => {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || 'there';
};

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

    await emailService.sendPaymentSucceededEmail({
      to: payment.userEmail,
      orderId: payment.orderId,
      customerName: getCustomerName(payment.userFirstName, payment.userLastName),
      totalAmount: formatMinorAmount(payment.amount),
    });

    logger.info(
      { eventId: envelope.eventId, paymentId: payment.paymentId, to: payment.userEmail },
      'Payment succeeded email sent'
    );
  }

  return envelope;
}
