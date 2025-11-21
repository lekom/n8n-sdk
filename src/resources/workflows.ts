/**
 * Workflow resource API
 */

import type { HttpClient, QueryParams } from '../client.js';
import type { RequestOptions } from '../types/common.js';
import type {
  CreateWorkflowRequest,
  ListWorkflowsParams,
  UpdateWorkflowRequest,
  UpdateWorkflowTagsRequest,
  Workflow,
  WorkflowListResponse,
  WorkflowTag,
} from '../types/workflow.js';

/**
 * API response shape for workflow list
 */
interface WorkflowListApiResponse {
  data: Workflow[];
  nextCursor?: string;
}

/**
 * Workflows resource for managing n8n workflows
 */
export class WorkflowsResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * Create a new workflow
   *
   * @param workflow - Workflow configuration
   * @param options - Request options
   * @returns Created workflow
   *
   * @example
   * ```ts
   * const workflow = await n8n.workflows.create({
   *   name: 'My Workflow',
   *   nodes: [...],
   *   connections: {...}
   * });
   * ```
   */
  async create(workflow: CreateWorkflowRequest, options?: RequestOptions): Promise<Workflow> {
    return this.client.post<Workflow>('/workflows', workflow, options);
  }

  /**
   * List all workflows
   *
   * @param params - Query parameters
   * @param options - Request options
   * @returns Paginated list of workflows
   *
   * @example
   * ```ts
   * // Get all workflows
   * const { data, nextCursor } = await n8n.workflows.list();
   *
   * // Filter by active status
   * const activeWorkflows = await n8n.workflows.list({ active: true });
   *
   * // Paginate through results
   * let cursor: string | undefined;
   * do {
   *   const response = await n8n.workflows.list({ cursor, limit: 10 });
   *   console.log(response.data);
   *   cursor = response.nextCursor;
   * } while (cursor);
   * ```
   */
  async list(params?: ListWorkflowsParams, options?: RequestOptions): Promise<WorkflowListResponse> {
    const response = await this.client.get<WorkflowListApiResponse>('/workflows', params as QueryParams, options);
    return {
      data: response.data,
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Get a workflow by ID
   *
   * @param id - Workflow ID
   * @param excludePinnedData - Whether to exclude pinned data
   * @param options - Request options
   * @returns Workflow details
   *
   * @example
   * ```ts
   * const workflow = await n8n.workflows.get('workflow-id');
   * ```
   */
  async get(
    id: string,
    excludePinnedData?: boolean,
    options?: RequestOptions
  ): Promise<Workflow> {
    const query = excludePinnedData !== undefined ? { excludePinnedData } : undefined;
    return this.client.get<Workflow>(`/workflows/${encodeURIComponent(id)}`, query, options);
  }

  /**
   * Update a workflow
   *
   * @param id - Workflow ID
   * @param workflow - Updated workflow configuration
   * @param options - Request options
   * @returns Updated workflow
   *
   * @example
   * ```ts
   * const workflow = await n8n.workflows.update('workflow-id', {
   *   name: 'Updated Workflow Name'
   * });
   * ```
   */
  async update(
    id: string,
    workflow: UpdateWorkflowRequest,
    options?: RequestOptions
  ): Promise<Workflow> {
    return this.client.put<Workflow>(`/workflows/${encodeURIComponent(id)}`, workflow, options);
  }

  /**
   * Delete a workflow
   *
   * @param id - Workflow ID
   * @param options - Request options
   * @returns Deleted workflow
   *
   * @example
   * ```ts
   * const deletedWorkflow = await n8n.workflows.delete('workflow-id');
   * ```
   */
  async delete(id: string, options?: RequestOptions): Promise<Workflow> {
    return this.client.delete<Workflow>(`/workflows/${encodeURIComponent(id)}`, options);
  }

  /**
   * Activate a workflow
   *
   * @param id - Workflow ID
   * @param options - Request options
   * @returns Activated workflow
   *
   * @example
   * ```ts
   * const workflow = await n8n.workflows.activate('workflow-id');
   * console.log(workflow.active); // true
   * ```
   */
  async activate(id: string, options?: RequestOptions): Promise<Workflow> {
    return this.client.post<Workflow>(
      `/workflows/${encodeURIComponent(id)}/activate`,
      undefined,
      options
    );
  }

  /**
   * Deactivate a workflow
   *
   * @param id - Workflow ID
   * @param options - Request options
   * @returns Deactivated workflow
   *
   * @example
   * ```ts
   * const workflow = await n8n.workflows.deactivate('workflow-id');
   * console.log(workflow.active); // false
   * ```
   */
  async deactivate(id: string, options?: RequestOptions): Promise<Workflow> {
    return this.client.post<Workflow>(
      `/workflows/${encodeURIComponent(id)}/deactivate`,
      undefined,
      options
    );
  }

  /**
   * Get workflow tags
   *
   * @param id - Workflow ID
   * @param options - Request options
   * @returns Array of workflow tags
   *
   * @example
   * ```ts
   * const tags = await n8n.workflows.getTags('workflow-id');
   * ```
   */
  async getTags(id: string, options?: RequestOptions): Promise<WorkflowTag[]> {
    return this.client.get<WorkflowTag[]>(`/workflows/${encodeURIComponent(id)}/tags`, undefined, options);
  }

  /**
   * Update workflow tags
   *
   * @param id - Workflow ID
   * @param request - Tag IDs to assign
   * @param options - Request options
   * @returns Updated tags
   *
   * @example
   * ```ts
   * const tags = await n8n.workflows.updateTags('workflow-id', {
   *   tagIds: ['tag-1', 'tag-2']
   * });
   * ```
   */
  async updateTags(
    id: string,
    request: UpdateWorkflowTagsRequest,
    options?: RequestOptions
  ): Promise<WorkflowTag[]> {
    return this.client.put<WorkflowTag[]>(
      `/workflows/${encodeURIComponent(id)}/tags`,
      request,
      options
    );
  }

  /**
   * Transfer a workflow to a different project
   *
   * @param id - Workflow ID
   * @param destinationProjectId - Target project ID
   * @param options - Request options
   *
   * @example
   * ```ts
   * await n8n.workflows.transfer('workflow-id', 'project-id');
   * ```
   */
  async transfer(
    id: string,
    destinationProjectId: string,
    options?: RequestOptions
  ): Promise<void> {
    await this.client.put<void>(
      `/workflows/${encodeURIComponent(id)}/transfer`,
      { destinationProjectId },
      options
    );
  }
}
