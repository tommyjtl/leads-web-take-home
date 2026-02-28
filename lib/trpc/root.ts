import { router } from "./init";
import { leadsRouter } from "./routers/leads";
import { usersRouter } from "./routers/users";

export const appRouter = router({
    leads: leadsRouter,
    users: usersRouter,
});

export type AppRouter = typeof appRouter;
