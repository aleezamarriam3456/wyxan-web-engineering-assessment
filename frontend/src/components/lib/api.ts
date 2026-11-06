
/*
 * File: api.ts
 *
 * Purpose:
 * Centralized, typed client for the MiniWeb REST API.
 *
 * Responsibilities:
 * - Retrieve people and all published websites.
 * - Retrieve an individual website.
 * - Create websites and record browsing visits.
 * - Retrieve a person's browsing history.
 * - Search website content.
 * - Handle API errors consistently.
 */

import type {
  ApiErrorResponse,
  CreateSitePayload,
  CreateVisitPayload,
  Person,
  SearchResult,
  Site,
  Visit,
} from '@/components/types/miniweb';

/**
 * Backend API address.
 * Keep the /api suffix in the configured URL.
 */
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'
).replace(/\/+$/, '');

/**
 * Represents an unsuccessful API response.
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Sends a request to the NestJS backend
 * and returns typed response data.
 */
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers,
  });

  const responseText = await response.text();

  let responseData: unknown = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    const errorData =
      responseData as Partial<ApiErrorResponse> | null;

    const message = Array.isArray(errorData?.message)
      ? errorData.message.join(', ')
      : typeof errorData?.message === 'string'
        ? errorData.message
        : `Request failed with status ${response.status}.`;

    throw new ApiRequestError(message, response.status);
  }

  return responseData as T;
}

/* -------------------------------------------------------------------------- */
/* People                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves available browsing identities.
 *
 * Backend endpoint: GET /api/people
 */
export function getPeople(): Promise<Person[]> {
  return request<Person[]>('/people');
}

/* -------------------------------------------------------------------------- */
/* Websites                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves all published websites.
 *
 * Used by the Browse screen to display the website directory.
 *
 * Backend endpoint: GET /api/sites
 */
export function getSites(): Promise<Site[]> {
  return request<Site[]>('/sites');
}

/**
 * Retrieves a website by its internal address.
 *
 * Backend endpoint: GET /api/sites/:address
 */
export function getSite(address: string): Promise<Site> {
  return request<Site>(
    `/sites/${encodeURIComponent(address)}`,
  );
}

/**
 * Publishes a new website.
 *
 * Backend endpoint: POST /api/sites
 */
export function createSite(
  payload: CreateSitePayload,
): Promise<Site> {
  return request<Site>('/sites', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Searches website content through the backend's full-text index.
 *
 * Backend endpoint: GET /api/search?q=...
 */
export function searchSites(
  query: string,
): Promise<SearchResult[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return Promise.resolve([]);
  }

  const searchParams = new URLSearchParams({
    q: normalizedQuery,
  });

  return request<SearchResult[]>(
    `/search?${searchParams.toString()}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Browsing history                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Records a person's arrival at a website.
 *
 * Backend endpoint: POST /api/visits
 */
export function createVisit(
  payload: CreateVisitPayload,
): Promise<Visit> {
  return request<Visit>('/visits', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Retrieves browsing history for one person.
 * Backend returns newest visits first.
 *
 * Backend endpoint: GET /api/visits?person=...&limit=...
 */
export function getVisits(
  person: string,
  limit = 200,
): Promise<Visit[]> {
  const searchParams = new URLSearchParams({
    person,
    limit: String(limit),
  });

  return request<Visit[]>(
    `/visits?${searchParams.toString()}`,
  );
}
