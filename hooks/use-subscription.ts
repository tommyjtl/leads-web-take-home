"use client";

import { useEffect, useRef } from "react";
import type { SSELeadEvent } from "@/lib/types";

type SSELeadEventHandler = (event: SSELeadEvent) => void;

/**
 * Subscribes to the /api/sse endpoint and calls `onMessage` for each
 * parsed SSELeadEvent.  Returns an `unsubscribe` function that closes
 * the EventSource immediately (in addition to the automatic cleanup on
 * component unmount).
 *
 * @example
 * const unsubscribe = useSubscription((event) => {
 *   if (event.type === "lead.created") void refetch();
 * });
 */
export function useSubscription(onMessage: SSELeadEventHandler): () => void {
    // Keep a stable ref so the effect doesn't re-run when the caller's
    // callback identity changes between renders.
    const handlerRef = useRef<SSELeadEventHandler>(onMessage);
    handlerRef.current = onMessage;

    const esRef = useRef<EventSource | null>(null);

    useEffect(() => {
        const es = new EventSource("/api/sse");
        esRef.current = es;

        es.onmessage = (e: MessageEvent) => {
            try {
                const event = JSON.parse(e.data as string) as SSELeadEvent;
                handlerRef.current(event);
            } catch {
                // ignore malformed frames
            }
        };

        es.onerror = (e) => {
            console.warn("[SSE] connection error – browser will retry", e);
        };

        return () => {
            es.close();
            esRef.current = null;
        };
    }, []); // no deps – stable connection for the lifetime of the component

    // Imperative escape hatch: close early if needed
    return () => {
        esRef.current?.close();
        esRef.current = null;
    };
}
