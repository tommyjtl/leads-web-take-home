import { z } from "zod";

// Visa Categories
export const VISA_CATEGORIES = ["O-1", "EB-1A", "EB-2 NIW", "I don't know"] as const;
export type VisaCategory = (typeof VISA_CATEGORIES)[number];

// Lead Status
export const LEAD_STATUSES = ["PENDING", "REACHED_OUT"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * Extends `LeadStatus` with "ALL" for use in filter UI controls where the
 * user can choose to view every lead regardless of status.
 */
export type LeadStatusFilter = LeadStatus | "ALL";

// Lead Submission (public form)
export const leadSubmitSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email("Invalid email address"),
    country: z.string().min(1, "Country is required"),
    linkedinUrl: z
        .url("Please enter a valid URL"),
    visaCategories: z
        .array(z.enum(VISA_CATEGORIES))
        .min(1, "Select at least one visa category"),
    additionalInfo: z.string().min(1, "Please tell us how we can help"),
    // Filled after /api/upload succeeds – optional because user may not attach a file
    resumePath: z.string().optional(),
    resumeOriginalName: z.string().optional(),
});

export type LeadSubmitInput = z.infer<typeof leadSubmitSchema>;

// Lead (full DB record returned to clients)
export const leadSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    country: z.string(),
    linkedinUrl: z.string(),
    visaCategories: z.array(z.string()),
    resumePath: z.string().nullable(),
    resumeOriginalName: z.string().nullable(),
    additionalInfo: z.string().nullable(),
    status: z.enum(LEAD_STATUSES),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type LeadRecord = z.infer<typeof leadSchema>;

// Update Status
export const updateLeadStatusSchema = z.object({
    id: z.string(),
    status: z.enum(LEAD_STATUSES),
});

export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;

// Pagination
export const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 30] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
export const DEFAULT_PAGE_SIZE: PageSize = PAGE_SIZE_OPTIONS[0] ?? 15;

// List Leads Query 
export const LEAD_SORT_FIELDS = ["name", "createdAt", "status", "country"] as const;
export type LeadSortField = (typeof LEAD_SORT_FIELDS)[number];

export const listLeadsSchema = z.object({
    search: z.string().optional(),
    status: z.enum(LEAD_STATUSES).optional(),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
    sortBy: z.enum(LEAD_SORT_FIELDS).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type ListLeadsInput = z.infer<typeof listLeadsSchema>;

// User
export const userSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    role: z.enum(["admin", "agent"]),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type UserRecord = z.infer<typeof userSchema>;

// SSE Events
export const sseLeadEventSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("lead.created"),
        payload: leadSchema,
    }),
    z.object({
        type: z.literal("lead.updated"),
        payload: leadSchema,
    }),
]);

export type SSELeadEvent = z.infer<typeof sseLeadEventSchema>;
