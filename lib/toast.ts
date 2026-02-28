/**
 * ToastService
 *
 * A thin singleton wrapper around sonner's `toast` that centralises all
 * notification logic in one place. Import `toastService` wherever you need to
 * show a notification — no need to import sonner directly in feature code.
 *
 * Usage:
 *   import { toastService } from "@/lib/toast"
 *   toastService.leadStatusChanged("REACHED_OUT")
 */

import { toast } from "sonner";
import type { LeadStatus } from "@/lib/types";

const STATUS_LABELS: Record<LeadStatus, string> = {
    PENDING: "Pending",
    REACHED_OUT: "Reached Out",
};

class ToastService {
    /** Shown after a lead's status is successfully updated. */
    leadStatusChanged(newStatus: LeadStatus) {
        toast.success("Status updated", {
            description: `Lead marked as "${STATUS_LABELS[newStatus]}"`,
        });
    }

    /** Generic success notification. */
    success(message: string, description?: string) {
        toast.success(message, { description });
    }

    /** Generic error notification. */
    error(message: string, description?: string) {
        toast.error(message, { description });
    }

    /** Generic info notification. */
    info(message: string, description?: string) {
        toast.info(message, { description });
    }
}

// Export a single shared instance
export const toastService = new ToastService();
