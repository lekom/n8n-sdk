/**
 * Tests for error classes
 */

import { describe, expect, it } from 'vitest';
import {
  N8nAbortError,
  N8nApiError,
  N8nConfigError,
  N8nError,
  N8nNetworkError,
  N8nTimeoutError,
} from './errors.js';

describe('N8nError', () => {
  it('should be an instance of Error', () => {
    const error = new N8nError('test error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(N8nError);
  });

  it('should have correct name and message', () => {
    const error = new N8nError('test message');
    expect(error.name).toBe('N8nError');
    expect(error.message).toBe('test message');
  });
});

describe('N8nApiError', () => {
  it('should contain all error details', () => {
    const error = new N8nApiError('Not found', 404, 'GET', '/workflows/123', { error: 'details' });
    expect(error.status).toBe(404);
    expect(error.method).toBe('GET');
    expect(error.path).toBe('/workflows/123');
    expect(error.body).toEqual({ error: 'details' });
    expect(error.message).toBe('Not found');
  });

  it('should be an instance of N8nError', () => {
    const error = new N8nApiError('error', 500, 'POST', '/test');
    expect(error).toBeInstanceOf(N8nError);
    expect(error).toBeInstanceOf(N8nApiError);
  });

  describe('status check methods', () => {
    it('isClientError should return true for 4xx errors', () => {
      expect(new N8nApiError('', 400, '', '').isClientError()).toBe(true);
      expect(new N8nApiError('', 404, '', '').isClientError()).toBe(true);
      expect(new N8nApiError('', 499, '', '').isClientError()).toBe(true);
      expect(new N8nApiError('', 500, '', '').isClientError()).toBe(false);
      expect(new N8nApiError('', 399, '', '').isClientError()).toBe(false);
    });

    it('isServerError should return true for 5xx errors', () => {
      expect(new N8nApiError('', 500, '', '').isServerError()).toBe(true);
      expect(new N8nApiError('', 503, '', '').isServerError()).toBe(true);
      expect(new N8nApiError('', 599, '', '').isServerError()).toBe(true);
      expect(new N8nApiError('', 400, '', '').isServerError()).toBe(false);
    });

    it('isNotFound should return true only for 404', () => {
      expect(new N8nApiError('', 404, '', '').isNotFound()).toBe(true);
      expect(new N8nApiError('', 400, '', '').isNotFound()).toBe(false);
    });

    it('isUnauthorized should return true only for 401', () => {
      expect(new N8nApiError('', 401, '', '').isUnauthorized()).toBe(true);
      expect(new N8nApiError('', 403, '', '').isUnauthorized()).toBe(false);
    });

    it('isForbidden should return true only for 403', () => {
      expect(new N8nApiError('', 403, '', '').isForbidden()).toBe(true);
      expect(new N8nApiError('', 401, '', '').isForbidden()).toBe(false);
    });

    it('isValidationError should return true only for 400', () => {
      expect(new N8nApiError('', 400, '', '').isValidationError()).toBe(true);
      expect(new N8nApiError('', 422, '', '').isValidationError()).toBe(false);
    });

    it('isConflict should return true only for 409', () => {
      expect(new N8nApiError('', 409, '', '').isConflict()).toBe(true);
      expect(new N8nApiError('', 400, '', '').isConflict()).toBe(false);
    });
  });
});

describe('N8nTimeoutError', () => {
  it('should contain timeout duration', () => {
    const error = new N8nTimeoutError(5000);
    expect(error.timeout).toBe(5000);
    expect(error.message).toBe('Request timed out after 5000ms');
  });

  it('should be an instance of N8nError', () => {
    const error = new N8nTimeoutError(1000);
    expect(error).toBeInstanceOf(N8nError);
    expect(error).toBeInstanceOf(N8nTimeoutError);
  });
});

describe('N8nAbortError', () => {
  it('should have correct message', () => {
    const error = new N8nAbortError();
    expect(error.message).toBe('Request was aborted');
    expect(error.name).toBe('N8nAbortError');
  });

  it('should be an instance of N8nError', () => {
    const error = new N8nAbortError();
    expect(error).toBeInstanceOf(N8nError);
  });
});

describe('N8nConfigError', () => {
  it('should contain config error message', () => {
    const error = new N8nConfigError('baseUrl is required');
    expect(error.message).toBe('baseUrl is required');
    expect(error.name).toBe('N8nConfigError');
  });

  it('should be an instance of N8nError', () => {
    const error = new N8nConfigError('test');
    expect(error).toBeInstanceOf(N8nError);
  });
});

describe('N8nNetworkError', () => {
  it('should contain original error', () => {
    const originalError = new TypeError('fetch failed');
    const error = new N8nNetworkError('Network error', originalError);
    expect(error.message).toBe('Network error');
    expect(error.originalError).toBe(originalError);
  });

  it('should work without original error', () => {
    const error = new N8nNetworkError('Connection refused');
    expect(error.originalError).toBeUndefined();
  });

  it('should be an instance of N8nError', () => {
    const error = new N8nNetworkError('test');
    expect(error).toBeInstanceOf(N8nError);
  });
});
