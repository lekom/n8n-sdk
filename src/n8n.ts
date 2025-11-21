/**
 * Main n8n SDK client
 */

import { HttpClient, type N8nClientConfig } from './client.js';
import {
  AuditResource,
  CredentialsResource,
  ExecutionsResource,
  ProjectsResource,
  TagsResource,
  UsersResource,
  VariablesResource,
  WorkflowsResource,
} from './resources/index.js';

/**
 * n8n SDK client for interacting with the n8n API
 *
 * @example
 * ```ts
 * import { N8n } from 'n8n-sdk';
 *
 * const n8n = new N8n({
 *   baseUrl: 'https://your-n8n-instance.com',
 *   apiKey: 'your-api-key'
 * });
 *
 * // List all workflows
 * const workflows = await n8n.workflows.list();
 *
 * // Create a workflow
 * const workflow = await n8n.workflows.create({
 *   name: 'My Workflow',
 *   nodes: [...],
 *   connections: {...}
 * });
 *
 * // Activate a workflow
 * await n8n.workflows.activate(workflow.id);
 * ```
 */
export class N8n {
  private readonly client: HttpClient;

  /** Workflows API */
  readonly workflows: WorkflowsResource;
  /** Executions API */
  readonly executions: ExecutionsResource;
  /** Credentials API */
  readonly credentials: CredentialsResource;
  /** Users API */
  readonly users: UsersResource;
  /** Tags API */
  readonly tags: TagsResource;
  /** Variables API */
  readonly variables: VariablesResource;
  /** Projects API */
  readonly projects: ProjectsResource;
  /** Audit API */
  readonly audit: AuditResource;

  /**
   * Create a new n8n SDK client
   *
   * @param config - Client configuration
   *
   * @example
   * ```ts
   * // Basic configuration
   * const n8n = new N8n({
   *   baseUrl: 'https://your-n8n-instance.com',
   *   apiKey: 'your-api-key'
   * });
   *
   * // With custom timeout and headers
   * const n8n = new N8n({
   *   baseUrl: 'https://your-n8n-instance.com',
   *   apiKey: 'your-api-key',
   *   timeout: 60000,
   *   headers: {
   *     'X-Custom-Header': 'value'
   *   }
   * });
   * ```
   */
  constructor(config: N8nClientConfig) {
    this.client = new HttpClient(config);
    this.workflows = new WorkflowsResource(this.client);
    this.executions = new ExecutionsResource(this.client);
    this.credentials = new CredentialsResource(this.client);
    this.users = new UsersResource(this.client);
    this.tags = new TagsResource(this.client);
    this.variables = new VariablesResource(this.client);
    this.projects = new ProjectsResource(this.client);
    this.audit = new AuditResource(this.client);
  }
}

/**
 * Create a new n8n SDK client
 *
 * @param config - Client configuration
 * @returns n8n SDK client instance
 *
 * @example
 * ```ts
 * import { createN8nClient } from 'n8n-sdk';
 *
 * const n8n = createN8nClient({
 *   baseUrl: 'https://your-n8n-instance.com',
 *   apiKey: 'your-api-key'
 * });
 * ```
 */
export function createN8nClient(config: N8nClientConfig): N8n {
  return new N8n(config);
}
