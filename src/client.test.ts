/**
 * Tests for HTTP client
 */

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HttpClient } from './client.js';
import {
  N8nAbortError,
  N8nApiError,
  N8nConfigError,
  N8nTimeoutError,
} from './errors.js';
import {
  apiPath,
  createMockServer,
  http,
  HttpResponse,
  mockResponse,
  TEST_API_KEY,
  TEST_BASE_URL,
} from './test-utils.js';

const server = createMockServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('HttpClient', () => {
  describe('configuration', () => {
    it('should throw error if baseUrl is missing', () => {
      expect(() => new HttpClient({ baseUrl: '', apiKey: TEST_API_KEY })).toThrow(
        N8nConfigError
      );
    });

    it('should throw error if apiKey is missing', () => {
      expect(() => new HttpClient({ baseUrl: TEST_BASE_URL, apiKey: '' })).toThrow(
        N8nConfigError
      );
    });

    it('should create client with valid config', () => {
      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });
      expect(client).toBeInstanceOf(HttpClient);
    });

    it('should remove trailing slash from baseUrl', () => {
      server.use(
        http.get(apiPath('/test'), () => mockResponse.json({ success: true }))
      );

      const client = new HttpClient({
        baseUrl: `${TEST_BASE_URL}/`,
        apiKey: TEST_API_KEY,
      });

      expect(client.get('/test')).resolves.toEqual({ success: true });
    });
  });

  describe('GET requests', () => {
    it('should make GET request successfully', async () => {
      server.use(
        http.get(apiPath('/test'), () => mockResponse.json({ data: 'test' }))
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.get<{ data: string }>('/test');
      expect(result).toEqual({ data: 'test' });
    });

    it('should include query parameters', async () => {
      server.use(
        http.get(apiPath('/test'), ({ request }) => {
          const url = new URL(request.url);
          return mockResponse.json({
            foo: url.searchParams.get('foo'),
            bar: url.searchParams.get('bar'),
          });
        })
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.get<{ foo: string; bar: string }>('/test', {
        foo: 'hello',
        bar: 'world',
      });

      expect(result).toEqual({ foo: 'hello', bar: 'world' });
    });

    it('should skip undefined query parameters', async () => {
      server.use(
        http.get(apiPath('/test'), ({ request }) => {
          const url = new URL(request.url);
          return mockResponse.json({
            hasUndefined: url.searchParams.has('undefined'),
            foo: url.searchParams.get('foo'),
          });
        })
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.get<{ hasUndefined: boolean; foo: string }>(
        '/test',
        { foo: 'bar', undefined: undefined }
      );

      expect(result.hasUndefined).toBe(false);
      expect(result.foo).toBe('bar');
    });

    it('should include API key header', async () => {
      server.use(
        http.get(apiPath('/test'), ({ request }) => {
          const apiKey = request.headers.get('X-N8N-API-KEY');
          return mockResponse.json({ apiKey });
        })
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.get<{ apiKey: string }>('/test');
      expect(result.apiKey).toBe(TEST_API_KEY);
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body', async () => {
      server.use(
        http.post(apiPath('/test'), async ({ request }) => {
          const body = await request.json();
          return mockResponse.json({ received: body });
        })
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.post<{ received: { name: string } }>('/test', {
        name: 'test',
      });

      expect(result.received).toEqual({ name: 'test' });
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with body', async () => {
      server.use(
        http.put(apiPath('/test/123'), async ({ request }) => {
          const body = await request.json();
          return mockResponse.json({ id: '123', ...body as object });
        })
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.put<{ id: string; name: string }>('/test/123', {
        name: 'updated',
      });

      expect(result).toEqual({ id: '123', name: 'updated' });
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      server.use(
        http.delete(apiPath('/test/123'), () =>
          mockResponse.json({ deleted: true })
        )
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.delete<{ deleted: boolean }>('/test/123');
      expect(result).toEqual({ deleted: true });
    });

    it('should handle 204 No Content response', async () => {
      server.use(
        http.delete(apiPath('/test/123'), () => mockResponse.noContent())
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.delete<void>('/test/123');
      expect(result).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw N8nApiError for 401 Unauthorized', async () => {
      server.use(
        http.get(apiPath('/test'), () =>
          mockResponse.error('Unauthorized', 401)
        )
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      await expect(client.get('/test')).rejects.toThrow(N8nApiError);

      try {
        await client.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(N8nApiError);
        const apiError = error as N8nApiError;
        expect(apiError.status).toBe(401);
        expect(apiError.isUnauthorized()).toBe(true);
        expect(apiError.message).toBe('Unauthorized');
      }
    });

    it('should throw N8nApiError for 404 Not Found', async () => {
      server.use(
        http.get(apiPath('/test'), () => mockResponse.error('Not found', 404))
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      try {
        await client.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(N8nApiError);
        const apiError = error as N8nApiError;
        expect(apiError.status).toBe(404);
        expect(apiError.isNotFound()).toBe(true);
      }
    });

    it('should throw N8nApiError for 400 Bad Request', async () => {
      server.use(
        http.post(apiPath('/test'), () =>
          mockResponse.error('Invalid input', 400)
        )
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      try {
        await client.post('/test', {});
      } catch (error) {
        expect(error).toBeInstanceOf(N8nApiError);
        const apiError = error as N8nApiError;
        expect(apiError.status).toBe(400);
        expect(apiError.isValidationError()).toBe(true);
      }
    });

    it('should throw N8nApiError for 500 Server Error', async () => {
      server.use(
        http.get(apiPath('/test'), () =>
          mockResponse.error('Internal server error', 500)
        )
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      try {
        await client.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(N8nApiError);
        const apiError = error as N8nApiError;
        expect(apiError.status).toBe(500);
        expect(apiError.isServerError()).toBe(true);
      }
    });

    it('should throw N8nTimeoutError on timeout', async () => {
      server.use(
        http.get(apiPath('/test'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return mockResponse.json({ data: 'test' });
        })
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
        timeout: 50,
      });

      await expect(client.get('/test')).rejects.toThrow(N8nTimeoutError);
    });

    it('should throw N8nAbortError when request is aborted', async () => {
      server.use(
        http.get(apiPath('/test'), async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return mockResponse.json({ data: 'test' });
        })
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const controller = new AbortController();
      const promise = client.get('/test', undefined, { signal: controller.signal });

      setTimeout(() => controller.abort(), 10);

      await expect(promise).rejects.toThrow(N8nAbortError);
    });
  });

  describe('PATCH requests', () => {
    it('should make PATCH request with body', async () => {
      server.use(
        http.patch(apiPath('/test/123'), async ({ request }) => {
          const body = await request.json();
          return mockResponse.json({ id: '123', ...body as object });
        })
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.patch<{ id: string; status: string }>('/test/123', {
        status: 'active',
      });

      expect(result).toEqual({ id: '123', status: 'active' });
    });
  });

  describe('error message extraction', () => {
    it('should extract message from error response', async () => {
      server.use(
        http.get(apiPath('/test'), () =>
          HttpResponse.json({ message: 'Custom error message' }, { status: 400 })
        )
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      try {
        await client.get('/test');
      } catch (error) {
        expect((error as N8nApiError).message).toBe('Custom error message');
      }
    });

    it('should extract error field from response', async () => {
      server.use(
        http.get(apiPath('/test'), () =>
          HttpResponse.json({ error: 'Error field message' }, { status: 400 })
        )
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      try {
        await client.get('/test');
      } catch (error) {
        expect((error as N8nApiError).message).toBe('Error field message');
      }
    });

    it('should use status code for empty response', async () => {
      server.use(
        http.get(apiPath('/test'), () =>
          HttpResponse.json({}, { status: 403 })
        )
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      try {
        await client.get('/test');
      } catch (error) {
        expect((error as N8nApiError).message).toBe('HTTP 403 error');
      }
    });

    it('should handle text error responses', async () => {
      server.use(
        http.get(apiPath('/test'), () =>
          new HttpResponse('Plain text error', {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
          })
        )
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      try {
        await client.get('/test');
      } catch (error) {
        expect((error as N8nApiError).message).toBe('Plain text error');
      }
    });
  });

  describe('API version', () => {
    it('should use default v1 API version', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/v1/test`, () => mockResponse.json({ version: 'v1' }))
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.get<{ version: string }>('/test');
      expect(result.version).toBe('v1');
    });

    it('should allow custom API version', async () => {
      server.use(
        http.get(`${TEST_BASE_URL}/api/v2/test`, () => mockResponse.json({ version: 'v2' }))
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
        apiVersion: 'v2',
      });

      const result = await client.get<{ version: string }>('/test');
      expect(result.version).toBe('v2');
    });
  });

  describe('query parameter serialization', () => {
    it('should handle boolean query parameters', async () => {
      server.use(
        http.get(apiPath('/test'), ({ request }) => {
          const url = new URL(request.url);
          return mockResponse.json({
            active: url.searchParams.get('active'),
          });
        })
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.get<{ active: string }>('/test', { active: true });
      expect(result.active).toBe('true');
    });

    it('should handle number query parameters', async () => {
      server.use(
        http.get(apiPath('/test'), ({ request }) => {
          const url = new URL(request.url);
          return mockResponse.json({
            limit: url.searchParams.get('limit'),
          });
        })
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.get<{ limit: string }>('/test', { limit: 50 });
      expect(result.limit).toBe('50');
    });
  });

  describe('POST without body', () => {
    it('should make POST request without body', async () => {
      server.use(
        http.post(apiPath('/test/activate'), () => mockResponse.json({ activated: true }))
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.post<{ activated: boolean }>('/test/activate');
      expect(result.activated).toBe(true);
    });
  });

  describe('custom headers', () => {
    it('should include custom default headers', async () => {
      server.use(
        http.get(apiPath('/test'), ({ request }) => {
          return mockResponse.json({
            customHeader: request.headers.get('X-Custom'),
          });
        })
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
        headers: { 'X-Custom': 'custom-value' },
      });

      const result = await client.get<{ customHeader: string }>('/test');
      expect(result.customHeader).toBe('custom-value');
    });

    it('should allow per-request headers', async () => {
      server.use(
        http.get(apiPath('/test'), ({ request }) => {
          return mockResponse.json({
            requestHeader: request.headers.get('X-Request'),
          });
        })
      );

      const client = new HttpClient({
        baseUrl: TEST_BASE_URL,
        apiKey: TEST_API_KEY,
      });

      const result = await client.get<{ requestHeader: string }>(
        '/test',
        undefined,
        { headers: { 'X-Request': 'request-value' } }
      );

      expect(result.requestHeader).toBe('request-value');
    });
  });
});
