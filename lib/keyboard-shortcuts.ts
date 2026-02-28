/**
 * Keyboard Shortcut Registry
 *
 * Defines the canonical set of named shortcut IDs (`ShortcutId`), the shape of
 * each shortcut descriptor (`KeyboardShortcut`), and the `DEFAULT_SHORTCUTS`
 * map that acts as the application-wide default keyboard mapping.
 *
 * Other modules register **handlers** for these IDs via `useKeyboardShortcuts`.
 * Changing a binding here propagates automatically to every consumer.
 */

/** All named shortcut identifiers used across the app. */
export type ShortcutId =
    | "pagination.prevPage"
    | "pagination.nextPage"
    | "pagination.firstPage"
    | "pagination.lastPage";

/** Full descriptor for one keyboard shortcut. */
export interface KeyboardShortcut {
    /** The `KeyboardEvent.key` value (e.g. "ArrowLeft", "Enter", "k"). */
    key: string;
    altKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    ctrlKey?: boolean;
    /**
     * Human-readable label used on non-Mac platforms (e.g. "Alt ←").
     * Shown inside `<Kbd>` elements.
     */
    label: string;
    /**
     * Human-readable label used on macOS platforms (e.g. "⌥ ←").
     * Falls back to `label` when not set.
     */
    macLabel?: string;
    /** Short description of what the shortcut does. */
    description: string;
}

/**
 * Application-wide default keyboard bindings.
 *
 * - `pagination.prevPage`  → Alt/⌥ + ←
 * - `pagination.nextPage`  → Alt/⌥ + →
 * - `pagination.firstPage` → Alt/⌥ + Shift + ←
 * - `pagination.lastPage`  → Alt/⌥ + Shift + →
 */
export const DEFAULT_SHORTCUTS: Record<ShortcutId, KeyboardShortcut> = {
    "pagination.prevPage": {
        key: "ArrowLeft",
        altKey: true,
        label: "Alt ←",
        macLabel: "⌥ ←",
        description: "Go to previous page",
    },
    "pagination.nextPage": {
        key: "ArrowRight",
        altKey: true,
        label: "Alt →",
        macLabel: "⌥ →",
        description: "Go to next page",
    },
    "pagination.firstPage": {
        key: "ArrowLeft",
        altKey: true,
        shiftKey: true,
        label: "Alt+Shift ←",
        macLabel: "⌥⇧ ←",
        description: "Go to first page",
    },
    "pagination.lastPage": {
        key: "ArrowRight",
        altKey: true,
        shiftKey: true,
        label: "Alt+Shift →",
        macLabel: "⌥⇧ →",
        description: "Go to last page",
    },
} as const;

/** Returns true when the code is running in a browser on macOS. */
export function isMacPlatform(): boolean {
    if (typeof navigator === "undefined") return false;
    return /mac/i.test(navigator.userAgent) && !/iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Returns the platform-appropriate display label for a shortcut.
 */
export function getShortcutLabel(shortcut: KeyboardShortcut): string {
    return isMacPlatform() && shortcut.macLabel ? shortcut.macLabel : shortcut.label;
}
