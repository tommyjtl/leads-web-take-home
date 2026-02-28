import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { StorageService } from "./index";

/**
 * Local-disk storage driver.
 *
 * Files are written to `<rootDir>/<uniqueName>` and served as Next.js static
 * assets under `/uploads/<uniqueName>`.
 *
 * @param rootDir  Absolute path to the directory where files are stored.
 *                 Defaults to `<cwd>/public/uploads`.
 */
export class LocalStorageService implements StorageService {
    private readonly rootDir: string;

    constructor(rootDir?: string) {
        this.rootDir =
            rootDir ?? path.join(process.cwd(), "public", "uploads");

        if (!fs.existsSync(this.rootDir)) {
            fs.mkdirSync(this.rootDir, { recursive: true });
        }
    }

    async save(
        buffer: Buffer,
        filename: string,
        _options?: { mimeType?: string }
    ): Promise<string> {
        const ext = path.extname(filename);
        const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
        const dest = path.join(this.rootDir, uniqueName);
        await fs.promises.writeFile(dest, buffer);
        // Return the path relative to /public so it can be served statically
        return `/uploads/${uniqueName}`;
    }

    async delete(pathOrKey: string): Promise<void> {
        // pathOrKey is like /uploads/<name>; strip the leading /uploads/
        const filename = path.basename(pathOrKey);
        const full = path.join(this.rootDir, filename);
        if (fs.existsSync(full)) {
            await fs.promises.unlink(full);
        }
    }

    publicUrl(pathOrKey: string): string {
        return pathOrKey; // Next.js serves /public/* at the root
    }
}

/** Singleton instance used throughout the server */
export const localStorageService = new LocalStorageService();
