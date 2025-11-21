/**
 * Audit resource API
 */

import type { HttpClient } from '../client.js';
import type { RequestOptions } from '../types/common.js';
import type { AuditResult, GenerateAuditRequest } from '../types/audit.js';

/**
 * Audit resource for generating security audits
 */
export class AuditResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * Generate a security audit for the n8n instance
   *
   * @param request - Audit configuration options
   * @param options - Request options
   * @returns Audit results by category
   *
   * @example
   * ```ts
   * // Generate full audit
   * const audit = await n8n.audit.generate();
   *
   * // Generate audit for specific categories
   * const credentialAudit = await n8n.audit.generate({
   *   additionalOptions: {
   *     categories: ['credentials', 'nodes']
   *   }
   * });
   *
   * // Configure abandoned workflow threshold
   * const audit = await n8n.audit.generate({
   *   additionalOptions: {
   *     daysAbandonedWorkflow: 90
   *   }
   * });
   * ```
   */
  async generate(request?: GenerateAuditRequest, options?: RequestOptions): Promise<AuditResult> {
    return this.client.post<AuditResult>('/audit', request, options);
  }
}
