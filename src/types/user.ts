/**
 * User-related types for the n8n SDK
 */

import type { DateTimeString, PaginatedResponse } from './common.js';

/**
 * User global role
 */
export type UserRole = 'global:owner' | 'global:admin' | 'global:member';

/**
 * User object
 */
export interface User {
  /** User ID */
  id: string;
  /** User email */
  email: string;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Whether user is pending (hasn't accepted invite) */
  isPending: boolean;
  /** User's global role */
  role?: UserRole;
  /** Creation timestamp */
  createdAt: DateTimeString;
  /** Last update timestamp */
  updatedAt: DateTimeString;
}

/**
 * User creation request
 */
export interface CreateUserRequest {
  /** User email */
  email: string;
  /** User role */
  role?: UserRole;
}

/**
 * User creation response
 */
export interface CreateUserResponse {
  /** User details */
  user: {
    /** User ID */
    id: string;
    /** User email */
    email: string;
    /** Invite acceptance URL */
    inviteAcceptUrl?: string;
    /** Whether invite email was sent */
    emailSent: boolean;
  };
  /** Error if any */
  error?: string;
}

/**
 * User list query parameters
 */
export interface ListUsersParams {
  /** Maximum number of items */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
  /** Include role in response */
  includeRole?: boolean;
  /** Filter by project ID */
  projectId?: string;
}

/**
 * User identifier (can be ID or email)
 */
export type UserIdentifier = string;

/**
 * Paginated user list response
 */
export type UserListResponse = PaginatedResponse<User>;
