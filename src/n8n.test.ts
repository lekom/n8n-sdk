/**
 * Tests for main N8n client
 */

import { describe, expect, it } from 'vitest';
import { N8n, createN8nClient } from './n8n.js';
import { N8nConfigError } from './errors.js';
import {
  AuditResource,
  CredentialsResource,
  ExecutionsResource,
  ProjectsResource,
  TagsResource,
  UsersResource,
  VariablesResource,
  WorkflowsResource,
} from './resources/index.js';

describe('N8n', () => {
  describe('constructor', () => {
    it('should create client with valid config', () => {
      const n8n = new N8n({
        baseUrl: 'https://n8n.example.com',
        apiKey: 'test-key',
      });
      expect(n8n).toBeInstanceOf(N8n);
    });

    it('should throw N8nConfigError for missing baseUrl', () => {
      expect(() => new N8n({ baseUrl: '', apiKey: 'test' })).toThrow(N8nConfigError);
    });

    it('should throw N8nConfigError for missing apiKey', () => {
      expect(() => new N8n({ baseUrl: 'https://example.com', apiKey: '' })).toThrow(N8nConfigError);
    });

    it('should accept optional configuration', () => {
      const n8n = new N8n({
        baseUrl: 'https://n8n.example.com',
        apiKey: 'test-key',
        timeout: 60000,
        apiVersion: 'v1',
        headers: { 'X-Custom': 'header' },
      });
      expect(n8n).toBeInstanceOf(N8n);
    });
  });

  describe('resources', () => {
    const n8n = new N8n({
      baseUrl: 'https://n8n.example.com',
      apiKey: 'test-key',
    });

    it('should have workflows resource', () => {
      expect(n8n.workflows).toBeInstanceOf(WorkflowsResource);
    });

    it('should have executions resource', () => {
      expect(n8n.executions).toBeInstanceOf(ExecutionsResource);
    });

    it('should have credentials resource', () => {
      expect(n8n.credentials).toBeInstanceOf(CredentialsResource);
    });

    it('should have users resource', () => {
      expect(n8n.users).toBeInstanceOf(UsersResource);
    });

    it('should have tags resource', () => {
      expect(n8n.tags).toBeInstanceOf(TagsResource);
    });

    it('should have variables resource', () => {
      expect(n8n.variables).toBeInstanceOf(VariablesResource);
    });

    it('should have projects resource', () => {
      expect(n8n.projects).toBeInstanceOf(ProjectsResource);
    });

    it('should have audit resource', () => {
      expect(n8n.audit).toBeInstanceOf(AuditResource);
    });
  });
});

describe('createN8nClient', () => {
  it('should create N8n instance', () => {
    const n8n = createN8nClient({
      baseUrl: 'https://n8n.example.com',
      apiKey: 'test-key',
    });
    expect(n8n).toBeInstanceOf(N8n);
  });

  it('should throw for invalid config', () => {
    expect(() => createN8nClient({ baseUrl: '', apiKey: '' })).toThrow(N8nConfigError);
  });
});
