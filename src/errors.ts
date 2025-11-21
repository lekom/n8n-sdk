/**
 * Custom error classes for the n8n SDK
 */

/**
 * Base error class for n8n SDK errors
 */
export class N8nError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'N8nError';
    Object.setPrototypeOf(this, N8nError.prototype);
  }
}

/**
 * Error thrown when API request fails
 */
export class N8nApiError extends N8nError {
  /** HTTP status code */
  readonly status: number;
  /** Response body if available */
  readonly body?: unknown;
  /** Request method */
  readonly method: string;
  /** Request path */
  readonly path: string;

  constructor(
    message: string,
    status: number,
    method: string,
    path: string,
    body?: unknown
  ) {
    super(message);
    this.name = 'N8nApiError';
    this.status = status;
    this.method = method;
    this.path = path;
    this.body = body;
    Object.setPrototypeOf(this, N8nApiError.prototype);
  }

  /**
   * Check if this is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if this is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if this is a not found error (404)
   */
  isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Check if this is an unauthorized error (401)
   */
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Check if this is a forbidden error (403)
   */
  isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Check if this is a validation error (400)
   */
  isValidationError(): boolean {
    return this.status === 400;
  }

  /**
   * Check if this is a conflict error (409)
   */
  isConflict(): boolean {
    return this.status === 409;
  }
}

/**
 * Error thrown when request times out
 */
export class N8nTimeoutError extends N8nError {
  /** Timeout duration in milliseconds */
  readonly timeout: number;

  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'N8nTimeoutError';
    this.timeout = timeout;
    Object.setPrototypeOf(this, N8nTimeoutError.prototype);
  }
}

/**
 * Error thrown when request is aborted
 */
export class N8nAbortError extends N8nError {
  constructor() {
    super('Request was aborted');
    this.name = 'N8nAbortError';
    Object.setPrototypeOf(this, N8nAbortError.prototype);
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class N8nConfigError extends N8nError {
  constructor(message: string) {
    super(message);
    this.name = 'N8nConfigError';
    Object.setPrototypeOf(this, N8nConfigError.prototype);
  }
}

/**
 * Error thrown when network request fails
 */
export class N8nNetworkError extends N8nError {
  /** Original error */
  readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'N8nNetworkError';
    this.originalError = originalError;
    Object.setPrototypeOf(this, N8nNetworkError.prototype);
  }
}
