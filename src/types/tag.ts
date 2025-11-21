/**
 * Tag-related types for the n8n SDK
 */

import type { DateTimeString, PaginatedResponse } from './common.js';

/**
 * Tag object
 */
export interface Tag {
  /** Tag ID */
  id: string;
  /** Tag name */
  name: string;
  /** Creation timestamp */
  createdAt: DateTimeString;
  /** Last update timestamp */
  updatedAt: DateTimeString;
}

/**
 * Tag creation request
 */
export interface CreateTagRequest {
  /** Tag name */
  name: string;
}

/**
 * Tag update request
 */
export interface UpdateTagRequest {
  /** Tag name */
  name: string;
}

/**
 * Tag list query parameters
 */
export interface ListTagsParams {
  /** Maximum number of items */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
}

/**
 * Paginated tag list response
 */
export type TagListResponse = PaginatedResponse<Tag>;
