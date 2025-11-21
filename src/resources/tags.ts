/**
 * Tag resource API
 */

import type { HttpClient, QueryParams } from '../client.js';
import type { RequestOptions } from '../types/common.js';
import type {
  CreateTagRequest,
  ListTagsParams,
  Tag,
  TagListResponse,
  UpdateTagRequest,
} from '../types/tag.js';

/**
 * API response shape for tag list
 */
interface TagListApiResponse {
  data: Tag[];
  nextCursor?: string;
}

/**
 * Tags resource for managing n8n tags
 */
export class TagsResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * Create a new tag
   *
   * @param tag - Tag configuration
   * @param options - Request options
   * @returns Created tag
   *
   * @example
   * ```ts
   * const tag = await n8n.tags.create({ name: 'Production' });
   * ```
   */
  async create(tag: CreateTagRequest, options?: RequestOptions): Promise<Tag> {
    return this.client.post<Tag>('/tags', tag, options);
  }

  /**
   * List all tags
   *
   * @param params - Query parameters
   * @param options - Request options
   * @returns Paginated list of tags
   *
   * @example
   * ```ts
   * const { data, nextCursor } = await n8n.tags.list();
   * ```
   */
  async list(params?: ListTagsParams, options?: RequestOptions): Promise<TagListResponse> {
    const response = await this.client.get<TagListApiResponse>('/tags', params as QueryParams, options);
    return {
      data: response.data,
      nextCursor: response.nextCursor,
    };
  }

  /**
   * Get a tag by ID
   *
   * @param id - Tag ID
   * @param options - Request options
   * @returns Tag details
   *
   * @example
   * ```ts
   * const tag = await n8n.tags.get('tag-id');
   * ```
   */
  async get(id: string, options?: RequestOptions): Promise<Tag> {
    return this.client.get<Tag>(`/tags/${encodeURIComponent(id)}`, undefined, options);
  }

  /**
   * Update a tag
   *
   * @param id - Tag ID
   * @param tag - Updated tag configuration
   * @param options - Request options
   * @returns Updated tag
   *
   * @example
   * ```ts
   * const tag = await n8n.tags.update('tag-id', { name: 'Staging' });
   * ```
   */
  async update(id: string, tag: UpdateTagRequest, options?: RequestOptions): Promise<Tag> {
    return this.client.put<Tag>(`/tags/${encodeURIComponent(id)}`, tag, options);
  }

  /**
   * Delete a tag
   *
   * @param id - Tag ID
   * @param options - Request options
   * @returns Deleted tag
   *
   * @example
   * ```ts
   * const deleted = await n8n.tags.delete('tag-id');
   * ```
   */
  async delete(id: string, options?: RequestOptions): Promise<Tag> {
    return this.client.delete<Tag>(`/tags/${encodeURIComponent(id)}`, options);
  }
}
