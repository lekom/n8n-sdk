/**
 * Workflow builder example - Creating complex workflows programmatically
 *
 * This example shows how to build a complete workflow with multiple nodes
 * and connections using the n8n SDK.
 */

import {
  N8n,
  type WorkflowNode,
  type WorkflowConnections,
  type WorkflowSettings,
} from '../src/index.js';

const n8n = new N8n({
  baseUrl: process.env['N8N_URL'] ?? 'https://your-n8n-instance.com',
  apiKey: process.env['N8N_API_KEY'] ?? 'your-api-key',
});

/**
 * Helper to create node positions in a grid
 */
function gridPosition(col: number, row: number): [number, number] {
  return [250 + col * 200, 200 + row * 150];
}

/**
 * Build an HTTP API workflow that:
 * 1. Triggers on webhook
 * 2. Validates the input
 * 3. Fetches data from an API
 * 4. Transforms the data
 * 5. Returns the response
 */
async function buildApiWorkflow(): Promise<void> {
  console.log('🔨 Building API workflow...\n');

  const nodes: WorkflowNode[] = [
    // Webhook trigger
    {
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: gridPosition(0, 0),
      webhookId: 'api-endpoint',
      parameters: {
        path: 'api/data',
        httpMethod: 'POST',
        responseMode: 'lastNode',
      },
    },
    // Input validation
    {
      name: 'Validate Input',
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: gridPosition(1, 0),
      parameters: {
        conditions: {
          boolean: [
            {
              value1: '={{ $json.userId !== undefined }}',
              value2: true,
            },
          ],
        },
      },
    },
    // Error response for invalid input
    {
      name: 'Invalid Input Response',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: gridPosition(2, 1),
      parameters: {
        respondWith: 'json',
        responseCode: 400,
        responseBody: '={{ { "error": "Missing userId parameter" } }}',
      },
    },
    // Fetch user data
    {
      name: 'Fetch User Data',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: gridPosition(2, 0),
      parameters: {
        url: '=https://api.example.com/users/{{ $json.userId }}',
        method: 'GET',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
      },
    },
    // Transform data
    {
      name: 'Transform Data',
      type: 'n8n-nodes-base.set',
      typeVersion: 3,
      position: gridPosition(3, 0),
      parameters: {
        values: {
          string: [
            { name: 'id', value: '={{ $json.id }}' },
            { name: 'name', value: '={{ $json.firstName }} {{ $json.lastName }}' },
            { name: 'email', value: '={{ $json.email }}' },
          ],
        },
        options: {
          keepOnlySet: true,
        },
      },
    },
    // Success response
    {
      name: 'Success Response',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: gridPosition(4, 0),
      parameters: {
        respondWith: 'json',
        responseCode: 200,
      },
    },
  ];

  const connections: WorkflowConnections = {
    Webhook: {
      main: [[{ node: 'Validate Input', type: 'main', index: 0 }]],
    },
    'Validate Input': {
      main: [
        [{ node: 'Fetch User Data', type: 'main', index: 0 }], // true branch
        [{ node: 'Invalid Input Response', type: 'main', index: 0 }], // false branch
      ],
    },
    'Fetch User Data': {
      main: [[{ node: 'Transform Data', type: 'main', index: 0 }]],
    },
    'Transform Data': {
      main: [[{ node: 'Success Response', type: 'main', index: 0 }]],
    },
  };

  const settings: WorkflowSettings = {
    saveExecutionProgress: true,
    saveDataErrorExecution: 'all',
    saveDataSuccessExecution: 'all',
    executionTimeout: 30,
  };

  const workflow = await n8n.workflows.create({
    name: 'User Data API',
    nodes,
    connections,
    settings,
  });

  console.log(`✅ Created workflow: ${workflow.name}`);
  console.log(`   ID: ${workflow.id}`);
  console.log(`   Nodes: ${workflow.nodes.length}`);
  console.log(`   Active: ${workflow.active}`);
}

