/**
 * Integration-style tests that test complete workflows
 */

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { N8n } from './n8n.js';
import { N8nApiError } from './errors.js';
import {
  apiPath,
  createMockServer,
  http,
  mockResponse,
  TEST_API_KEY,
  TEST_BASE_URL,
} from './test-utils.js';

const server = createMockServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Integration: Workflow lifecycle', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  it('should create, activate, deactivate, and delete a workflow', async () => {
    // Setup handlers for the full lifecycle
    server.use(
      // Create
      http.post(apiPath('/workflows'), async ({ request }) => {
        const body = await request.json() as { name: string };
        return mockResponse.json({
          id: 'new-workflow-id',
          name: body.name,
          active: false,
          nodes: [],
          connections: {},
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        });
      }),
      // Activate
      http.post(apiPath('/workflows/new-workflow-id/activate'), () =>
        mockResponse.json({
          id: 'new-workflow-id',
          name: 'Test Workflow',
          active: true,
          nodes: [],
          connections: {},
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        })
      ),
      // Deactivate
      http.post(apiPath('/workflows/new-workflow-id/deactivate'), () =>
        mockResponse.json({
          id: 'new-workflow-id',
          name: 'Test Workflow',
          active: false,
          nodes: [],
          connections: {},
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        })
      ),
      // Delete
      http.delete(apiPath('/workflows/new-workflow-id'), () =>
        mockResponse.json({
          id: 'new-workflow-id',
          name: 'Test Workflow',
          active: false,
          nodes: [],
          connections: {},
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        })
      )
    );

    // Execute the lifecycle
    const created = await n8n.workflows.create({
      name: 'Test Workflow',
      nodes: [],
      connections: {},
    });
    expect(created.id).toBe('new-workflow-id');
    expect(created.active).toBe(false);

    const activated = await n8n.workflows.activate(created.id);
    expect(activated.active).toBe(true);

    const deactivated = await n8n.workflows.deactivate(created.id);
    expect(deactivated.active).toBe(false);

    const deleted = await n8n.workflows.delete(created.id);
    expect(deleted.id).toBe('new-workflow-id');
  });
});

describe('Integration: Pagination', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  it('should iterate through all pages of workflows', async () => {
    const page1Data = Array.from({ length: 10 }, (_, i) => ({
      id: `workflow-${i}`,
      name: `Workflow ${i}`,
      active: false,
      nodes: [],
      connections: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }));

    const page2Data = Array.from({ length: 5 }, (_, i) => ({
      id: `workflow-${i + 10}`,
      name: `Workflow ${i + 10}`,
      active: false,
      nodes: [],
      connections: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }));

    server.use(
      http.get(apiPath('/workflows'), ({ request }) => {
        const url = new URL(request.url);
        const cursor = url.searchParams.get('cursor');

        if (cursor === 'page2') {
          return mockResponse.json({ data: page2Data });
        }
        return mockResponse.json({ data: page1Data, nextCursor: 'page2' });
      })
    );

    // Collect all workflows using pagination
    const allWorkflows = [];
    let cursor: string | undefined;

    do {
      const { data, nextCursor } = await n8n.workflows.list({ cursor, limit: 10 });
      allWorkflows.push(...data);
      cursor = nextCursor;
    } while (cursor);

    expect(allWorkflows).toHaveLength(15);
    expect(allWorkflows[0]?.id).toBe('workflow-0');
    expect(allWorkflows[14]?.id).toBe('workflow-14');
  });
});

describe('Integration: Error recovery', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  it('should handle and recover from API errors gracefully', async () => {
    let attemptCount = 0;

    server.use(
      http.get(apiPath('/workflows'), () => {
        attemptCount++;
        if (attemptCount === 1) {
          return mockResponse.error('Service temporarily unavailable', 503);
        }
        return mockResponse.json({
          data: [{ id: '1', name: 'Test', active: false, nodes: [], connections: {}, createdAt: '', updatedAt: '' }],
        });
      })
    );

    // First attempt should fail
    try {
      await n8n.workflows.list();
    } catch (error) {
      expect(error).toBeInstanceOf(N8nApiError);
      expect((error as N8nApiError).status).toBe(503);
    }

    // Retry should succeed
    const result = await n8n.workflows.list();
    expect(result.data).toHaveLength(1);
  });
});

describe('Integration: Concurrent requests', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  it('should handle multiple concurrent requests', async () => {
    server.use(
      http.get(apiPath('/workflows'), () =>
        mockResponse.json({ data: [{ id: '1', name: 'W1', active: false, nodes: [], connections: {}, createdAt: '', updatedAt: '' }] })
      ),
      http.get(apiPath('/executions'), () =>
        mockResponse.json({ data: [{ id: 1, finished: true, mode: 'manual', startedAt: '', workflowId: '1', status: 'success' }] })
      ),
      http.get(apiPath('/tags'), () =>
        mockResponse.json({ data: [{ id: '1', name: 'Tag1', createdAt: '', updatedAt: '' }] })
      ),
      http.get(apiPath('/credentials'), () =>
        mockResponse.json({ data: [{ id: '1', name: 'Cred1', type: 'api', createdAt: '', updatedAt: '' }] })
      )
    );

    const [workflows, executions, tags, credentials] = await Promise.all([
      n8n.workflows.list(),
      n8n.executions.list(),
      n8n.tags.list(),
      n8n.credentials.list(),
    ]);

    expect(workflows.data).toHaveLength(1);
    expect(executions.data).toHaveLength(1);
    expect(tags.data).toHaveLength(1);
    expect(credentials.data).toHaveLength(1);
  });
});

