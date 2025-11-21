/**
 * Variable-related types for the n8n SDK
 */

import type { PaginatedResponse } from './common.js';

/**
 * Variable object
 */
export interface Variable {
  /** Variable ID */
  id: string;
  /** Variable key */
  key: string;
  /** Variable value */
  value: string;
  /** Variable type */
  type: string;
}

/**
 * Variable creation request
 */
export interface CreateVariableRequest {
  /** Variable key */
  key: string;
  /** Variable value */
  value: string;
}

/**
 * Variable update request
 */
export interface UpdateVariableRequest {
  /** Variable key */
  key: string;
  /** Variable value */
  value: string;
}

/**
 * Variable list query parameters
 */
export interface ListVariablesParams {
  /** Maximum number of items */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
  /** Filter by project ID */
  projectId?: string;
  /** Filter by state */
  state?: 'empty';
}

/**
 * Paginated variable list response
 */
export type VariableListResponse = PaginatedResponse<Variable>;