/**
 * Build a scheduled data sync workflow that:
 * 1. Triggers on schedule (every hour)
 * 2. Fetches data from source
 * 3. Processes in batches
 * 4. Sends to destination
 * 5. Sends notification on completion
 */
async function buildScheduledSyncWorkflow(): Promise<void> {
  console.log('\n🔨 Building scheduled sync workflow...\n');

  const nodes: WorkflowNode[] = [
    // Cron trigger
    {
      name: 'Schedule Trigger',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1,
      position: gridPosition(0, 0),
      parameters: {
        rule: {
          interval: [
            {
              field: 'hours',
              hoursInterval: 1,
            },
          ],
        },
      },
    },
    // Fetch source data
    {
      name: 'Fetch Source Data',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: gridPosition(1, 0),
      parameters: {
        url: 'https://source-api.example.com/data',
        method: 'GET',
      },
    },
    // Split into batches
    {
      name: 'Split In Batches',
      type: 'n8n-nodes-base.splitInBatches',
      typeVersion: 3,
      position: gridPosition(2, 0),
      parameters: {
        batchSize: 100,
      },
    },
    // Process each item
    {
      name: 'Process Item',
      type: 'n8n-nodes-base.set',
      typeVersion: 3,
      position: gridPosition(3, 0),
      parameters: {
        values: {
          string: [
            { name: 'processedAt', value: '={{ $now.toISO() }}' },
            { name: 'source', value: 'sync-workflow' },
          ],
        },
      },
    },
    // Send to destination
    {
      name: 'Send to Destination',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: gridPosition(4, 0),
      parameters: {
        url: 'https://destination-api.example.com/import',
        method: 'POST',
        bodyParametersJson: '={{ JSON.stringify($json) }}',
      },
    },
    // Check if more batches
    {
      name: 'Loop Back',
      type: 'n8n-nodes-base.noOp',
      typeVersion: 1,
      position: gridPosition(3, 1),
    },
    // Send completion notification
    {
      name: 'Send Notification',
      type: 'n8n-nodes-base.slack',
      typeVersion: 2,
      position: gridPosition(5, 0),
      parameters: {
        channel: '#data-sync',
        text: '✅ Data sync completed successfully',
      },
    },
  ];

  const connections: WorkflowConnections = {
    'Schedule Trigger': {
      main: [[{ node: 'Fetch Source Data', type: 'main', index: 0 }]],
    },
    'Fetch Source Data': {
      main: [[{ node: 'Split In Batches', type: 'main', index: 0 }]],
    },
    'Split In Batches': {
      main: [
        [{ node: 'Process Item', type: 'main', index: 0 }],
        [{ node: 'Send Notification', type: 'main', index: 0 }],
      ],
    },
    'Process Item': {
      main: [[{ node: 'Send to Destination', type: 'main', index: 0 }]],
    },
    'Send to Destination': {
      main: [[{ node: 'Loop Back', type: 'main', index: 0 }]],
    },
    'Loop Back': {
      main: [[{ node: 'Split In Batches', type: 'main', index: 0 }]],
    },
  };

  const settings: WorkflowSettings = {
    saveExecutionProgress: true,
    saveDataErrorExecution: 'all',
    saveDataSuccessExecution: 'none', // Don't save successful executions for scheduled workflows
    executionTimeout: 3600, // 1 hour timeout
  };

  const workflow = await n8n.workflows.create({
    name: 'Hourly Data Sync',
    nodes,
    connections,
    settings,
  });

  console.log(`✅ Created workflow: ${workflow.name}`);
  console.log(`   ID: ${workflow.id}`);
  console.log(`   Nodes: ${workflow.nodes.length}`);
}

async function main(): Promise<void> {
  console.log('🚀 Workflow Builder Examples\n');
  console.log('='.repeat(50));

  try {
    await buildApiWorkflow();
    await buildScheduledSyncWorkflow();

    console.log('\n' + '='.repeat(50));
    console.log('✅ All workflows created successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
