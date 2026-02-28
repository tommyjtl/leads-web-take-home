import { NextRequest, NextResponse } from "next/server";
import { localStorageService } from "@/lib/storage/local";

const ALLOWED_MIME_TYPES = [
    "application/pdf",
];

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/upload
 * Accepts a multipart form with a `file` field (resume/CV).
 * Returns { path, originalName }.
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Only PDF files are accepted" },
                { status: 415 }
            );
        }

        if (file.size > MAX_BYTES) {
            return NextResponse.json(
                { error: "File exceeds 10 MB limit" },
                { status: 413 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const path = await localStorageService.save(buffer, file.name, {
            mimeType: file.type,
        });

        return NextResponse.json({ path, originalName: file.name });
    } catch (err) {
        console.error("[upload]", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
