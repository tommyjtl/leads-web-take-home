/**
 * @description Registers global `keydown` listeners for a subset of the named shortcuts
 * defined in `lib/keyboard-shortcuts.ts`.
 *
 * @usage
 * ```tsx
 * useKeyboardShortcuts({
 *   "pagination.prevPage": () => goToPrev(),
 *   "pagination.nextPage": () => goToNext(),
 * });
 * ```
 *
 * - Handlers are matched against `DEFAULT_SHORTCUTS` so bindings are
 *   centrally managed.
 * - Events originating from interactive form elements (input, textarea,
 *   select, contenteditable) are ignored to avoid conflicts with typing.
 * - The `handlers` object is captured in a ref so callers don't need to
 *   memoize it.
 */

"use client";

import { useEffect, useRef } from "react";
import {
    DEFAULT_SHORTCUTS,
    type ShortcutId,
    type KeyboardShortcut,
} from "@/lib/keyboard-shortcuts";

/** Map of shortcut IDs to the handler that should be invoked. */
export type ShortcutHandlers = Partial<Record<ShortcutId, (() => void) | undefined>>;

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function matchesShortcut(e: KeyboardEvent, s: KeyboardShortcut): boolean {
    return (
        e.key === s.key &&
        !!e.altKey === !!s.altKey &&
        !!e.metaKey === !!s.metaKey &&
        !!e.shiftKey === !!s.shiftKey &&
        !!e.ctrlKey === !!s.ctrlKey
    );
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers): void {
    // Keep a stable ref so the effect closure always sees the latest handlers
    // without needing to re-register the listener on every render.
    const handlersRef = useRef<ShortcutHandlers>(handlers);
    handlersRef.current = handlers;

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            const target = e.target as HTMLElement;

            // Skip when focused inside a form element or editable content.
            if (
                TYPING_TAGS.has(target.tagName) ||
                target.isContentEditable
            ) {
                return;
            }

            for (const [id, shortcut] of Object.entries(DEFAULT_SHORTCUTS) as [
                ShortcutId,
                KeyboardShortcut,
            ][]) {
                const handler = handlersRef.current[id];
                if (!handler) continue;
                if (matchesShortcut(e, shortcut)) {
                    e.preventDefault();
                    handler();
                    break;
                }
            }
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
        // Intentionally empty – the effect runs once; handlers are accessed via ref.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
