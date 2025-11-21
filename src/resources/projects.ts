/**
 * Project resource API
 */

import type { HttpClient, QueryParams } from '../client.js';
import type { RequestOptions } from '../types/common.js';
import type {
  CreateProjectRequest,
  ListProjectsParams,
  Project,
  ProjectListResponse,
  UpdateProjectRequest,
} from '../types/project.js';

/**
 * API response shape for project list
 */
interface ProjectListApiResponse {
  data: Project[];
  nextCursor?: string;
}

/**
 * Projects resource for managing n8n projects
 */
export class ProjectsResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * Create a new project
   *
   * @param project - Project configuration
   * @param options - Request options
   * @returns Created project
   *
   * @example
   * ```ts
   * const project = await n8n.projects.create({ name: 'Production Workflows' });
   * ```
   */
  async create(project: CreateProjectRequest, options?: RequestOptions): Promise<Project> {
    return this.client.post<Project>('/projects', project, options);
  }

  /**
   * List all projects
   *
   * @param params - Query parameters
   * @param options - Request options
   * @returns Paginated list of projects
   *
   * @example
   * ```ts
   * const { data, nextCursor } = await n8n.projects.list();
   * ```
   */
  async list(
    params?: ListProjectsParams,
    options?: RequestOptions
  ): Promise<ProjectListResponse> {
    const response = await this.client.get<ProjectListApiResponse>('/projects', params as QueryParams, options);
    return {
      data: response.data,
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Get a project by ID
   *
   * @param id - Project ID
   * @param options - Request options
   * @returns Project details
   *
   * @example
   * ```ts
   * const project = await n8n.projects.get('project-id');
   * ```
   */
  async get(id: string, options?: RequestOptions): Promise<Project> {
    return this.client.get<Project>(`/projects/${encodeURIComponent(id)}`, undefined, options);
  }

  /**
   * Update a project
   *
   * @param id - Project ID
   * @param project - Updated project configuration
   * @param options - Request options
   * @returns Updated project
   *
   * @example
   * ```ts
   * const project = await n8n.projects.update('project-id', {
   *   name: 'Staging Workflows'
   * });
   * ```
   */
  async update(
    id: string,
    project: UpdateProjectRequest,
    options?: RequestOptions
  ): Promise<Project> {
    return this.client.put<Project>(`/projects/${encodeURIComponent(id)}`, project, options);
  }

  /**
   * Delete a project
   *
   * @param id - Project ID
   * @param options - Request options
   *
   * @example
   * ```ts
   * await n8n.projects.delete('project-id');
   * ```
   */
  async delete(id: string, options?: RequestOptions): Promise<void> {
    await this.client.delete<void>(`/projects/${encodeURIComponent(id)}`, options);
  }
}
