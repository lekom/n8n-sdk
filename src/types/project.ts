/**
 * Project-related types for the n8n SDK
 */

import type { DateTimeString, PaginatedResponse } from './common.js';

/**
 * Project type
 */
export type ProjectType = 'personal' | 'team';

/**
 * Project relation (user access)
 */
export interface ProjectRelation {
  /** User ID */
  userId: string;
  /** User role in project */
  role: string;
  /** Creation timestamp */
  createdAt: DateTimeString;
  /** Update timestamp */
  updatedAt: DateTimeString;
}

/**
 * Project object
 */
export interface Project {
  /** Project ID */
  id: string;
  /** Project name */
  name: string;
  /** Project type */
  type: ProjectType;
  /** Project relations (user access) */
  relations?: ProjectRelation[];
  /** Creation timestamp */
  createdAt: DateTimeString;
  /** Update timestamp */
  updatedAt: DateTimeString;
}

/**
 * Project creation request
 */
export interface CreateProjectRequest {
  /** Project name */
  name: string;
}

/**
 * Project update request
 */
export interface UpdateProjectRequest {
  /** Project name */
  name: string;
}

/**
 * Project list query parameters
 */
export interface ListProjectsParams {
  /** Maximum number of items */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
}

/**
 * Paginated project list response
 */
export type ProjectListResponse = PaginatedResponse<Project>;
