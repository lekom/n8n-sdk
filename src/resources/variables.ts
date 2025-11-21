/**
 * Variable resource API
 */

import type { HttpClient, QueryParams } from '../client.js';
import type { RequestOptions } from '../types/common.js';
import type {
  CreateVariableRequest,
  ListVariablesParams,
  UpdateVariableRequest,
  Variable,
  VariableListResponse,
} from '../types/variable.js';

/**
 * API response shape for variable list
 */
interface VariableListApiResponse {
  data: Variable[];
  nextCursor?: string;
}

/**
 * Variables resource for managing n8n environment variables
 */
export class VariablesResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * Create a new variable
   *
   * @param variable - Variable configuration
   * @param options - Request options
   * @returns Created variable
   *
   * @example
   * ```ts
   * const variable = await n8n.variables.create({
   *   key: 'API_BASE_URL',
   *   value: 'https://api.example.com'
   * });
   * ```
   */
  async create(variable: CreateVariableRequest, options?: RequestOptions): Promise<Variable> {
    return this.client.post<Variable>('/variables', variable, options);
  }

  /**
   * List all variables
   *
   * @param params - Query parameters
   * @param options - Request options
   * @returns Paginated list of variables
   *
   * @example
   * ```ts
   * const { data, nextCursor } = await n8n.variables.list();
   *
   * // Filter by project
   * const projectVars = await n8n.variables.list({ projectId: 'project-id' });
   * ```
   */
  async list(
    params?: ListVariablesParams,
    options?: RequestOptions
  ): Promise<VariableListResponse> {
    const response = await this.client.get<VariableListApiResponse>('/variables', params as QueryParams, options);
    return {
      data: response.data,
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Update a variable
   *
   * @param id - Variable ID
   * @param variable - Updated variable configuration
   * @param options - Request options
   *
   * @example
   * ```ts
   * await n8n.variables.update('variable-id', {
   *   key: 'API_BASE_URL',
   *   value: 'https://new-api.example.com'
   * });
   * ```
   */
  async update(
    id: string,
    variable: UpdateVariableRequest,
    options?: RequestOptions
  ): Promise<void> {
    await this.client.put<void>(`/variables/${encodeURIComponent(id)}`, variable, options);
  }

  /**
   * Delete a variable
   *
   * @param id - Variable ID
   * @param options - Request options
   *
   * @example
   * ```ts
   * await n8n.variables.delete('variable-id');
   * ```
   */
  async delete(id: string, options?: RequestOptions): Promise<void> {
    await this.client.delete<void>(`/variables/${encodeURIComponent(id)}`, options);
  }
}
