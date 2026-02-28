import type { SSELeadEvent } from "../types";

export type LeadEventHandler = (event: SSELeadEvent) => void;

/**
 * Abstract pub/sub service for broadcasting real-time lead events.
 *
 * Swap the driver (LocalPubSubService → RabbitMQ, Redis Pub/Sub, etc.)
 * without touching any application code.
 */
export abstract class PubSubService {
    abstract publish(event: SSELeadEvent): void;
    abstract subscribe(handler: LeadEventHandler): () => void;
}
