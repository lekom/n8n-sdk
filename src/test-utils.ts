/**
 * Test utilities for n8n SDK tests
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const TEST_BASE_URL = 'https://test-n8n.example.com';
export const TEST_API_KEY = 'test-api-key';

/**
 * Create MSW handlers for testing
 */
export function createHandlers(handlers: Parameters<typeof http.get>[1][] = []) {
  return handlers;
}

/**
 * Create a mock server for testing
 */
export function createMockServer(...handlers: ReturnType<typeof http.get>[]) {
  return setupServer(...handlers);
}

/**
 * Create standard response helpers
 */
export const mockResponse = {
  json: <T>(data: T, status = 200) =>
    HttpResponse.json(data as Record<string, unknown>, { status }),

  error: (message: string, status: number) =>
    HttpResponse.json({ message }, { status }),

  noContent: () => new HttpResponse(null, { status: 204 }),
};

/**
 * API path helper
 */
export function apiPath(path: string): string {
  return `${TEST_BASE_URL}/api/v1${path}`;
}

export { http, HttpResponse };
