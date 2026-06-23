import { eventEnvelopeSchema, type EventEnvelope } from '../types/event-envelope';
import { logger } from '../utils/logger';

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

  return envelope;
}
