/**
 * Seed script – inserts 50 fake leads.
 *
 * Distribution:
 *   China  → 50 % (25 records)
 *   India  → 30 % (15 records)
 *   Other  → 20 % (10 records) spread across all five continents
 *
 * Status: 4 REACHED_OUT, 46 PENDING (randomly assigned)
 * createdAt: random moment within the past 7 days
 *
 * Run:  npx tsx scripts/seed.ts
 */

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { leads, users } from "../db/schema";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

// DB setup

const DB_PATH = process.env.DATABASE_URL ?? "./data/leads.db";
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite);

// Name pools

const FIRST_NAMES = [
    "Liam", "Olivia", "Noah", "Emma", "Oliver", "Charlotte", "Elijah", "Amelia",
    "James", "Sophia", "Aiden", "Isabella", "Lucas", "Mia", "Mason", "Evelyn",
    "Logan", "Harper", "Ethan", "Camila", "Jackson", "Gianna", "Sebastian",
    "Aria", "Mateo", "Luna", "Jack", "Sofia", "Owen", "Scarlett", "Theodore",
    "Eleanor", "Henry", "Chloe", "Wyatt", "Penelope", "Ryan", "Layla", "Nathan",
    "Riley", "Caleb", "Zoey", "Luke", "Nora", "Isaiah", "Lily", "Gabriel",
    "Hannah", "Anthony", "Addison", "Kai", "Yuna", "Wei", "Mei", "Raj",
    "Priya", "Arjun", "Ananya", "Hiroshi", "Yuki", "Diego", "Valentina",
];

const LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
    "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
    "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
    "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Chen",
    "Wang", "Zhang", "Li", "Liu", "Patel", "Singh", "Kumar", "Shah",
    "Khan", "Tanaka", "Yamamoto", "Sato", "Kim", "Park", "Choi", "Müller",
];

// Country pools per continent (ISO alpha-2)
// Representatives per continent (excluding CN & IN)
const OTHER_COUNTRIES_BY_CONTINENT: string[][] = [
    // North & South America
    ["US", "CA", "BR", "MX", "AR", "CO"],
    // Europe
    ["GB", "DE", "FR", "IT", "ES", "PL"],
    // Africa
    ["NG", "ET", "KE", "ZA", "GH", "EG"],
    // Asia (excl. CN & IN)
    ["JP", "KR", "ID", "VN", "PK", "PH"],
    // Oceania
    ["AU", "NZ"],
];

const VISA_CATEGORIES = ["O-1", "EB-1A", "EB-2 NIW", "I don't know"] as const;

// Helpers

function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/** Random date within the past `days` days */
function randomRecentDate(days = 7): Date {
    const now = Date.now();
    const msAgo = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000);
    return new Date(now - msAgo);
}

/** Pick a random country from the "other" pool, cycling through continents */
function pickOtherCountry(index: number): string {
    const continent = OTHER_COUNTRIES_BY_CONTINENT[index % OTHER_COUNTRIES_BY_CONTINENT.length];
    return pick(continent);
}

// Build records

const TOTAL = 50;
const CHINA_COUNT = 25;   // 50 %
const INDIA_COUNT = 15;   // 30 %
const OTHER_COUNT = 10;   // 20 %
const REACHED_OUT_COUNT = 4;

// Build country array: [25× CN, 15× IN, 10× other]
const countries: string[] = [
    ...Array(CHINA_COUNT).fill("CN"),
    ...Array(INDIA_COUNT).fill("IN"),
    ...Array.from({ length: OTHER_COUNT }, (_, i) => pickOtherCountry(i)),
];

// Shuffle countries
for (let i = countries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [countries[i], countries[j]] = [countries[j], countries[i]];
}

// Decide which indices get REACHED_OUT
const reachedOutIndices = new Set<number>();
while (reachedOutIndices.size < REACHED_OUT_COUNT) {
    reachedOutIndices.add(Math.floor(Math.random() * TOTAL));
}

const records = Array.from({ length: TOTAL }, (_, i) => {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const createdAt = randomRecentDate(7);
    const status = reachedOutIndices.has(i) ? "REACHED_OUT" : "PENDING";

    // 1–2 random visa categories
    const numVisa = Math.random() < 0.5 ? 1 : 2;
    const shuffledVisa = [...VISA_CATEGORIES].sort(() => Math.random() - 0.5);
    const visaCategories = shuffledVisa.slice(0, numVisa);

    return {
        id: nanoid(),
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 9000 + 1000)}@example.com`,
        country: countries[i],
        linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${nanoid(6)}`,
        visaCategories: JSON.stringify(visaCategories),
        additionalInfo: null,
        resumePath: null,
        resumeOriginalName: null,
        status,
        createdAt,
        updatedAt: createdAt,
    } as const;
});

// Insert
db.insert(leads).values(records as never).run();

const statusCounts = records.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>
);

console.log(`✓ Seeded ${TOTAL} leads`);
console.log(`  PENDING:     ${statusCounts["PENDING"]}`);
console.log(`  REACHED_OUT: ${statusCounts["REACHED_OUT"]}`);
console.log(`  China (CN):  ${records.filter(r => r.country === "CN").length}`);
console.log(`  India (IN):  ${records.filter(r => r.country === "IN").length}`);
console.log(`  Other:       ${records.filter(r => r.country !== "CN" && r.country !== "IN").length}`);

// Seed admin user
const adminPasswordHash = bcrypt.hashSync("alma1234", 12);

db.insert(users)
    .values({
        id: nanoid(),
        email: "admin@tryalma.ai",
        passwordHash: adminPasswordHash,
        role: "admin",
    })
    .onConflictDoNothing()
    .run();

console.log("✓ Seeded admin user (admin@tryalma.ai / alma1234)");
