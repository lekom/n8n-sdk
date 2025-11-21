/**
 * User resource API
 */

import type { HttpClient, QueryParams } from '../client.js';
import type { RequestOptions } from '../types/common.js';
import type {
  CreateUserRequest,
  CreateUserResponse,
  ListUsersParams,
  User,
  UserIdentifier,
  UserListResponse,
} from '../types/user.js';

/**
 * API response shape for user list
 */
interface UserListApiResponse {
  data: User[];
  nextCursor?: string;
}

/**
 * Users resource for managing n8n users
 * Note: Most user operations are only available to the instance owner
 */
export class UsersResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * List all users
   * Only available to the instance owner.
   *
   * @param params - Query parameters
   * @param options - Request options
   * @returns Paginated list of users
   *
   * @example
   * ```ts
   * const { data, nextCursor } = await n8n.users.list();
   *
   * // Include role information
   * const usersWithRoles = await n8n.users.list({ includeRole: true });
   * ```
   */
  async list(params?: ListUsersParams, options?: RequestOptions): Promise<UserListResponse> {
    const response = await this.client.get<UserListApiResponse>('/users', params as QueryParams, options);
    return {
      data: response.data,
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Get a user by ID or email
   * Only available to the instance owner.
   *
   * @param identifier - User ID or email address
   * @param includeRole - Include role in response
   * @param options - Request options
   * @returns User details
   *
   * @example
   * ```ts
   * // Get by ID
   * const user = await n8n.users.get('user-id');
   *
   * // Get by email
   * const userByEmail = await n8n.users.get('user@example.com');
   * ```
   */
  async get(
    identifier: UserIdentifier,
    includeRole?: boolean,
    options?: RequestOptions
  ): Promise<User> {
    const query = includeRole !== undefined ? { includeRole } : undefined;
    return this.client.get<User>(`/users/${encodeURIComponent(identifier)}`, query, options);
  }

  /**
   * Create one or more users
   *
   * @param users - Array of user creation requests
   * @param options - Request options
   * @returns Array of creation results
   *
   * @example
   * ```ts
   * const results = await n8n.users.create([
   *   { email: 'user1@example.com', role: 'global:member' },
   *   { email: 'user2@example.com', role: 'global:admin' }
   * ]);
   * ```
   */
  async create(
    users: CreateUserRequest[],
    options?: RequestOptions
  ): Promise<CreateUserResponse[]> {
    return this.client.post<CreateUserResponse[]>('/users', users, options);
  }

  /**
   * Delete a user
   *
   * @param identifier - User ID or email address
   * @param options - Request options
   *
   * @example
   * ```ts
   * await n8n.users.delete('user-id');
   * ```
   */
  async delete(identifier: UserIdentifier, options?: RequestOptions): Promise<void> {
    await this.client.delete<void>(`/users/${encodeURIComponent(identifier)}`, options);
  }

  /**
   * Invite a user by email
   *
   * @param email - User email address
   * @param role - User role
   * @param options - Request options
   * @returns Creation result
   *
   * @example
   * ```ts
   * const result = await n8n.users.invite('user@example.com', 'global:member');
   * console.log(result.user.inviteAcceptUrl);
   * ```
   */
  async invite(
    email: string,
    role: 'global:owner' | 'global:admin' | 'global:member' = 'global:member',
    options?: RequestOptions
  ): Promise<CreateUserResponse> {
    const results = await this.create([{ email, role }], options);
    const result = results[0];
    if (!result) {
      throw new Error('Failed to invite user');
    }
    return result;
  }
}
