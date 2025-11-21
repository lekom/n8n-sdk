/**
 * Tests for Users resource
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
import type { User } from '../types/user.js';

const server = createMockServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isPending: false,
  role: 'global:member',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('UsersResource', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  describe('list', () => {
    it('should list all users', async () => {
      const users = [createTestUser(), createTestUser({ id: 'user-2', email: 'user2@example.com' })];

      server.use(
        http.get(apiPath('/users'), () =>
          mockResponse.json({ data: users, nextCursor: 'cursor123' })
        )
      );

      const result = await n8n.users.list();
      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBe('cursor123');
    });

    it('should include role when requested', async () => {
      server.use(
        http.get(apiPath('/users'), ({ request }) => {
          const url = new URL(request.url);
          const includeRole = url.searchParams.get('includeRole');
          return mockResponse.json({
            data: [
              createTestUser({
                role: includeRole === 'true' ? 'global:admin' : undefined,
              }),
            ],
          });
        })
      );

      const withRole = await n8n.users.list({ includeRole: true });
      expect(withRole.data[0]?.role).toBe('global:admin');
    });
  });

  describe('get', () => {
    it('should get a user by ID', async () => {
      const user = createTestUser();

      server.use(
        http.get(apiPath('/users/user-1'), () => mockResponse.json(user))
      );

      const result = await n8n.users.get('user-1');
      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
    });

    it('should get a user by email', async () => {
      const user = createTestUser({ email: 'specific@example.com' });

      server.use(
        http.get(apiPath('/users/specific%40example.com'), () => mockResponse.json(user))
      );

      const result = await n8n.users.get('specific@example.com');
      expect(result.email).toBe('specific@example.com');
    });
  });

  describe('create', () => {
    it('should create users', async () => {
      server.use(
        http.post(apiPath('/users'), async ({ request }) => {
          const body = (await request.json()) as Array<{ email: string }>;
          return mockResponse.json(
            body.map((u, i) => ({
              user: {
                id: `user-${i}`,
                email: u.email,
                inviteAcceptUrl: `https://n8n.example.com/accept/${i}`,
                emailSent: true,
              },
            }))
          );
        })
      );

      const result = await n8n.users.create([
        { email: 'new1@example.com', role: 'global:member' },
        { email: 'new2@example.com', role: 'global:admin' },
      ]);

      expect(result).toHaveLength(2);
      expect(result[0]?.user.email).toBe('new1@example.com');
      expect(result[1]?.user.email).toBe('new2@example.com');
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      server.use(
        http.delete(apiPath('/users/user-1'), () => mockResponse.noContent())
      );

      await expect(n8n.users.delete('user-1')).resolves.toBeUndefined();
    });
  });

  describe('invite', () => {
    it('should invite a single user', async () => {
      server.use(
        http.post(apiPath('/users'), async () => {
          return mockResponse.json([
            {
              user: {
                id: 'new-user',
                email: 'invited@example.com',
                inviteAcceptUrl: 'https://n8n.example.com/accept/123',
                emailSent: true,
              },
            },
          ]);
        })
      );

      const result = await n8n.users.invite('invited@example.com', 'global:member');
      expect(result.user.email).toBe('invited@example.com');
      expect(result.user.inviteAcceptUrl).toBeDefined();
    });
  });
});
