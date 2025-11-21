/**
 * Credential resource API
 */

import type { HttpClient, QueryParams } from '../client.js';
import type { RequestOptions } from '../types/common.js';
import type {
  CreateCredentialRequest,
  CreateCredentialResponse,
  Credential,
  CredentialListResponse,
  CredentialSchema,
  ListCredentialsParams,
  TransferCredentialRequest,
} from '../types/credential.js';

/**
 * API response shape for credential list
 */
interface CredentialListApiResponse {
  data: Credential[];
  nextCursor?: string;
}

/**
 * Credentials resource for managing n8n credentials
 */
export class CredentialsResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * Create a new credential
   *
   * @param credential - Credential configuration
   * @param options - Request options
   * @returns Created credential
   *
   * @example
   * ```ts
   * const credential = await n8n.credentials.create({
   *   name: 'GitHub API',
   *   type: 'githubApi',
   *   data: {
   *     accessToken: 'your-token'
   *   }
   * });
   * ```
   */
  async create(
    credential: CreateCredentialRequest,
    options?: RequestOptions
  ): Promise<CreateCredentialResponse> {
    return this.client.post<CreateCredentialResponse>('/credentials', credential, options);
  }

  /**
   * List all credentials
   *
   * @param params - Query parameters
   * @param options - Request options
   * @returns Paginated list of credentials
   *
   * @example
   * ```ts
   * const { data, nextCursor } = await n8n.credentials.list();
   * ```
   */
  async list(
    params?: ListCredentialsParams,
    options?: RequestOptions
  ): Promise<CredentialListResponse> {
    const response = await this.client.get<CredentialListApiResponse>('/credentials', params as QueryParams, options);
    return {
      data: response.data,
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Delete a credential
   *
   * @param id - Credential ID
   * @param options - Request options
   * @returns Deleted credential
   *
   * @example
   * ```ts
   * const deleted = await n8n.credentials.delete('credential-id');
   * ```
   */
  async delete(id: string, options?: RequestOptions): Promise<Credential> {
    return this.client.delete<Credential>(`/credentials/${encodeURIComponent(id)}`, options);
  }

  /**
   * Get credential schema for a credential type
   *
   * @param credentialTypeName - Credential type name (e.g., 'githubApi')
   * @param options - Request options
   * @returns Credential schema
   *
   * @example
   * ```ts
   * const schema = await n8n.credentials.getSchema('githubApi');
   * console.log(schema.properties);
   * ```
   */
  async getSchema(
    credentialTypeName: string,
    options?: RequestOptions
  ): Promise<CredentialSchema> {
    return this.client.get<CredentialSchema>(
      `/credentials/schema/${encodeURIComponent(credentialTypeName)}`,
      undefined,
      options
    );
  }

  /**
   * Transfer a credential to a different project
   *
   * @param id - Credential ID
   * @param request - Transfer request with destination project ID
   * @param options - Request options
   *
   * @example
   * ```ts
   * await n8n.credentials.transfer('credential-id', {
   *   destinationProjectId: 'project-id'
   * });
   * ```
   */
  async transfer(
    id: string,
    request: TransferCredentialRequest,
    options?: RequestOptions
  ): Promise<void> {
    await this.client.put<void>(
      `/credentials/${encodeURIComponent(id)}/transfer`,
      request,
      options
    );
  }
}
