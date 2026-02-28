import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { verifyToken, COOKIE_NAME, type JWTPayload } from "@/lib/auth";

export type Context = {
    user: JWTPayload | null;
};

export async function createContext({
    req,
}: {
    req: Request;
}): Promise<Context> {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${COOKIE_NAME}=`));

    const token = match ? match.slice(COOKIE_NAME.length + 1) : null;
    const user = token ? await verifyToken(token) : null;

    return { user };
}

const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/**
 * Protected procedure: throws UNAUTHORIZED if the request carries no valid JWT.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
});
