import { z } from 'zod';

export interface EventEnvelope {
  eventId: string;
  eventType: string;
  occurredAt: string;
  producer: string;
  data: unknown;
}

export const eventEnvelopeSchema = z.object({
  eventId: z.string().trim().min(1),
  eventType: z.string().trim().min(1),
  occurredAt: z.iso.datetime({ offset: true }),
  producer: z.string().trim().min(1),
  data: z.unknown(),
});
