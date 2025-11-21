/**
 * Tests for Tags resource
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
import type { Tag } from '../types/tag.js';

const server = createMockServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createTestTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 'tag-1',
  name: 'Production',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('TagsResource', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  describe('list', () => {
    it('should list all tags', async () => {
      const tags = [createTestTag(), createTestTag({ id: 'tag-2', name: 'Staging' })];

      server.use(
        http.get(apiPath('/tags'), () =>
          mockResponse.json({ data: tags, nextCursor: 'cursor123' })
        )
      );

      const result = await n8n.tags.list();
      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBe('cursor123');
    });
  });

  describe('get', () => {
    it('should get a tag by ID', async () => {
      const tag = createTestTag();

      server.use(http.get(apiPath('/tags/tag-1'), () => mockResponse.json(tag)));

      const result = await n8n.tags.get('tag-1');
      expect(result.id).toBe('tag-1');
      expect(result.name).toBe('Production');
    });
  });

  describe('create', () => {
    it('should create a tag', async () => {
      server.use(
        http.post(apiPath('/tags'), async ({ request }) => {
          const body = (await request.json()) as { name: string };
          return mockResponse.json(createTestTag({ name: body.name }), 201);
        })
      );

      const result = await n8n.tags.create({ name: 'New Tag' });
      expect(result.name).toBe('New Tag');
    });
  });

  describe('update', () => {
    it('should update a tag', async () => {
      server.use(
        http.put(apiPath('/tags/tag-1'), async ({ request }) => {
          const body = (await request.json()) as { name: string };
          return mockResponse.json(createTestTag({ name: body.name }));
        })
      );

      const result = await n8n.tags.update('tag-1', { name: 'Updated Tag' });
      expect(result.name).toBe('Updated Tag');
    });
  });

  describe('delete', () => {
    it('should delete a tag', async () => {
      const tag = createTestTag();

      server.use(http.delete(apiPath('/tags/tag-1'), () => mockResponse.json(tag)));

      const result = await n8n.tags.delete('tag-1');
      expect(result.id).toBe('tag-1');
    });
  });
});
