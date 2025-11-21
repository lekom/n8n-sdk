/**
 * Credential-related types for the n8n SDK
 */

import type { DateTimeString, JsonObject, PaginatedResponse } from './common.js';

/**
 * Credential data (write-only in API)
 */
export type CredentialData = JsonObject;

/**
 * Complete credential object
 */
export interface Credential {
  /** Credential ID (read-only) */
  id: string;
  /** Credential name */
  name: string;
  /** Credential type (e.g., 'githubApi') */
  type: string;
  /** Creation timestamp (read-only) */
  createdAt: DateTimeString;
  /** Last update timestamp (read-only) */
  updatedAt: DateTimeString;
}

/**
 * Credential with data (for creation)
 */
export interface CredentialWithData extends Credential {
  /** Credential data (write-only) */
  data: CredentialData;
}

/**
 * Credential creation request
 */
export interface CreateCredentialRequest {
  /** Credential name */
  name: string;
  /** Credential type */
  type: string;
  /** Credential data */
  data: CredentialData;
}

/**
 * Credential creation response
 */
export interface CreateCredentialResponse {
  /** Created credential ID */
  id: string;
  /** Credential name */
  name: string;
  /** Credential type */
  type: string;
  /** Creation timestamp */
  createdAt: DateTimeString;
  /** Update timestamp */
  updatedAt: DateTimeString;
}

/**
 * Credential list query parameters
 */
export interface ListCredentialsParams {
  /** Maximum number of items */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
}

/**
 * Credential schema property
 */
export interface CredentialSchemaProperty {
  /** Property name */
  displayName: string;
  /** Property name key */
  name: string;
  /** Property type */
  type: string;
  /** Default value */
  default?: unknown;
  /** Whether required */
  required?: boolean;
  /** Property description */
  description?: string;
  /** Property options for select types */
  options?: Array<{ name: string; value: string }>;
}

/**
 * Credential schema
 */
export interface CredentialSchema {
  /** Schema properties */
  properties: CredentialSchemaProperty[];
}

/**
 * Credential transfer request
 */
export interface TransferCredentialRequest {
  /** Destination project ID */
  destinationProjectId: string;
}

/**
 * Paginated credential list response
 */
export type CredentialListResponse = PaginatedResponse<Credential>;
