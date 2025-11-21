/**
 * Tests for Audit resource
 */

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { N8n } from '../n8n.js';
import {
  apiPath,
  createMockServer,
  http,
  mockResponse,
  TEST_API_KEY,
  TEST_BASE_URL,
} from '../test-utils.js';
import type { AuditResult } from '../types/audit.js';

const server = createMockServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AuditResource', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  describe('generate', () => {
    it('should generate a full audit', async () => {
      const auditResult: AuditResult = {
        credentials: {
          category: 'credentials',
          findings: [
            {
              risk: 'high',
              section: 'Credentials',
              description: 'Unused credentials found',
              recommendation: 'Remove unused credentials',
            },
          ],
        },
        nodes: {
          category: 'nodes',
          findings: [],
        },
      };

      server.use(
        http.post(apiPath('/audit'), () => mockResponse.json(auditResult))
      );

      const result = await n8n.audit.generate();
      expect(result).toHaveProperty('credentials');
      expect(result['credentials']?.findings).toHaveLength(1);
    });

    it('should generate audit with specific categories', async () => {
      server.use(
        http.post(apiPath('/audit'), async ({ request }) => {
          const body = (await request.json()) as {
            additionalOptions?: { categories?: string[] };
          };
          const categories = body.additionalOptions?.categories ?? [];

          const result: AuditResult = {};
          for (const cat of categories) {
            result[cat] = {
              category: cat as 'credentials',
              findings: [],
            };
          }

          return mockResponse.json(result);
        })
      );

      const result = await n8n.audit.generate({
        additionalOptions: {
          categories: ['credentials', 'nodes'],
        },
      });

      expect(Object.keys(result)).toHaveLength(2);
      expect(result).toHaveProperty('credentials');
      expect(result).toHaveProperty('nodes');
    });

    it('should generate audit with custom abandoned workflow days', async () => {
      server.use(
        http.post(apiPath('/audit'), async ({ request }) => {
          const body = (await request.json()) as {
            additionalOptions?: { daysAbandonedWorkflow?: number };
          };
          const days = body.additionalOptions?.daysAbandonedWorkflow ?? 30;

          return mockResponse.json({
            instance: {
              category: 'instance',
              findings: [
                {
                  risk: 'medium',
                  section: 'Workflows',
                  description: `Checking for workflows abandoned for ${days} days`,
                },
              ],
            },
          });
        })
      );

      const result = await n8n.audit.generate({
        additionalOptions: {
          daysAbandonedWorkflow: 90,
        },
      });

      expect(result['instance']?.findings[0]?.description).toContain('90 days');
    });
  });
});
