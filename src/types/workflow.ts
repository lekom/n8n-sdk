/**
 * Workflow-related types for the n8n SDK
 */

import type { DateTimeString, JsonObject, PaginatedResponse } from './common.js';

/**
 * Workflow node position
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Basic node parameter value (scalar types)
 */
export type NodeParameterValue = string | number | boolean | undefined | null;

/**
 * Resource locator for referencing external resources
 */
export interface INodeParameterResourceLocator {
  __rl: true;
  mode: string;
  value: NodeParameterValue;
  cachedResultName?: string;
  cachedResultUrl?: string;
}

/**
 * Resource mapper value for mapping fields
 */
export interface ResourceMapperValue {
  mappingMode: string;
  value: Record<string, unknown> | null;
  matchingColumns?: string[];
  schema?: Array<{
    id: string;
    displayName: string;
    type: string;
    required?: boolean;
    display?: boolean;
    canBeUsedToMatch?: boolean;
    removed?: boolean;
    readOnly?: boolean;
    defaultMatch?: boolean;
    options?: Array<{ name: string; value: string }>;
  }>;
}

/**
 * Filter value for conditional operations
 */
export interface FilterValue {
  conditions: Array<{
    id: string;
    leftValue: NodeParameterValueType;
    operator: {
      type: string;
      operation: string;
      rightType?: string;
      singleValue?: boolean;
    };
    rightValue?: NodeParameterValueType;
  }>;
  combinator: 'and' | 'or';
}

/**
 * Assignment collection value
 */
export interface AssignmentCollectionValue {
  assignments: Array<{
    id: string;
    name: string;
    type: string;
    value: NodeParameterValueType;
  }>;
}

/**
 * Node parameter value type (recursive union supporting all n8n parameter types)
 */
export type NodeParameterValueType =
  | NodeParameterValue
  | INodeParameters
  | INodeParameterResourceLocator
  | ResourceMapperValue
  | FilterValue
  | AssignmentCollectionValue
  | NodeParameterValue[]
  | INodeParameters[]
  | INodeParameterResourceLocator[]
  | ResourceMapperValue[];

/**
 * Node parameters interface matching n8n's INodeParameters
 *
 * This is intentionally generic as n8n supports 400+ node types,
 * each with different parameter schemas defined at runtime.
 */
export interface INodeParameters {
  [key: string]: NodeParameterValueType;
}

/**
 * @deprecated Use INodeParameters instead
 */
export type NodeParameters = INodeParameters;

/**
 * Workflow node definition
 */
export interface WorkflowNode {
  /** Unique identifier within the workflow */
  id?: string;
  /** Display name */
  name: string;
  /** Node type (e.g., 'n8n-nodes-base.httpRequest') */
  type: string;
  /** Type version */
  typeVersion: number;
  /** Position on the canvas */
  position: [number, number];
  /** Node parameters */
  parameters?: INodeParameters;
  /** Credentials used by this node */
  credentials?: Record<string, { id: string; name: string }>;
  /** Whether the node is disabled */
  disabled?: boolean;
  /** Notes for this node */
  notes?: string;
  /** Retry on fail settings */
  retryOnFail?: boolean;
  /** Maximum retry attempts */
  maxTries?: number;
  /** Wait between retries in ms */
  waitBetweenTries?: number;
  /** Always output data */
  alwaysOutputData?: boolean;
  /** Execute once */
  executeOnce?: boolean;
  /** Continue on fail */
  continueOnFail?: boolean;
  /** Pause before execution */
  pauseBeforeExecution?: boolean;
  /** Webhook ID for trigger nodes */
  webhookId?: string;
}

/**
 * Connection between nodes
 */
export interface NodeConnection {
  /** Source node name */
  node: string;
  /** Source output type */
  type: string;
  /** Source output index */
  index: number;
}

/**
 * Workflow connections map
 */
export interface WorkflowConnections {
  [nodeName: string]: {
    [outputType: string]: NodeConnection[][];
  };
}

/**
 * Workflow settings
 */
export interface WorkflowSettings {
  /** Save execution progress */
  saveExecutionProgress?: boolean;
  /** Save data on error */
  saveDataErrorExecution?: 'all' | 'none';
  /** Save data on success */
  saveDataSuccessExecution?: 'all' | 'none';
  /** Save manual execution data */
  saveManualExecutions?: boolean;
  /** Execution timeout in seconds */
  executionTimeout?: number;
  /** Timezone */
  timezone?: string;
  /** Error workflow ID */
  errorWorkflow?: string;
  /** Caller policy */
  callerPolicy?: 'any' | 'none' | 'workflowsFromAList' | 'workflowsFromSameOwner';
  /** Allowed caller IDs */
  callerIds?: string;
}

/**
 * Workflow tag reference
 */
export interface WorkflowTag {
  /** Tag ID */
  id: string;
  /** Tag name */
  name: string;
}

/**
 * Shared workflow configuration
 */
export interface WorkflowSharing {
  /** User ID */
  userId?: string;
  /** Project ID */
  projectId?: string;
  /** Role */
  role?: string;
}

/**
 * Complete workflow object
 */
export interface Workflow {
  /** Unique workflow identifier (read-only) */
  id: string;
  /** Workflow name */
  name: string;
  /** Whether the workflow is active (read-only) */
  active: boolean;
  /** Workflow nodes */
  nodes: WorkflowNode[];
  /** Node connections */
  connections: WorkflowConnections;
  /** Workflow settings */
  settings?: WorkflowSettings;
  /** Static data for the workflow */
  staticData?: string | JsonObject;
  /** Associated tags (read-only) */
  tags?: WorkflowTag[];
  /** Sharing configuration */
  shared?: WorkflowSharing[];
  /** Pinned data */
  pinnedData?: JsonObject;
  /** Version ID */
  versionId?: string;
  /** Creation timestamp (read-only) */
  createdAt: DateTimeString;
  /** Last update timestamp (read-only) */
  updatedAt: DateTimeString;
}

/**
 * Workflow creation request
 */
export interface CreateWorkflowRequest {
  /** Workflow name */
  name: string;
  /** Workflow nodes */
  nodes: WorkflowNode[];
  /** Node connections */
  connections: WorkflowConnections;
  /** Workflow settings (required by n8n API, can be empty object) */
  settings: WorkflowSettings;
  /** Static data */
  staticData?: string | JsonObject;
  /** Pinned data */
  pinnedData?: JsonObject;
}

/**
 * Workflow update request
 */
export interface UpdateWorkflowRequest {
  /** Workflow name */
  name?: string;
  /** Workflow nodes (required by n8n API) */
  nodes: WorkflowNode[];
  /** Node connections (required by n8n API) */
  connections: WorkflowConnections;
  /** Workflow settings (required by n8n API, can be empty object) */
  settings: WorkflowSettings;
  /** Static data */
  staticData?: string | JsonObject;
  /** Pinned data */
  pinnedData?: JsonObject;
}

/**
 * Workflow list query parameters
 */
export interface ListWorkflowsParams {
  /** Filter by active status */
  active?: boolean;
  /** Filter by tags (comma-separated) */
  tags?: string;
  /** Filter by name */
  name?: string;
  /** Filter by project ID */
  projectId?: string;
  /** Exclude pinned data from response */
  excludePinnedData?: boolean;
  /** Maximum number of items to return */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
}

/**
 * Workflow tags update request
 */
export interface UpdateWorkflowTagsRequest {
  /** Tag IDs to assign */
  tagIds: string[];
}

/**
 * Paginated workflow list response
 */
export type WorkflowListResponse = PaginatedResponse<Workflow>;
