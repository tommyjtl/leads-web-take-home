/**
 * Abstract storage service.
 *
 * Drivers implement this interface so the application code is decoupled from
 * any specific storage backend (local filesystem, S3, GCS, etc.).
 */
export interface StorageService {
    /**
     * Persist a file and return the path/key that can later be used to retrieve
     * or reference the file.
     */
    save(
        buffer: Buffer,
        filename: string,
        options?: { mimeType?: string }
    ): Promise<string>;

    /**
     * Delete a stored file by its path/key.
     */
    delete(pathOrKey: string): Promise<void>;

    /**
     * Return the public URL or absolute filesystem path for a given path/key.
     */
    publicUrl(pathOrKey: string): string;
}
