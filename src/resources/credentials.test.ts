/**
 * Tests for Credentials resource
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
import type { Credential, CreateCredentialResponse } from '../types/credential.js';

const server = createMockServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createTestCredential = (overrides: Partial<Credential> = {}): Credential => ({
  id: 'cred-1',
  name: 'Test Credential',
  type: 'githubApi',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('CredentialsResource', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  describe('list', () => {
    it('should list all credentials', async () => {
      const credentials = [
        createTestCredential(),
        createTestCredential({ id: 'cred-2', name: 'Another Credential' }),
      ];

      server.use(
        http.get(apiPath('/credentials'), () =>
          mockResponse.json({ data: credentials, nextCursor: 'cursor123' })
        )
      );

      const result = await n8n.credentials.list();
      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBe('cursor123');
    });

    it('should handle pagination', async () => {
      server.use(
        http.get(apiPath('/credentials'), ({ request }) => {
          const url = new URL(request.url);
          const cursor = url.searchParams.get('cursor');

          if (cursor === 'page2') {
            return mockResponse.json({
              data: [createTestCredential({ id: 'cred-2' })],
            });
          }

          return mockResponse.json({
            data: [createTestCredential()],
            nextCursor: 'page2',
          });
        })
      );

      const page1 = await n8n.credentials.list({ limit: 1 });
      expect(page1.data[0]?.id).toBe('cred-1');
      expect(page1.nextCursor).toBe('page2');

      const page2 = await n8n.credentials.list({ cursor: 'page2', limit: 1 });
      expect(page2.data[0]?.id).toBe('cred-2');
    });
  });

  describe('create', () => {
    it('should create a credential', async () => {
      const response: CreateCredentialResponse = {
        id: 'new-cred',
        name: 'New Credential',
        type: 'githubApi',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      server.use(
        http.post(apiPath('/credentials'), async ({ request }) => {
          const body = (await request.json()) as { name: string; type: string };
          return mockResponse.json({
            ...response,
            name: body.name,
            type: body.type,
          });
        })
      );

      const result = await n8n.credentials.create({
        name: 'GitHub API',
        type: 'githubApi',
        data: { accessToken: 'token123' },
      });

      expect(result.name).toBe('GitHub API');
      expect(result.type).toBe('githubApi');
    });
  });

  describe('delete', () => {
    it('should delete a credential', async () => {
      const credential = createTestCredential();

      server.use(
        http.delete(apiPath('/credentials/cred-1'), () => mockResponse.json(credential))
      );

      const result = await n8n.credentials.delete('cred-1');
      expect(result.id).toBe('cred-1');
    });
  });

  describe('getSchema', () => {
    it('should get credential schema for a type', async () => {
      const schema = {
        properties: [
          {
            displayName: 'Access Token',
            name: 'accessToken',
            type: 'string',
            required: true,
          },
        ],
      };

      server.use(
        http.get(apiPath('/credentials/schema/githubApi'), () =>
          mockResponse.json(schema)
        )
      );

      const result = await n8n.credentials.getSchema('githubApi');
      expect(result.properties).toHaveLength(1);
      expect(result.properties[0]?.name).toBe('accessToken');
    });
  });

  describe('transfer', () => {
    it('should transfer a credential to another project', async () => {
      server.use(
        http.put(apiPath('/credentials/cred-1/transfer'), () =>
          mockResponse.noContent()
        )
      );

      await expect(
        n8n.credentials.transfer('cred-1', { destinationProjectId: 'project-2' })
      ).resolves.toBeUndefined();
    });
  });
});
