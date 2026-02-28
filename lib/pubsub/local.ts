import { EventEmitter } from "events";
import { PubSubService, type LeadEventHandler } from "./index";
import type { SSELeadEvent } from "../types";

const LEAD_EVENT = "lead";

/**
 * In-process pub/sub driver backed by Node's EventEmitter.
 * Suitable for single-process deployments (dev, local, single dyno).
 *
 * Replace with a network-aware driver (RabbitMQ, Redis, etc.) for
 * multi-process or multi-instance deployments.
 */
class LocalPubSubService extends PubSubService {
    private readonly emitter: EventEmitter;

    constructor() {
        super();
        this.emitter = new EventEmitter();
        // Allow many SSE clients without Node warnings
        this.emitter.setMaxListeners(200);
    }

    publish(event: SSELeadEvent): void {
        this.emitter.emit(LEAD_EVENT, event);
    }

    subscribe(handler: LeadEventHandler): () => void {
        this.emitter.on(LEAD_EVENT, handler);
        // Return an unsubscribe function
        return () => {
            this.emitter.off(LEAD_EVENT, handler);
        };
    }
}

/** Global singleton – created once per server process */
export const pubSub = new LocalPubSubService();
