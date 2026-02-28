import { TRPCError } from "@trpc/server";
import { eq, like, and, desc, asc, sql } from "drizzle-orm";
import { z } from "zod";
import { nanoid } from "nanoid";

import { router, publicProcedure, protectedProcedure } from "../init";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { pubSub } from "@/lib/pubsub/local";
import {
    leadSubmitSchema,
    updateLeadStatusSchema,
    listLeadsSchema,
} from "@/lib/types";

export const leadsRouter = router({
    // Public: submit a new lead
    submit: publicProcedure
        .input(leadSubmitSchema)
        .mutation(async ({ input }) => {
            const id = nanoid();

            const [created] = await db
                .insert(leads)
                .values({
                    id,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    email: input.email,
                    country: input.country,
                    linkedinUrl: input.linkedinUrl,
                    visaCategories: input.visaCategories,
                    additionalInfo: input.additionalInfo,
                    resumePath: input.resumePath ?? null,
                    resumeOriginalName: input.resumeOriginalName ?? null,
                    status: "PENDING",
                })
                .returning();

            // Broadcast real-time event
            pubSub.publish({
                type: "lead.created",
                payload: {
                    ...created,
                    visaCategories: typeof created.visaCategories === "string"
                        ? (JSON.parse(created.visaCategories) as string[])
                        : (created.visaCategories as string[]),
                    createdAt: new Date(created.createdAt),
                    updatedAt: new Date(created.updatedAt),
                },
            });

            return created;
        }),

    // Internal: list leads with search + filter + pagination
    list: protectedProcedure.input(listLeadsSchema).query(async ({ input }) => {
        const { search, status, page, pageSize, sortBy, sortOrder } = input;
        const offset = (page - 1) * pageSize;

        const conditions = [];

        if (search) {
            const term = `%${search}%`;
            conditions.push(
                sql`(
          ${leads.firstName} LIKE ${term} OR
          ${leads.lastName}  LIKE ${term} OR
          ${leads.email}     LIKE ${term} OR
          ${leads.country}   LIKE ${term}
        )`
            );
        }

        if (status) {
            conditions.push(eq(leads.status, status));
        }

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        const sortDir = sortOrder === "asc" ? asc : desc;
        const sortColumn =
            sortBy === "name"
                ? leads.firstName
                : sortBy === "status"
                    ? leads.status
                    : sortBy === "country"
                        ? leads.country
                        : leads.createdAt;

        const [rows, [{ count }]] = await Promise.all([
            db
                .select()
                .from(leads)
                .where(where)
                .orderBy(sortDir(sortColumn))
                .limit(pageSize)
                .offset(offset),

            db
                .select({ count: sql<number>`count(*)` })
                .from(leads)
                .where(where),
        ]);

        return {
            items: rows.map((r) => ({
                ...r,
                visaCategories: typeof r.visaCategories === "string"
                    ? (JSON.parse(r.visaCategories) as string[])
                    : (r.visaCategories as string[]),
                createdAt: new Date(r.createdAt),
                updatedAt: new Date(r.updatedAt),
            })),
            total: count,
            page,
            pageSize,
            totalPages: Math.ceil(count / pageSize),
        };
    }),

    // Internal: get single lead
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const [lead] = await db
                .select()
                .from(leads)
                .where(eq(leads.id, input.id));

            if (!lead) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
            }

            return {
                ...lead,
                visaCategories: typeof lead.visaCategories === "string"
                    ? (JSON.parse(lead.visaCategories) as string[])
                    : (lead.visaCategories as string[]),
                createdAt: new Date(lead.createdAt),
                updatedAt: new Date(lead.updatedAt),
            };
        }),

    // Internal: update lead status
    updateStatus: protectedProcedure
        .input(updateLeadStatusSchema)
        .mutation(async ({ input }) => {
            const now = new Date();

            const [updated] = await db
                .update(leads)
                .set({ status: input.status, updatedAt: now })
                .where(eq(leads.id, input.id))
                .returning();

            if (!updated) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
            }

            // Broadcast real-time event
            pubSub.publish({
                type: "lead.updated",
                payload: {
                    ...updated,
                    visaCategories: typeof updated.visaCategories === "string"
                        ? (JSON.parse(updated.visaCategories) as string[])
                        : (updated.visaCategories as string[]),
                    createdAt: new Date(updated.createdAt),
                    updatedAt: new Date(updated.updatedAt),
                },
            });

            return updated;
        }),
});
