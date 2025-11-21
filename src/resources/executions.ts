/**
 * Execution resource API
 */

import type { HttpClient, QueryParams } from '../client.js';
import type { RequestOptions } from '../types/common.js';
import type {
  Execution,
  ExecutionListResponse,
  ListExecutionsParams,
} from '../types/execution.js';

/**
 * API response shape for execution list
 */
interface ExecutionListApiResponse {
  data: Execution[];
  nextCursor?: string;
}

/**
 * Executions resource for managing n8n workflow executions
 */
export class ExecutionsResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * List all executions
   *
   * @param params - Query parameters
   * @param options - Request options
   * @returns Paginated list of executions
   *
   * @example
   * ```ts
   * // Get all executions
   * const { data, nextCursor } = await n8n.executions.list();
   *
   * // Filter by status
   * const failed = await n8n.executions.list({ status: 'error' });
   *
   * // Filter by workflow
   * const workflowExecutions = await n8n.executions.list({
   *   workflowId: 'workflow-id'
   * });
   * ```
   */
  async list(
    params?: ListExecutionsParams,
    options?: RequestOptions
  ): Promise<ExecutionListResponse> {
    const response = await this.client.get<ExecutionListApiResponse>('/executions', params as QueryParams, options);
    return {
      data: response.data,
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Get an execution by ID
   *
   * @param id - Execution ID
   * @param includeData - Include execution data in response
   * @param options - Request options
   * @returns Execution details
   *
   * @example
   * ```ts
   * // Get execution without data
   * const execution = await n8n.executions.get(1000);
   *
   * // Get execution with full data
   * const executionWithData = await n8n.executions.get(1000, true);
   * ```
   */
  async get(
    id: number,
    includeData?: boolean,
    options?: RequestOptions
  ): Promise<Execution> {
    const query = includeData !== undefined ? { includeData } : undefined;
    return this.client.get<Execution>(`/executions/${id}`, query, options);
  }

  /**
   * Delete an execution
   *
   * @param id - Execution ID
   * @param options - Request options
   * @returns Deleted execution
   *
   * @example
   * ```ts
   * const deletedExecution = await n8n.executions.delete(1000);
   * ```
   */
  async delete(id: number, options?: RequestOptions): Promise<Execution> {
    return this.client.delete<Execution>(`/executions/${id}`, options);
  }

  /**
   * Get executions for a specific workflow
   *
   * @param workflowId - Workflow ID
   * @param params - Additional query parameters
   * @param options - Request options
   * @returns Paginated list of executions
   *
   * @example
   * ```ts
   * const executions = await n8n.executions.getByWorkflow('workflow-id');
   * ```
   */
  async getByWorkflow(
    workflowId: string,
    params?: Omit<ListExecutionsParams, 'workflowId'>,
    options?: RequestOptions
  ): Promise<ExecutionListResponse> {
    return this.list({ ...params, workflowId }, options);
  }

  /**
   * Get running executions
   *
   * @param params - Additional query parameters
   * @param options - Request options
   * @returns Paginated list of running executions
   *
   * @example
   * ```ts
   * const running = await n8n.executions.getRunning();
   * ```
   */
  async getRunning(
    params?: Omit<ListExecutionsParams, 'status'>,
    options?: RequestOptions
  ): Promise<ExecutionListResponse> {
    return this.list({ ...params, status: 'running' }, options);
  }

  /**
   * Get failed executions
   *
   * @param params - Additional query parameters
   * @param options - Request options
   * @returns Paginated list of failed executions
   *
   * @example
   * ```ts
   * const failed = await n8n.executions.getFailed();
   * ```
   */
  async getFailed(
    params?: Omit<ListExecutionsParams, 'status'>,
    options?: RequestOptions
  ): Promise<ExecutionListResponse> {
    return this.list({ ...params, status: 'error' }, options);
  }

  /**
   * Get successful executions
   *
   * @param params - Additional query parameters
   * @param options - Request options
   * @returns Paginated list of successful executions
   *
   * @example
   * ```ts
   * const successful = await n8n.executions.getSuccessful();
   * ```
   */
  async getSuccessful(
    params?: Omit<ListExecutionsParams, 'status'>,
    options?: RequestOptions
  ): Promise<ExecutionListResponse> {
    return this.list({ ...params, status: 'success' }, options);
  }

  /**
   * Get waiting executions
   *
   * @param params - Additional query parameters
   * @param options - Request options
   * @returns Paginated list of waiting executions
   *
   * @example
   * ```ts
   * const waiting = await n8n.executions.getWaiting();
   * ```
   */
  async getWaiting(
    params?: Omit<ListExecutionsParams, 'status'>,
    options?: RequestOptions
  ): Promise<ExecutionListResponse> {
    return this.list({ ...params, status: 'waiting' }, options);
  }
}
