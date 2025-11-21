/**
 * Audit-related types for the n8n SDK
 */

/**
 * Audit category
 */
export type AuditCategory =
  | 'credentials'
  | 'database'
  | 'nodes'
  | 'filesystem'
  | 'instance';

/**
 * Audit risk level
 */
export type AuditRiskLevel = 'low' | 'medium' | 'high';

/**
 * Audit finding
 */
export interface AuditFinding {
  /** Risk level */
  risk: AuditRiskLevel;
  /** Finding section */
  section: string;
  /** Finding description */
  description: string;
  /** Recommendation */
  recommendation?: string;
  /** Related resource ID */
  resourceId?: string;
  /** Related resource name */
  resourceName?: string;
}

/**
 * Audit category result
 */
export interface AuditCategoryResult {
  /** Category name */
  category: AuditCategory;
  /** Findings for this category */
  findings: AuditFinding[];
}

/**
 * Audit generation request
 */
export interface GenerateAuditRequest {
  /** Additional options */
  additionalOptions?: {
    /** Days threshold for abandoned workflows */
    daysAbandonedWorkflow?: number;
    /** Categories to audit */
    categories?: AuditCategory[];
  };
}

/**
 * Audit result
 */
export interface AuditResult {
  /** Audit results by category */
  [category: string]: AuditCategoryResult;
}
