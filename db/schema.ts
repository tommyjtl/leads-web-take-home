import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Leads
export const leads = sqliteTable("leads", {
    id: text("id").primaryKey(), // nanoid / uuid
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    country: text("country").notNull(),
    linkedinUrl: text("linkedin_url").notNull(),
    /** Stored as a JSON array of visa-category strings */
    visaCategories: text("visa_categories", { mode: "json" })
        .notNull()
        .$type<string[]>(),
    resumePath: text("resume_path"), // relative path under /public/uploads
    resumeOriginalName: text("resume_original_name"),
    additionalInfo: text("additional_info"),
    status: text("status", { enum: ["PENDING", "REACHED_OUT"] })
        .notNull()
        .default("PENDING"),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
});

// Users (for future JWT auth)
export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["admin", "agent"] })
        .notNull()
        .default("agent"),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
