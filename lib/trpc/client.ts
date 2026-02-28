"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./root";

/**
 * tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>();