describe('Integration: Credential and workflow association', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  it('should create workflow with credential references', async () => {
    server.use(
      http.post(apiPath('/workflows'), async ({ request }) => {
        const body = await request.json() as { nodes: Array<{ credentials?: Record<string, unknown> }> };
        const hasCredentials = body.nodes.some(node => node.credentials);
        return mockResponse.json({
          id: 'workflow-with-creds',
          name: 'Workflow with Credentials',
          active: false,
          nodes: body.nodes,
          connections: {},
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        });
      })
    );

    const workflow = await n8n.workflows.create({
      name: 'Workflow with Credentials',
      nodes: [
        {
          name: 'HTTP Request',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [250, 300],
          credentials: {
            httpHeaderAuth: { id: 'cred-123', name: 'API Key' },
          },
        },
      ],
      connections: {},
    });

    expect(workflow.nodes[0]?.credentials).toBeDefined();
  });
});

describe('Integration: Tag management on workflows', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  it('should add and update tags on a workflow', async () => {
    server.use(
      // Get initial tags (empty)
      http.get(apiPath('/workflows/wf-1/tags'), () =>
        mockResponse.json([])
      ),
      // Update tags
      http.put(apiPath('/workflows/wf-1/tags'), async ({ request }) => {
        const body = await request.json() as { tagIds: string[] };
        return mockResponse.json(
          body.tagIds.map((id, i) => ({ id, name: `Tag ${i + 1}` }))
        );
      })
    );

    // Get initial tags
    const initialTags = await n8n.workflows.getTags('wf-1');
    expect(initialTags).toHaveLength(0);

    // Update tags
    const updatedTags = await n8n.workflows.updateTags('wf-1', {
      tagIds: ['tag-1', 'tag-2'],
    });
    expect(updatedTags).toHaveLength(2);
  });
});

describe('Integration: Execution filtering', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  it('should filter executions by multiple criteria', async () => {
    server.use(
      http.get(apiPath('/executions'), ({ request }) => {
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const workflowId = url.searchParams.get('workflowId');

        // Return different data based on filters
        if (status === 'error' && workflowId === 'wf-1') {
          return mockResponse.json({
            data: [
              { id: 100, finished: true, mode: 'trigger', startedAt: '', workflowId: 'wf-1', status: 'error' },
            ],
          });
        }

        return mockResponse.json({ data: [] });
      })
    );

    // Get failed executions for specific workflow
    const failedForWorkflow = await n8n.executions.list({
      status: 'error',
      workflowId: 'wf-1',
    });

    expect(failedForWorkflow.data).toHaveLength(1);
    expect(failedForWorkflow.data[0]?.status).toBe('error');
    expect(failedForWorkflow.data[0]?.workflowId).toBe('wf-1');
  });
});

describe('Integration: User invitation flow', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  it('should invite user and receive invite URL', async () => {
    server.use(
      http.post(apiPath('/users'), async () => {
        return mockResponse.json([
          {
            user: {
              id: 'new-user-id',
              email: 'newuser@example.com',
              inviteAcceptUrl: 'https://n8n.example.com/accept/token123',
              emailSent: true,
            },
          },
        ]);
      })
    );

    const result = await n8n.users.invite('newuser@example.com', 'global:member');

    expect(result.user.id).toBe('new-user-id');
    expect(result.user.inviteAcceptUrl).toContain('accept/token123');
    expect(result.user.emailSent).toBe(true);
  });
});

describe('Integration: Security audit', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  it('should generate audit and identify issues', async () => {
    server.use(
      http.post(apiPath('/audit'), () =>
        mockResponse.json({
          credentials: {
            category: 'credentials',
            findings: [
              {
                risk: 'high',
                section: 'Unused Credentials',
                description: '5 credentials are not used by any workflow',
                recommendation: 'Remove unused credentials to reduce attack surface',
              },
            ],
          },
          nodes: {
            category: 'nodes',
            findings: [
              {
                risk: 'medium',
                section: 'HTTP Nodes',
                description: '3 HTTP nodes use HTTP instead of HTTPS',
                recommendation: 'Use HTTPS for secure communication',
              },
            ],
          },
        })
      )
    );

    const audit = await n8n.audit.generate({
      additionalOptions: {
        categories: ['credentials', 'nodes'],
      },
    });

    expect(audit['credentials']?.findings).toHaveLength(1);
    expect(audit['credentials']?.findings[0]?.risk).toBe('high');
    expect(audit['nodes']?.findings).toHaveLength(1);
    expect(audit['nodes']?.findings[0]?.risk).toBe('medium');
  });
});
