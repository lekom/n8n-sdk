/**
 * Execution-related types for the n8n SDK
 */

import type { DateTimeString, JsonObject, PaginatedResponse } from './common.js';

/**
 * Execution mode
 */
export type ExecutionMode =
  | 'cli'
  | 'error'
  | 'integrated'
  | 'internal'
  | 'manual'
  | 'retry'
  | 'trigger'
  | 'webhook';

/**
 * Execution status
 */
export type ExecutionStatus =
  | 'canceled'
  | 'crashed'
  | 'error'
  | 'new'
  | 'running'
  | 'success'
  | 'unknown'
  | 'waiting';

/**
 * Execution node data
 */
export interface ExecutionNodeData {
  /** Start time */
  startTime?: number;
  /** Execution time in ms */
  executionTime?: number;
  /** Execution status */
  executionStatus?: string;
  /** Source data */
  source?: unknown[];
  /** Node data */
  data?: {
    main?: Array<Array<{ json: JsonObject; binary?: Record<string, unknown> }>>;
  };
}

/**
 * Execution data
 */
export interface ExecutionData {
  /** Start data */
  startData?: {
    destinationNode?: string;
    runNodeFilter?: string[];
  };
  /** Result data */
  resultData?: {
    runData?: Record<string, ExecutionNodeData[]>;
    error?: {
      message: string;
      stack?: string;
    };
    lastNodeExecuted?: string;
  };
  /** Execution data */
  executionData?: {
    contextData?: JsonObject;
    nodeExecutionStack?: unknown[];
    waitingExecution?: JsonObject;
    waitingExecutionSource?: JsonObject;
  };
}

/**
 * Execution custom data
 */
export interface ExecutionCustomData {
  [key: string]: unknown;
}

/**
 * Complete execution object
 */
export interface Execution {
  /** Execution ID */
  id: number;
  /** Execution data */
  data?: ExecutionData;
  /** Whether execution has finished */
  finished: boolean;
  /** Execution mode */
  mode: ExecutionMode;
  /** ID of execution this is a retry of */
  retryOf?: number | null;
  /** ID of successful retry execution */
  retrySuccessId?: number | null;
  /** Start timestamp */
  startedAt: DateTimeString;
  /** Stop timestamp (null if still running) */
  stoppedAt?: DateTimeString | null;
  /** Associated workflow ID */
  workflowId: string;
  /** Wait until timestamp */
  waitTill?: DateTimeString | null;
  /** Custom data */
  customData?: ExecutionCustomData;
  /** Execution status */
  status: ExecutionStatus;
}

/**
 * Execution list query parameters
 */
export interface ListExecutionsParams {
  /** Include execution data */
  includeData?: boolean;
  /** Filter by status */
  status?: ExecutionStatus;
  /** Filter by workflow ID */
  workflowId?: string;
  /** Filter by project ID */
  projectId?: string;
  /** Maximum number of items */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
}

/**
 * Paginated execution list response
 */
export type ExecutionListResponse = PaginatedResponse<Execution>;
