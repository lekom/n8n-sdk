/**
 * Tests for Projects resource
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
import type { Project } from '../types/project.js';

const server = createMockServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createTestProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'project-1',
  name: 'Production Workflows',
  type: 'team',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('ProjectsResource', () => {
  const n8n = new N8n({ baseUrl: TEST_BASE_URL, apiKey: TEST_API_KEY });

  describe('list', () => {
    it('should list all projects', async () => {
      const projects = [
        createTestProject(),
        createTestProject({ id: 'project-2', name: 'Staging' }),
      ];

      server.use(
        http.get(apiPath('/projects'), () =>
          mockResponse.json({ data: projects, nextCursor: 'cursor123' })
        )
      );

      const result = await n8n.projects.list();
      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBe('cursor123');
    });
  });

  describe('get', () => {
    it('should get a project by ID', async () => {
      const project = createTestProject();

      server.use(
        http.get(apiPath('/projects/project-1'), () => mockResponse.json(project))
      );

      const result = await n8n.projects.get('project-1');
      expect(result.id).toBe('project-1');
      expect(result.name).toBe('Production Workflows');
    });
  });

  describe('create', () => {
    it('should create a project', async () => {
      server.use(
        http.post(apiPath('/projects'), async ({ request }) => {
          const body = (await request.json()) as { name: string };
          return mockResponse.json(createTestProject({ name: body.name }), 201);
        })
      );

      const result = await n8n.projects.create({ name: 'New Project' });
      expect(result.name).toBe('New Project');
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      server.use(
        http.put(apiPath('/projects/project-1'), async ({ request }) => {
          const body = (await request.json()) as { name: string };
          return mockResponse.json(createTestProject({ name: body.name }));
        })
      );

      const result = await n8n.projects.update('project-1', { name: 'Updated Project' });
      expect(result.name).toBe('Updated Project');
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      server.use(
        http.delete(apiPath('/projects/project-1'), () => mockResponse.noContent())
      );

      await expect(n8n.projects.delete('project-1')).resolves.toBeUndefined();
    });
  });
});
