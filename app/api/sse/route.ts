import { pubSub } from "@/lib/pubsub/local";

/**
 * GET /api/sse
 *
 * Establishes a Server-Sent Events stream.  Clients connect once and receive
 * delta-update events (lead.created, lead.updated) as JSON-encoded SSE frames.
 */

// Ensure this route is always dynamically rendered (never statically cached)
export const dynamic = "force-dynamic";

export async function GET() {
    const encoder = new TextEncoder();

    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let unsubscribe: (() => void) | null = null;

    const stream = new ReadableStream({
        start(controller) {
            // Send a heartbeat comment every 20 s to keep the connection alive
            heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(": heartbeat\n\n"));
                } catch {
                    // controller is already closed – stop the timer
                    if (heartbeat) clearInterval(heartbeat);
                }
            }, 2_000);

            unsubscribe = pubSub.subscribe((event) => {
                try {
                    const data = JSON.stringify(event);
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                } catch {
                    // client probably disconnected
                }
            });
        },
        cancel() {
            // Called by the runtime when the client disconnects
            if (heartbeat) clearInterval(heartbeat);
            unsubscribe?.();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
