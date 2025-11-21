/**
 * HTTP client for n8n API
 */

import {
  N8nAbortError,
  N8nApiError,
  N8nConfigError,
  N8nNetworkError,
  N8nTimeoutError,
} from './errors.js';
import type { RequestOptions } from './types/common.js';

/**
 * n8n SDK configuration options
 */
export interface N8nClientConfig {
  /** n8n instance base URL (e.g., 'https://your-n8n.example.com') */
  baseUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Default timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom headers to include in all requests */
  headers?: Record<string, string>;
  /** API version (default: 'v1') */
  apiVersion?: string;
}

/**
 * Query parameters type
 */
export type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * Internal request options
 */
interface InternalRequestOptions extends RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  query?: QueryParams;
}

/**
 * HTTP client for making requests to the n8n API
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly defaultTimeout: number;
  private readonly defaultHeaders: Record<string, string>;
  private readonly apiVersion: string;

  constructor(config: N8nClientConfig) {
    if (!config.baseUrl) {
      throw new N8nConfigError('baseUrl is required');
    }
    if (!config.apiKey) {
      throw new N8nConfigError('apiKey is required');
    }

    // Remove trailing slash from base URL
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.defaultTimeout = config.timeout ?? 30000;
    this.defaultHeaders = config.headers ?? {};
    this.apiVersion = config.apiVersion ?? 'v1';
  }

  /**
   * Build the full URL for a request
   */
  private buildUrl(path: string, query?: QueryParams): string {
    const url = new URL(`${this.baseUrl}/api/${this.apiVersion}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Make an HTTP request
   */
  async request<T>(options: InternalRequestOptions): Promise<T> {
    const { method, path, body, query, headers, timeout, signal } = options;
    const url = this.buildUrl(path, query);

    const controller = new AbortController();
    const timeoutMs = timeout ?? this.defaultTimeout;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    // Set up timeout
    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);
    }

    // Link external signal to our controller
    if (signal) {
      signal.addEventListener('abort', () => {
        controller.abort();
      });
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.apiKey,
          ...this.defaultHeaders,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      // Clear timeout on response
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Handle non-JSON responses (like 204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      // Parse response body
      let responseBody: unknown;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        responseBody = await response.json() as unknown;
      } else {
        responseBody = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        const errorMessage = this.extractErrorMessage(responseBody, response.status);
        throw new N8nApiError(errorMessage, response.status, method, path, responseBody);
      }

      return responseBody as T;
    } catch (error) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Re-throw our custom errors
      if (error instanceof N8nApiError) {
        throw error;
      }

      // Handle abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        if (signal?.aborted) {
          throw new N8nAbortError();
        }
        throw new N8nTimeoutError(timeoutMs);
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new N8nNetworkError(`Network error: ${error.message}`, error);
      }

      // Re-throw unknown errors
      throw error;
    }
  }

  /**
   * Extract error message from response body
   */
  private extractErrorMessage(body: unknown, status: number): string {
    if (typeof body === 'object' && body !== null) {
      const obj = body as Record<string, unknown>;
      if (typeof obj['message'] === 'string') {
        return obj['message'];
      }
      if (typeof obj['error'] === 'string') {
        return obj['error'];
      }
    }
    if (typeof body === 'string' && body.length > 0) {
      return body;
    }
    return `HTTP ${status} error`;
  }

  /**
   * GET request
   */
  async get<T>(
    path: string,
    query?: QueryParams,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>({ method: 'GET', path, query, ...options });
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>({ method: 'POST', path, body, ...options });
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body, ...options });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>({ method: 'DELETE', path, ...options });
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body, ...options });
  }
}
