
/*
 * File: session.ts
 *
 * Purpose:
 * Implements MiniWeb's browser navigation state.
 *
 * Responsibilities:
 * - Maintain the browser's navigation entries and current position.
 * - Navigate to new pages.
 * - Move backward and forward through the navigation trail.
 * - Discard forward entries when a new destination is opened.
 * - Preserve the scroll position of previously visited pages.
 * - Jump to an existing entry when requested.
 *
 * Architecture:
 * This module contains pure state-management functions.
 * It does not fetch data, access the browser or communicate
 * with the backend. Those responsibilities belong elsewhere.
 */

import type {
  BrowserEntry,
  BrowserSession,
}  from '@/components/types/miniweb';

/**
 * Creates an empty browser session.
 *
 * An index of -1 means that no page has been opened yet.
 */
export function createInitialSession(): BrowserSession {
  return {
    entries: [],
    index: -1,
  };
}

/**
 * Returns the current navigation entry, if one exists.
 */
export function getCurrentEntry(
  session: BrowserSession,
): BrowserEntry | null {
  if (session.index < 0 || session.index >= session.entries.length) {
    return null;
  }

  return session.entries[session.index];
}

/**
 * Adds a new destination to the navigation trail.
 *
 * Any entries after the current position are removed first.
 * This reproduces normal browser behaviour when a user goes
 * Back and then navigates to a different destination.
 */
export function navigateTo(
  session: BrowserSession,
  entry: BrowserEntry,
): BrowserSession {
  const retainedEntries = session.entries.slice(0, session.index + 1);

  return {
    entries: [...retainedEntries, entry],
    index: retainedEntries.length,
  };
}

/**
 * Moves one position backward in the navigation trail.
 *
 * Returns the original session when Back is unavailable.
 */
export function goBack(
  session: BrowserSession,
): BrowserSession {
  if (session.index <= 0) {
    return session;
  }

  return {
    ...session,
    index: session.index - 1,
  };
}

/**
 * Moves one position forward in the navigation trail.
 *
 * Returns the original session when Forward is unavailable.
 */
export function goForward(
  session: BrowserSession,
): BrowserSession {
  if (session.index >= session.entries.length - 1) {
    return session;
  }

  return {
    ...session,
    index: session.index + 1,
  };
}

/**
 * Updates the saved scroll position of the current entry.
 *
 * This allows a page to be restored at the position where
 * the person stopped reading it.
 */
export function updateCurrentScroll(
  session: BrowserSession,
  scrollY: number,
): BrowserSession {
  const currentEntry = getCurrentEntry(session);

  if (!currentEntry) {
    return session;
  }

  const updatedEntries = [...session.entries];

  updatedEntries[session.index] = {
    ...currentEntry,
    scrollY: Math.max(0, scrollY),
  };

  return {
    ...session,
    entries: updatedEntries,
  };
}

/**
 * Jumps to an existing entry in the navigation trail.
 *
 * This changes the current position without creating
 * a new navigation entry or deleting the forward branch.
 */
export function jumpToEntry(
  session: BrowserSession,
  targetIndex: number,
): BrowserSession {
  if (
    !Number.isInteger(targetIndex) ||
    targetIndex < 0 ||
    targetIndex >= session.entries.length
  ) {
    return session;
  }

  return {
    ...session,
    index: targetIndex,
  };
}

/**
 * Indicates whether the browser can navigate backward.
 */
export function canGoBack(session: BrowserSession): boolean {
  return session.index > 0;
}

/**
 * Indicates whether the browser can navigate forward.
 */
export function canGoForward(session: BrowserSession): boolean {
  return (
    session.index >= 0 &&
    session.index < session.entries.length - 1
  );
}
