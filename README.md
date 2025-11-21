# n8n SDK for TypeScript

A comprehensive, production-ready TypeScript SDK for the [n8n](https://n8n.io) workflow automation platform API.

[![npm version](https://badge.fury.io/js/n8n-sdk.svg)](https://www.npmjs.com/package/n8n-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔒 **Full TypeScript support** - Complete type definitions for all API operations
- 📦 **Tree-shakeable** - Import only what you need
- 🔄 **Automatic pagination** - Easy iteration over paginated results
- ⚡ **Modern async/await API** - Clean, promise-based interface
- 🛡️ **Comprehensive error handling** - Typed errors for different failure scenarios
- 📚 **Well-documented** - JSDoc comments and examples throughout

## Installation

```bash
npm install n8n-sdk
```

```bash
yarn add n8n-sdk
```

```bash
pnpm add n8n-sdk
```

## Quick Start

```typescript
import { N8n } from 'n8n-sdk';

const n8n = new N8n({
  baseUrl: 'https://your-n8n-instance.com',
  apiKey: 'your-api-key',
});

// List all workflows
const { data: workflows } = await n8n.workflows.list();
console.log(`Found ${workflows.length} workflows`);

// Create a new workflow
const workflow = await n8n.workflows.create({
  name: 'My First Workflow',
  nodes: [
    {
      name: 'Start',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [250, 300],
    },
  ],
  connections: {},
});

// Activate the workflow
await n8n.workflows.activate(workflow.id);
```

## Configuration

```typescript
import { N8n } from 'n8n-sdk';

const n8n = new N8n({
  // Required
  baseUrl: 'https://your-n8n-instance.com',
  apiKey: 'your-api-key',

  // Optional
  timeout: 30000,           // Request timeout in ms (default: 30000)
  apiVersion: 'v1',         // API version (default: 'v1')
  headers: {                // Custom headers for all requests
    'X-Custom-Header': 'value',
  },
});
```

## API Reference

### Workflows

```typescript
// List workflows with filters
const { data, nextCursor } = await n8n.workflows.list({
  active: true,
  tags: 'production,important',
  name: 'My Workflow',
  projectId: 'project-id',
  limit: 10,
  cursor: 'cursor-from-previous-request',
});

// Get a specific workflow
const workflow = await n8n.workflows.get('workflow-id');

// Create a workflow
const newWorkflow = await n8n.workflows.create({
  name: 'New Workflow',
  nodes: [...],
  connections: {...},
  settings: {
    saveExecutionProgress: true,
    saveDataErrorExecution: 'all',
  },
});

// Update a workflow
const updated = await n8n.workflows.update('workflow-id', {
  name: 'Updated Name',
});

// Delete a workflow
await n8n.workflows.delete('workflow-id');

// Activate/Deactivate
await n8n.workflows.activate('workflow-id');
await n8n.workflows.deactivate('workflow-id');

// Manage tags
const tags = await n8n.workflows.getTags('workflow-id');
await n8n.workflows.updateTags('workflow-id', { tagIds: ['tag-1', 'tag-2'] });

// Transfer to another project
await n8n.workflows.transfer('workflow-id', 'destination-project-id');
```

### Executions

```typescript
// List executions with filters
const { data: executions } = await n8n.executions.list({
  status: 'error',
  workflowId: 'workflow-id',
  projectId: 'project-id',
  includeData: true,
});

// Get a specific execution
const execution = await n8n.executions.get(1000, true); // include data

// Delete an execution
await n8n.executions.delete(1000);

// Convenience methods
const running = await n8n.executions.getRunning();
const failed = await n8n.executions.getFailed();
const successful = await n8n.executions.getSuccessful();
const waiting = await n8n.executions.getWaiting();
const byWorkflow = await n8n.executions.getByWorkflow('workflow-id');
```

### Credentials

```typescript
// List credentials
const { data: credentials } = await n8n.credentials.list();

// Create a credential
const credential = await n8n.credentials.create({
  name: 'GitHub API',
  type: 'githubApi',
  data: {
    accessToken: 'your-token',
  },
});

// Delete a credential
await n8n.credentials.delete('credential-id');

// Get credential schema (for a credential type)
const schema = await n8n.credentials.getSchema('githubApi');

// Transfer to another project
await n8n.credentials.transfer('credential-id', {
  destinationProjectId: 'project-id',
});
```

### Users

```typescript
// List users (owner only)
const { data: users } = await n8n.users.list({
  includeRole: true,
});

// Get a user by ID or email
const user = await n8n.users.get('user-id');
const userByEmail = await n8n.users.get('user@example.com');

// Create/invite users
const results = await n8n.users.create([
  { email: 'new@example.com', role: 'global:member' },
]);

// Invite a single user (convenience method)
const result = await n8n.users.invite('user@example.com', 'global:member');

// Delete a user
await n8n.users.delete('user-id');
```

### Tags

```typescript
// List tags
const { data: tags } = await n8n.tags.list();

// Create a tag
const tag = await n8n.tags.create({ name: 'Production' });

// Get a tag
const tagDetails = await n8n.tags.get('tag-id');

// Update a tag
await n8n.tags.update('tag-id', { name: 'Staging' });

// Delete a tag
await n8n.tags.delete('tag-id');
```

### Variables

```typescript
// List variables
const { data: variables } = await n8n.variables.list({
  projectId: 'project-id',
});

// Create a variable
const variable = await n8n.variables.create({
  key: 'API_BASE_URL',
  value: 'https://api.example.com',
});

// Update a variable
await n8n.variables.update('variable-id', {
  key: 'API_BASE_URL',
  value: 'https://new-api.example.com',
});

// Delete a variable
await n8n.variables.delete('variable-id');
```

### Projects

```typescript
// List projects
const { data: projects } = await n8n.projects.list();

// Create a project
const project = await n8n.projects.create({ name: 'Production Workflows' });

// Get a project
const projectDetails = await n8n.projects.get('project-id');

// Update a project
await n8n.projects.update('project-id', { name: 'Staging Workflows' });

// Delete a project
await n8n.projects.delete('project-id');
```

### Audit

```typescript
// Generate a full security audit
const audit = await n8n.audit.generate();

// Generate audit for specific categories
const credentialAudit = await n8n.audit.generate({
  additionalOptions: {
    categories: ['credentials', 'nodes'],
    daysAbandonedWorkflow: 90,
  },
});
```

## Pagination

All list methods return paginated responses with a `nextCursor` property:

```typescript
// Manual pagination
let cursor: string | undefined;
const allWorkflows = [];

do {
  const { data, nextCursor } = await n8n.workflows.list({ cursor, limit: 50 });
  allWorkflows.push(...data);
  cursor = nextCursor;
} while (cursor);

console.log(`Total workflows: ${allWorkflows.length}`);
```

## Error Handling

The SDK provides typed errors for different failure scenarios:

```typescript
import {
  N8nApiError,
  N8nTimeoutError,
  N8nNetworkError,
  N8nConfigError,
  N8nAbortError
} from 'n8n-sdk';

try {
  await n8n.workflows.get('non-existent-id');
} catch (error) {
  if (error instanceof N8nApiError) {
    console.log('Status:', error.status);
    console.log('Message:', error.message);

    if (error.isNotFound()) {
      console.log('Workflow not found');
    } else if (error.isUnauthorized()) {
      console.log('Invalid API key');
    } else if (error.isForbidden()) {
      console.log('Access denied');
    } else if (error.isValidationError()) {
      console.log('Invalid request');
    } else if (error.isServerError()) {
      console.log('Server error, try again later');
    }
  } else if (error instanceof N8nTimeoutError) {
    console.log(`Request timed out after ${error.timeout}ms`);
  } else if (error instanceof N8nNetworkError) {
    console.log('Network error:', error.message);
  }
}
```

## Request Cancellation

You can cancel requests using `AbortController`:

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const { data } = await n8n.workflows.list(
    { limit: 100 },
    { signal: controller.signal }
  );
} catch (error) {
  if (error instanceof N8nAbortError) {
    console.log('Request was cancelled');
  }
}
```

## Custom Timeouts

Override the default timeout per-request:

```typescript
// Use a longer timeout for this specific request
const { data } = await n8n.workflows.list(
  {},
  { timeout: 60000 } // 60 seconds
);
```

## TypeScript Support

All types are exported for use in your application:

```typescript
import type {
  Workflow,
  WorkflowNode,
  WorkflowConnections,
  Execution,
  ExecutionStatus,
  Credential,
  User,
  Tag,
  Variable,
  Project,
} from 'n8n-sdk';

function processWorkflow(workflow: Workflow): void {
  console.log(`Processing ${workflow.name}`);
  for (const node of workflow.nodes) {
    console.log(`  - ${node.name} (${node.type})`);
  }
}
```

## Examples

### Create a Complete Workflow

```typescript
import { N8n, type WorkflowNode, type WorkflowConnections } from 'n8n-sdk';

const n8n = new N8n({
  baseUrl: process.env.N8N_URL!,
  apiKey: process.env.N8N_API_KEY!,
});

const nodes: WorkflowNode[] = [
  {
    name: 'Manual Trigger',
    type: 'n8n-nodes-base.manualTrigger',
    typeVersion: 1,
    position: [250, 300],
  },
  {
    name: 'HTTP Request',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4,
    position: [450, 300],
    parameters: {
      url: 'https://api.example.com/data',
      method: 'GET',
    },
  },
  {
    name: 'Set',
    type: 'n8n-nodes-base.set',
    typeVersion: 3,
    position: [650, 300],
    parameters: {
      values: {
        string: [
          {
            name: 'processed',
            value: '={{ $json.data }}',
          },
        ],
      },
    },
  },
];

const connections: WorkflowConnections = {
  'Manual Trigger': {
    main: [[{ node: 'HTTP Request', type: 'main', index: 0 }]],
  },
  'HTTP Request': {
    main: [[{ node: 'Set', type: 'main', index: 0 }]],
  },
};

const workflow = await n8n.workflows.create({
  name: 'API Data Processor',
  nodes,
  connections,
  settings: {
    saveExecutionProgress: true,
    saveDataErrorExecution: 'all',
  },
});

console.log(`Created workflow: ${workflow.id}`);

// Activate the workflow
await n8n.workflows.activate(workflow.id);
console.log('Workflow activated!');
```

### Monitor Workflow Executions

```typescript
import { N8n } from 'n8n-sdk';

const n8n = new N8n({
  baseUrl: process.env.N8N_URL!,
  apiKey: process.env.N8N_API_KEY!,
});

async function monitorExecutions(workflowId: string): Promise<void> {
  // Get recent failed executions
  const { data: failed } = await n8n.executions.list({
    workflowId,
    status: 'error',
    limit: 10,
  });

  if (failed.length > 0) {
    console.log(`⚠️ Found ${failed.length} failed executions:`);
    for (const exec of failed) {
      console.log(`  - Execution ${exec.id} at ${exec.startedAt}`);
    }
  }

  // Get running executions
  const { data: running } = await n8n.executions.getRunning();
  console.log(`🔄 Currently running: ${running.length} executions`);

  // Get success rate
  const { data: all } = await n8n.executions.list({ workflowId, limit: 100 });
  const successCount = all.filter((e) => e.status === 'success').length;
  const successRate = ((successCount / all.length) * 100).toFixed(1);
  console.log(`📊 Success rate: ${successRate}%`);
}

monitorExecutions('your-workflow-id');
```

### Bulk Operations

```typescript
import { N8n } from 'n8n-sdk';

const n8n = new N8n({
  baseUrl: process.env.N8N_URL!,
  apiKey: process.env.N8N_API_KEY!,
});

// Deactivate all workflows with a specific tag
async function deactivateByTag(tagName: string): Promise<void> {
  const { data: workflows } = await n8n.workflows.list({ tags: tagName });

  for (const workflow of workflows) {
    if (workflow.active) {
      await n8n.workflows.deactivate(workflow.id);
      console.log(`Deactivated: ${workflow.name}`);
    }
  }
}

// Clean up old executions
async function cleanupOldExecutions(daysOld: number): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);

  let cursor: string | undefined;
  let deleted = 0;

  do {
    const { data: executions, nextCursor } = await n8n.executions.list({
      cursor,
      limit: 100,
    });

    for (const exec of executions) {
      if (new Date(exec.startedAt) < cutoff) {
        await n8n.executions.delete(exec.id);
        deleted++;
      }
    }

    cursor = nextCursor;
  } while (cursor);

  console.log(`Deleted ${deleted} executions older than ${daysOld} days`);
}
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.
