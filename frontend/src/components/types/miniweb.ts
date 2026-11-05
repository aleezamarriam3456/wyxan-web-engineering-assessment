
/*
 * File: miniweb.ts
 *
 * Purpose:
 * Defines the shared TypeScript data models used throughout MiniWeb.
 *
 * Responsibilities:
 * - Represent websites, people, visits and search results.
 * - Define the supported navigation sources.
 * - Model browser session entries and navigation state.
 * - Define request payloads sent to the NestJS API.
 *
 * Architecture:
 * These types keep the frontend data contracts consistent with
 * the backend MongoDB schemas and REST API responses.
 *
 * Important:
 * API timestamps are represented as strings because JSON responses
 * serialize JavaScript Date values into ISO date strings.
 */

/* --------------------------------------------------
   People
-------------------------------------------------- */

/**
 * A person who can browse websites in MiniWeb.
 * Matches the backend Person schema.
 */
export interface Person {
  _id?: string;
  name: string;
}

/* --------------------------------------------------
   Websites
-------------------------------------------------- */

/**
 * A website stored in the MiniWeb database.
 * Matches the backend Site schema.
 */
export interface Site {
  _id?: string;
  address: string;
  title: string;
  html: string;
  text: string;
  author: string;
  createdAt: string;
}

/**
 * Data required to publish a new website.
 * The backend sanitizes the supplied HTML and extracts its text.
 */
export interface CreateSitePayload {
  address: string;
  title: string;
  html: string;
  author: string;
}

/* --------------------------------------------------
   Browsing visits
-------------------------------------------------- */

/**
 * Describes how a person arrived at a website.
 * Keep these values consistent with the backend VisitSource enum.
 */
export type VisitSource =
  | 'typed'
  | 'link'
  | 'back'
  | 'forward'
  | 'history'
  | 'search';

/**
 * A recorded visit to a website.
 * Matches the backend Visit schema.
 */
export interface Visit {
  _id?: string;
  person: string;
  address: string;
  at: string;
  via: VisitSource;
  found: boolean;
  seeded: boolean;
}

/**
 * Data sent when recording a new browsing visit.
 * The backend assigns the visit timestamp and seeded status.
 */
export interface CreateVisitPayload {
  person: string;
  address: string;
  via: VisitSource;
  found: boolean;
}

/* --------------------------------------------------
   Full-text search
-------------------------------------------------- */

/**
 * A text excerpt returned by the backend search endpoint.
 *
 * The hit property indicates whether the backend found the
 * complete query inside the excerpt.
 */
export interface SearchSnippet {
  text: string;
  hit: boolean;
}

/**
 * One matching website returned by full-text search.
 */
export interface SearchResult {
  address: string;
  title: string;
  snippets: SearchSnippet[];
}

/* --------------------------------------------------
   Browser navigation
-------------------------------------------------- */

/**
 * The three possible browser page states.
 *
 * site:
 * A website successfully loaded from the database.
 *
 * search:
 * A page containing full-text search results.
 *
 * nowhere:
 * An address that does not exist in MiniWeb.
 */
export type BrowserEntryKind = 'site' | 'search' | 'nowhere';

/**
 * A successfully loaded website in the browser session.
 *
 * Keeping the site response in the entry allows Back and Forward
 * to restore the previous page without another API request.
 */
export interface SiteEntry {
  kind: 'site';
  address: string;
  site: Site;
  scrollY: number;
  via: VisitSource;
}

/**
 * A search-results page stored in browser navigation history.
 *
 * Keeping the results here allows Back navigation to restore
 * the previous search results and their scroll position.
 */
export interface SearchEntry {
  kind: 'search';
  query: string;
  results: SearchResult[];
  scrollY: number;
}

/**
 * A missing website displayed as the MiniWeb Nowhere page.
 */
export interface NowhereEntry {
  kind: 'nowhere';
  address: string;
  scrollY: number;
  via: VisitSource;
}

/**
 * A single entry in the browser's navigation stack.
 */
export type BrowserEntry =
  | SiteEntry
  | SearchEntry
  | NowhereEntry;

/**
 * Client-side browser navigation state.
 *
 * entries:
 * All retained navigation entries.
 *
 * index:
 * The currently active entry. Entries after this position
 * represent the available Forward navigation branch.
 */
export interface BrowserSession {
  entries: BrowserEntry[];
  index: number;
}

/* --------------------------------------------------
   API and interface states
-------------------------------------------------- */

/**
 * Represents the main states of an API request.
 */
export type RequestStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

/**
 * Standard API error response.
 * NestJS returns a message and statusCode for HTTP exceptions.
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}
