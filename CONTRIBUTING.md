# Contributing to n8n SDK

Thank you for your interest in contributing to the n8n TypeScript SDK! This document provides guidelines and instructions for contributing.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/n8n-sdk-ts.git
   cd n8n-sdk-ts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Development Workflow

### Code Style

- We use ESLint for linting and Prettier for formatting
- Run `npm run lint` to check for linting errors
- Run `npm run format` to format code

### Testing

- Write tests for all new features and bug fixes
- Tests are written using Vitest
- Use MSW (Mock Service Worker) for API mocking
- Aim for high test coverage (>80%)

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Type Checking

```bash
npm run typecheck
```

## Making Changes

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation change
- `style:` - Code style change (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test addition or modification
- `chore:` - Maintenance task

Examples:
```
feat: add support for workflow versioning
fix: handle empty response in credentials list
docs: update README with pagination examples
```

## Pull Request Process

1. Create a new branch from `main`
2. Make your changes
3. Write/update tests
4. Update documentation if needed
5. Run all checks:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```
6. Push your branch and create a PR
7. Fill out the PR template
8. Wait for review

## Adding New API Resources

When adding support for new n8n API endpoints:

1. **Types** - Add types in `src/types/`
2. **Resource** - Create resource class in `src/resources/`
3. **Export** - Add exports to `src/resources/index.ts` and `src/index.ts`
4. **Tests** - Add tests in `src/resources/*.test.ts`
5. **Docs** - Update README with usage examples

### Type File Template

```typescript
// src/types/newresource.ts
import type { DateTimeString, PaginatedResponse } from './common.js';

export interface NewResource {
  id: string;
  name: string;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}

export interface CreateNewResourceRequest {
  name: string;
}

export interface ListNewResourcesParams {
  limit?: number;
  cursor?: string;
}

export type NewResourceListResponse = PaginatedResponse<NewResource>;
```

### Resource Class Template

```typescript
// src/resources/newresource.ts
import type { HttpClient } from '../client.js';
import type { RequestOptions } from '../types/common.js';
import type {
  CreateNewResourceRequest,
  ListNewResourcesParams,
  NewResource,
  NewResourceListResponse,
} from '../types/newresource.js';

export class NewResourcesResource {
  constructor(private readonly client: HttpClient) {}

  async create(
    data: CreateNewResourceRequest,
    options?: RequestOptions
  ): Promise<NewResource> {
    return this.client.post<NewResource>('/newresources', data, options);
  }

  async list(
    params?: ListNewResourcesParams,
    options?: RequestOptions
  ): Promise<NewResourceListResponse> {
    const response = await this.client.get<{ data: NewResource[]; nextCursor?: string }>(
      '/newresources',
      params,
      options
    );
    return {
      data: response.data,
      nextCursor: response.nextCursor,
    };
  }

  // Add more methods...
}
```

## Questions?

If you have questions, please open an issue or reach out to the maintainers.

Thank you for contributing!
