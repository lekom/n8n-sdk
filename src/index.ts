/**
 * n8n SDK - TypeScript SDK for the n8n workflow automation platform API
 *
 * @packageDocumentation
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
 * // List workflows
 * const { data: workflows } = await n8n.workflows.list();
 *
 * // Create a workflow
 * const workflow = await n8n.workflows.create({
 *   name: 'My Workflow',
 *   nodes: [
 *     {
 *       name: 'Start',
 *       type: 'n8n-nodes-base.start',
 *       typeVersion: 1,
 *       position: [250, 300]
 *     }
 *   ],
 *   connections: {}
 * });
 *
 * // Activate the workflow
 * await n8n.workflows.activate(workflow.id);
 *
 * // Get executions
 * const { data: executions } = await n8n.executions.list({
 *   workflowId: workflow.id
 * });
 * ```
 */

// Main client
export { N8n, createN8nClient } from './n8n.js';
export type { N8nClientConfig } from './client.js';

// Errors
export {
  N8nAbortError,
  N8nApiError,
  N8nConfigError,
  N8nError,
  N8nNetworkError,
  N8nTimeoutError,
} from './errors.js';

// Resources
export {
  AuditResource,
  CredentialsResource,
  ExecutionsResource,
  ProjectsResource,
  TagsResource,
  UsersResource,
  VariablesResource,
  WorkflowsResource,
} from './resources/index.js';

// Types
export type {
  // Common
  ApiError,
  DateTimeString,
  JsonObject,
  PaginatedResponse,
  PaginationParams,
  RequestOptions,
  // Workflow
  AssignmentCollectionValue,
  CreateWorkflowRequest,
  FilterValue,
  INodeParameterResourceLocator,
  INodeParameters,
  ListWorkflowsParams,
  NodeConnection,
  NodeParameters,
  NodeParameterValue,
  NodeParameterValueType,
  NodePosition,
  ResourceMapperValue,
  UpdateWorkflowRequest,
  UpdateWorkflowTagsRequest,
  Workflow,
  WorkflowConnections,
  WorkflowListResponse,
  WorkflowNode,
  WorkflowSettings,
  WorkflowSharing,
  WorkflowTag,
  // Execution
  Execution,
  ExecutionCustomData,
  ExecutionData,
  ExecutionListResponse,
  ExecutionMode,
  ExecutionNodeData,
  ExecutionStatus,
  ListExecutionsParams,
  // Credential
  CreateCredentialRequest,
  CreateCredentialResponse,
  Credential,
  CredentialData,
  CredentialListResponse,
  CredentialSchema,
  CredentialSchemaProperty,
  CredentialWithData,
  ListCredentialsParams,
  TransferCredentialRequest,
  // User
  CreateUserRequest,
  CreateUserResponse,
  ListUsersParams,
  User,
  UserIdentifier,
  UserListResponse,
  UserRole,
  // Tag
  CreateTagRequest,
  ListTagsParams,
  Tag,
  TagListResponse,
  UpdateTagRequest,
  // Variable
  CreateVariableRequest,
  ListVariablesParams,
  UpdateVariableRequest,
  Variable,
  VariableListResponse,
  // Project
  CreateProjectRequest,
  ListProjectsParams,
  Project,
  ProjectListResponse,
  ProjectRelation,
  ProjectType,
  UpdateProjectRequest,
  // Audit
  AuditCategory,
  AuditCategoryResult,
  AuditFinding,
  AuditResult,
  AuditRiskLevel,
  GenerateAuditRequest,
} from './types/index.js';
