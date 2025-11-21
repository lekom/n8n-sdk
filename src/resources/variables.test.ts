/**
 * Tests for Variables resource
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
import type { Variable } from '../types/variable.js';

const server = createMockServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createTestVariable = (overrides: Partial<Variable> = {}): Variable => ({
  id: 'var-1',
  key: 'API_BASE_URL',
  value: 'https://api.example.com',
  type: 'string',
  ...overrides,
});

describe('VariablesResource', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  describe('list', () => {
    it('should list all variables', async () => {
      const variables = [
        createTestVariable(),
        createTestVariable({ id: 'var-2', key: 'API_KEY' }),
      ];

      server.use(
        http.get(apiPath('/variables'), () =>
          mockResponse.json({ data: variables, nextCursor: 'cursor123' })
        )
      );

      const result = await n8n.variables.list();
      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBe('cursor123');
    });

    it('should filter by projectId', async () => {
      server.use(
        http.get(apiPath('/variables'), ({ request }) => {
          const url = new URL(request.url);
          const projectId = url.searchParams.get('projectId');
          return mockResponse.json({
            data: projectId ? [createTestVariable()] : [],
          });
        })
      );

      const result = await n8n.variables.list({ projectId: 'project-1' });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create a variable', async () => {
      server.use(
        http.post(apiPath('/variables'), async ({ request }) => {
          const body = (await request.json()) as { key: string; value: string };
          return mockResponse.json(createTestVariable({ key: body.key, value: body.value }));
        })
      );

      const result = await n8n.variables.create({
        key: 'NEW_VAR',
        value: 'new-value',
      });

      expect(result.key).toBe('NEW_VAR');
      expect(result.value).toBe('new-value');
    });
  });

  describe('update', () => {
    it('should update a variable', async () => {
      server.use(
        http.put(apiPath('/variables/var-1'), () => mockResponse.noContent())
      );

      await expect(
        n8n.variables.update('var-1', {
          key: 'API_BASE_URL',
          value: 'https://new-api.example.com',
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a variable', async () => {
      server.use(
        http.delete(apiPath('/variables/var-1'), () => mockResponse.noContent())
      );

      await expect(n8n.variables.delete('var-1')).resolves.toBeUndefined();
    });
  });
});
