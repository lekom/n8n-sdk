/**
 * Tests for Workflows resource
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
import type { Workflow } from '../types/workflow.js';

const server = createMockServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createTestWorkflow = (overrides: Partial<Workflow> = {}): Workflow => ({
  id: 'workflow-1',
  name: 'Test Workflow',
  active: false,
  nodes: [
    {
      name: 'Start',
      type: 'n8n-nodes-base.start',
      typeVersion: 1,
      position: [250, 300],
    },
  ],
  connections: {},
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('WorkflowsResource', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  describe('list', () => {
    it('should list all workflows', async () => {
      const workflows = [createTestWorkflow(), createTestWorkflow({ id: 'workflow-2' })];

      server.use(
        http.get(apiPath('/workflows'), () =>
          mockResponse.json({ data: workflows, nextCursor: 'cursor123' })
        )
      );

      const result = await n8n.workflows.list();
      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBe('cursor123');
    });

    it('should filter by active status', async () => {
      server.use(
        http.get(apiPath('/workflows'), ({ request }) => {
          const url = new URL(request.url);
          const active = url.searchParams.get('active');
          return mockResponse.json({
            data: active === 'true' ? [createTestWorkflow({ active: true })] : [],
          });
        })
      );

      const result = await n8n.workflows.list({ active: true });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.active).toBe(true);
    });

    it('should filter by tags', async () => {
      server.use(
        http.get(apiPath('/workflows'), ({ request }) => {
          const url = new URL(request.url);
          const tags = url.searchParams.get('tags');
          return mockResponse.json({
            data: tags ? [createTestWorkflow()] : [],
            tags,
          });
        })
      );

      const result = await n8n.workflows.list({ tags: 'tag1,tag2' });
      expect(result.data).toHaveLength(1);
    });

    it('should handle pagination', async () => {
      server.use(
        http.get(apiPath('/workflows'), ({ request }) => {
          const url = new URL(request.url);
          const cursor = url.searchParams.get('cursor');
          const limit = url.searchParams.get('limit');

          if (cursor === 'page2') {
            return mockResponse.json({ data: [createTestWorkflow({ id: 'workflow-2' })] });
          }

          return mockResponse.json({
            data: [createTestWorkflow()],
            nextCursor: 'page2',
          });
        })
      );

      const page1 = await n8n.workflows.list({ limit: 1 });
      expect(page1.data[0]?.id).toBe('workflow-1');
      expect(page1.nextCursor).toBe('page2');

      const page2 = await n8n.workflows.list({ cursor: 'page2', limit: 1 });
      expect(page2.data[0]?.id).toBe('workflow-2');
      expect(page2.nextCursor).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should get a workflow by ID', async () => {
      const workflow = createTestWorkflow();

      server.use(
        http.get(apiPath('/workflows/workflow-1'), () => mockResponse.json(workflow))
      );

      const result = await n8n.workflows.get('workflow-1');
      expect(result.id).toBe('workflow-1');
      expect(result.name).toBe('Test Workflow');
    });

    it('should exclude pinned data when requested', async () => {
      server.use(
        http.get(apiPath('/workflows/workflow-1'), ({ request }) => {
          const url = new URL(request.url);
          const excludePinnedData = url.searchParams.get('excludePinnedData');
          return mockResponse.json(
            createTestWorkflow({
              pinnedData: excludePinnedData === 'true' ? undefined : { node: { data: 'test' } },
            })
          );
        })
      );

      const withPinned = await n8n.workflows.get('workflow-1');
      expect(withPinned.pinnedData).toBeDefined();

      const withoutPinned = await n8n.workflows.get('workflow-1', true);
      expect(withoutPinned.pinnedData).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a workflow', async () => {
      server.use(
        http.post(apiPath('/workflows'), async ({ request }) => {
          const body = (await request.json()) as { name: string };
          return mockResponse.json(createTestWorkflow({ name: body.name }));
        })
      );

      const result = await n8n.workflows.create({
        name: 'New Workflow',
        nodes: [],
        connections: {},
      });

      expect(result.name).toBe('New Workflow');
    });
  });

  describe('update', () => {
    it('should update a workflow', async () => {
      server.use(
        http.put(apiPath('/workflows/workflow-1'), async ({ request }) => {
          const body = (await request.json()) as { name: string };
          return mockResponse.json(createTestWorkflow({ name: body.name }));
        })
      );

      const result = await n8n.workflows.update('workflow-1', {
        name: 'Updated Workflow',
      });

      expect(result.name).toBe('Updated Workflow');
    });
  });

  describe('delete', () => {
    it('should delete a workflow', async () => {
      const workflow = createTestWorkflow();

      server.use(
        http.delete(apiPath('/workflows/workflow-1'), () => mockResponse.json(workflow))
      );

      const result = await n8n.workflows.delete('workflow-1');
      expect(result.id).toBe('workflow-1');
    });
  });

  describe('activate', () => {
    it('should activate a workflow', async () => {
      server.use(
        http.post(apiPath('/workflows/workflow-1/activate'), () =>
          mockResponse.json(createTestWorkflow({ active: true }))
        )
      );

      const result = await n8n.workflows.activate('workflow-1');
      expect(result.active).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a workflow', async () => {
      server.use(
        http.post(apiPath('/workflows/workflow-1/deactivate'), () =>
          mockResponse.json(createTestWorkflow({ active: false }))
        )
      );

      const result = await n8n.workflows.deactivate('workflow-1');
      expect(result.active).toBe(false);
    });
  });

  describe('getTags', () => {
    it('should get workflow tags', async () => {
      const tags = [
        { id: 'tag-1', name: 'Production' },
        { id: 'tag-2', name: 'Staging' },
      ];

      server.use(
        http.get(apiPath('/workflows/workflow-1/tags'), () => mockResponse.json(tags))
      );

      const result = await n8n.workflows.getTags('workflow-1');
      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe('Production');
    });
  });

  describe('updateTags', () => {
    it('should update workflow tags', async () => {
      const tags = [
        { id: 'tag-1', name: 'Production' },
        { id: 'tag-3', name: 'Test' },
      ];

      server.use(
        http.put(apiPath('/workflows/workflow-1/tags'), () => mockResponse.json(tags))
      );

      const result = await n8n.workflows.updateTags('workflow-1', {
        tagIds: ['tag-1', 'tag-3'],
      });

      expect(result).toHaveLength(2);
    });
  });

  describe('transfer', () => {
    it('should transfer a workflow to another project', async () => {
      server.use(
        http.put(apiPath('/workflows/workflow-1/transfer'), () =>
          mockResponse.noContent()
        )
      );

      await expect(
        n8n.workflows.transfer('workflow-1', 'project-2')
      ).resolves.toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw N8nApiError for 404 when workflow not found', async () => {
      server.use(
        http.get(apiPath('/workflows/non-existent'), () =>
          mockResponse.error('Workflow not found', 404)
        )
      );

      await expect(n8n.workflows.get('non-existent')).rejects.toThrow();
    });

    it('should throw N8nApiError for 400 on invalid workflow data', async () => {
      server.use(
        http.post(apiPath('/workflows'), () =>
          mockResponse.error('Invalid workflow configuration', 400)
        )
      );

      await expect(
        n8n.workflows.create({ name: '', nodes: [], connections: {} })
      ).rejects.toThrow();
    });

    it('should throw N8nApiError for 401 on unauthorized', async () => {
      server.use(
        http.get(apiPath('/workflows'), () =>
          mockResponse.error('Unauthorized', 401)
        )
      );

      await expect(n8n.workflows.list()).rejects.toThrow();
    });
  });

  describe('URL encoding', () => {
    it('should properly encode workflow IDs with special characters', async () => {
      const specialId = 'workflow/with spaces&special=chars';
      server.use(
        http.get(apiPath(`/workflows/${encodeURIComponent(specialId)}`), () =>
          mockResponse.json(createTestWorkflow({ id: specialId }))
        )
      );

      const result = await n8n.workflows.get(specialId);
      expect(result.id).toBe(specialId);
    });
  });

  describe('empty responses', () => {
    it('should handle empty workflow list', async () => {
      server.use(
        http.get(apiPath('/workflows'), () =>
          mockResponse.json({ data: [] })
        )
      );

      const result = await n8n.workflows.list();
      expect(result.data).toEqual([]);
      expect(result.nextCursor).toBeUndefined();
    });
  });
});
