/**
 * Common types used across the n8n SDK
 */

/**
 * Pagination cursor for list operations
 */
export interface PaginationParams {
  /** Maximum number of items to return */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  data: T[];
  /** Cursor for next page, if available */
  nextCursor?: string;
}

/**
 * API error response
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** HTTP status code */
  code?: number;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Request configuration options
 */
export interface RequestOptions {
  /** Custom headers to include */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
}

/**
 * ISO 8601 date-time string
 */
export type DateTimeString = string;

/**
 * Generic JSON object
 */
export type JsonObject = Record<string, unknown>;
