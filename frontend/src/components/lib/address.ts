
/*
 * File: address.ts
 *
 * Purpose:
 * Provides shared utilities for MiniWeb's internal website addresses.
 *
 * Responsibilities:
 * - Normalize addresses entered in the browser address bar.
 * - Convert addresses to lowercase.
 * - Add the .zz suffix when it is missing.
 * - Validate addresses against MiniWeb's address format.
 *
 * Architecture:
 * Keep address handling centralized so navigation, publishing,
 * search results and internal links follow the same rules.
 */

/**
 * MiniWeb supports one internal domain format:
 * lowercase letters, numbers and single hyphens, followed by .zz.
 *
 * Examples:
 * - tidepool.zz
 * - harbour-bakery.zz
 * - fieldnotes.zz
 */
const ADDRESS_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.zz$/;

/**
 * Normalizes an address entered by a user.
 *
 * Examples:
 * - "Tidepool"              -> "tidepool.zz"
 * - "TIDEPOOL.ZZ"           -> "tidepool.zz"
 * - "https://tidepool.zz/"  -> "tidepool.zz"
 *
 * This function normalizes formatting only.
 * Use isValidAddress() to check whether the result is valid.
 */
export function normalizeAddress(input: string): string {
  const trimmedInput = input.trim().toLowerCase();

  if (!trimmedInput) {
    return '';
  }

  // Accept an optional HTTP or HTTPS prefix.
  const withoutProtocol = trimmedInput.replace(/^https?:\/\//, '');

  // Remove trailing slashes without allowing paths or query strings.
  const withoutTrailingSlash = withoutProtocol.replace(/\/+$/, '');

  // Add the internal domain suffix when it is missing.
  return withoutTrailingSlash.endsWith('.zz')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}.zz`;
}

/**
 * Checks whether an address follows MiniWeb's supported format.
 *
 * The input is normalized first, so users do not need to enter
 * the address in lowercase or include the .zz suffix themselves.
 */
export function isValidAddress(input: string): boolean {
  const normalizedAddress = normalizeAddress(input);

  return ADDRESS_PATTERN.test(normalizedAddress);
}
