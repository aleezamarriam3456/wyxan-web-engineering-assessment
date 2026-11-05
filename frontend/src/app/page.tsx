
/*
 * File: page.tsx
 *
 * Purpose:
 * Defines the root page of the MiniWeb application.
 *
 * Responsibilities:
 * - Serve as the entry point for the browser interface.
 * - Render the main MiniWeb application component.
 * - Keep the Next.js route layer separate from browser functionality.
 *
 * Architecture:
 * Browser state, navigation, history, search and publishing logic
 * are implemented in the MiniWeb application component rather
 * than being placed directly inside this route file.
 */

import MiniWebApp from "@/components/miniweb/MiniWebApp";

/**
 * MiniWeb home page.
 *
 * This is the main application route ("/").
 */
export default function HomePage() {
  return <MiniWebApp />;
}
