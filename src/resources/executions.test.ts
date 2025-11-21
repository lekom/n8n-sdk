/**
 * Tests for Executions resource
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
import type { Execution } from '../types/execution.js';

const server = createMockServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createTestExecution = (overrides: Partial<Execution> = {}): Execution => ({
  id: 1000,
  finished: true,
  mode: 'manual',
  startedAt: '2024-01-01T00:00:00.000Z',
  stoppedAt: '2024-01-01T00:01:00.000Z',
  workflowId: 'workflow-1',
  status: 'success',
  ...overrides,
});

describe('ExecutionsResource', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  describe('list', () => {
    it('should list all executions', async () => {
      const executions = [
        createTestExecution(),
        createTestExecution({ id: 1001 }),
      ];

      server.use(
        http.get(apiPath('/executions'), () =>
          mockResponse.json({ data: executions, nextCursor: 'cursor123' })
        )
      );

      const result = await n8n.executions.list();
      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBe('cursor123');
    });

    it('should filter by status', async () => {
      server.use(
        http.get(apiPath('/executions'), ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');
          return mockResponse.json({
            data:
              status === 'error'
                ? [createTestExecution({ status: 'error' })]
                : [createTestExecution()],
          });
        })
      );

      const result = await n8n.executions.list({ status: 'error' });
      expect(result.data[0]?.status).toBe('error');
    });

    it('should filter by workflowId', async () => {
      server.use(
        http.get(apiPath('/executions'), ({ request }) => {
          const url = new URL(request.url);
          const workflowId = url.searchParams.get('workflowId');
          return mockResponse.json({
            data: [createTestExecution({ workflowId: workflowId ?? 'default' })],
          });
        })
      );

      const result = await n8n.executions.list({ workflowId: 'workflow-2' });
      expect(result.data[0]?.workflowId).toBe('workflow-2');
    });

    it('should include data when requested', async () => {
      server.use(
        http.get(apiPath('/executions'), ({ request }) => {
          const url = new URL(request.url);
          const includeData = url.searchParams.get('includeData');
          return mockResponse.json({
            data: [
              createTestExecution({
                data:
                  includeData === 'true'
                    ? { resultData: { runData: {} } }
                    : undefined,
              }),
            ],
          });
        })
      );

      const withData = await n8n.executions.list({ includeData: true });
      expect(withData.data[0]?.data).toBeDefined();

      const withoutData = await n8n.executions.list({ includeData: false });
      expect(withoutData.data[0]?.data).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should get an execution by ID', async () => {
      const execution = createTestExecution();

      server.use(
        http.get(apiPath('/executions/1000'), () => mockResponse.json(execution))
      );

      const result = await n8n.executions.get(1000);
      expect(result.id).toBe(1000);
      expect(result.status).toBe('success');
    });

    it('should include data when requested', async () => {
      server.use(
        http.get(apiPath('/executions/1000'), ({ request }) => {
          const url = new URL(request.url);
          const includeData = url.searchParams.get('includeData');
          return mockResponse.json(
            createTestExecution({
              data:
                includeData === 'true'
                  ? { resultData: { runData: {} } }
                  : undefined,
            })
          );
        })
      );

      const withData = await n8n.executions.get(1000, true);
      expect(withData.data).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete an execution', async () => {
      const execution = createTestExecution();

      server.use(
        http.delete(apiPath('/executions/1000'), () => mockResponse.json(execution))
      );

      const result = await n8n.executions.delete(1000);
      expect(result.id).toBe(1000);
    });
  });

  describe('getByWorkflow', () => {
    it('should get executions for a specific workflow', async () => {
      server.use(
        http.get(apiPath('/executions'), ({ request }) => {
          const url = new URL(request.url);
          const workflowId = url.searchParams.get('workflowId');
          return mockResponse.json({
            data: [createTestExecution({ workflowId: workflowId ?? 'default' })],
          });
        })
      );

      const result = await n8n.executions.getByWorkflow('workflow-1');
      expect(result.data[0]?.workflowId).toBe('workflow-1');
    });
  });

  describe('getRunning', () => {
    it('should get running executions', async () => {
      server.use(
        http.get(apiPath('/executions'), ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');
          return mockResponse.json({
            data:
              status === 'running'
                ? [createTestExecution({ status: 'running', finished: false })]
                : [],
          });
        })
      );

      const result = await n8n.executions.getRunning();
      expect(result.data[0]?.status).toBe('running');
    });
  });

  describe('getFailed', () => {
    it('should get failed executions', async () => {
      server.use(
        http.get(apiPath('/executions'), ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');
          return mockResponse.json({
            data:
              status === 'error'
                ? [createTestExecution({ status: 'error' })]
                : [],
          });
        })
      );

      const result = await n8n.executions.getFailed();
      expect(result.data[0]?.status).toBe('error');
    });
  });

  describe('getSuccessful', () => {
    it('should get successful executions', async () => {
      server.use(
        http.get(apiPath('/executions'), ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');
          return mockResponse.json({
            data:
              status === 'success'
                ? [createTestExecution({ status: 'success' })]
                : [],
          });
        })
      );

      const result = await n8n.executions.getSuccessful();
      expect(result.data[0]?.status).toBe('success');
    });
  });

  describe('getWaiting', () => {
    it('should get waiting executions', async () => {
      server.use(
        http.get(apiPath('/executions'), ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');
          return mockResponse.json({
            data:
              status === 'waiting'
                ? [
                    createTestExecution({
                      status: 'waiting',
                      waitTill: '2024-01-02T00:00:00.000Z',
                    }),
                  ]
                : [],
          });
        })
      );

      const result = await n8n.executions.getWaiting();
      expect(result.data[0]?.status).toBe('waiting');
    });
  });
});
