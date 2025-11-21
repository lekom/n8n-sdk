/**
 * Basic usage examples for the n8n SDK
 *
 * To run: npx ts-node examples/basic-usage.ts
 */

import { N8n, N8nApiError } from '../src/index.js';

// Initialize the client
const n8n = new N8n({
  baseUrl: process.env['N8N_URL'] ?? 'https://your-n8n-instance.com',
  apiKey: process.env['N8N_API_KEY'] ?? 'your-api-key',
});

async function listWorkflows(): Promise<void> {
  console.log('📋 Listing all workflows...\n');

  const { data: workflows, nextCursor } = await n8n.workflows.list({ limit: 10 });

  for (const workflow of workflows) {
    const status = workflow.active ? '✅' : '⏸️';
    console.log(`${status} ${workflow.name} (${workflow.id})`);
  }

  if (nextCursor) {
    console.log(`\n... and more (cursor: ${nextCursor})`);
  }
}

async function createSimpleWorkflow(): Promise<string> {
  console.log('\n🔧 Creating a simple workflow...\n');

  const workflow = await n8n.workflows.create({
    name: 'SDK Example Workflow',
    nodes: [
      {
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [250, 300],
      },
      {
        name: 'Set Data',
        type: 'n8n-nodes-base.set',
        typeVersion: 3,
        position: [450, 300],
        parameters: {
          values: {
            string: [
              {
                name: 'message',
                value: 'Hello from n8n SDK!',
              },
            ],
          },
        },
      },
    ],
    connections: {
      'Manual Trigger': {
        main: [[{ node: 'Set Data', type: 'main', index: 0 }]],
      },
    },
  });

  console.log(`Created workflow: ${workflow.name} (${workflow.id})`);
  return workflow.id;
}

async function manageWorkflowLifecycle(workflowId: string): Promise<void> {
  console.log('\n🔄 Managing workflow lifecycle...\n');

  // Activate
  let workflow = await n8n.workflows.activate(workflowId);
  console.log(`Activated: ${workflow.active}`);

  // Deactivate
  workflow = await n8n.workflows.deactivate(workflowId);
  console.log(`Deactivated: ${!workflow.active}`);

  // Delete
  await n8n.workflows.delete(workflowId);
  console.log(`Deleted workflow ${workflowId}`);
}

async function listExecutions(): Promise<void> {
  console.log('\n📊 Listing executions...\n');

  // Get all executions
  const { data: allExecutions } = await n8n.executions.list({ limit: 5 });
  console.log(`Total executions (first 5): ${allExecutions.length}`);

  // Get failed executions
  const { data: failedExecutions } = await n8n.executions.getFailed({ limit: 5 });
  console.log(`Failed executions: ${failedExecutions.length}`);

  // Get running executions
  const { data: runningExecutions } = await n8n.executions.getRunning();
  console.log(`Running executions: ${runningExecutions.length}`);
}

async function manageTags(): Promise<void> {
  console.log('\n🏷️ Managing tags...\n');

  // Create a tag
  const tag = await n8n.tags.create({ name: 'SDK-Example' });
  console.log(`Created tag: ${tag.name} (${tag.id})`);

  // List tags
  const { data: tags } = await n8n.tags.list();
  console.log(`Total tags: ${tags.length}`);

  // Delete the tag
  await n8n.tags.delete(tag.id);
  console.log(`Deleted tag: ${tag.name}`);
}

async function handleErrors(): Promise<void> {
  console.log('\n⚠️ Error handling example...\n');

  try {
    // Try to get a non-existent workflow
    await n8n.workflows.get('non-existent-id');
  } catch (error) {
    if (error instanceof N8nApiError) {
      console.log(`API Error: ${error.message}`);
      console.log(`Status: ${error.status}`);
      console.log(`Is Not Found: ${error.isNotFound()}`);
    } else {
      throw error;
    }
  }
}

async function main(): Promise<void> {
  console.log('🚀 n8n SDK Examples\n');
  console.log('='.repeat(50));

  try {
    await listWorkflows();
    const workflowId = await createSimpleWorkflow();
    await manageWorkflowLifecycle(workflowId);
    await listExecutions();
    await manageTags();
    await handleErrors();

    console.log('\n' + '='.repeat(50));
    console.log('✅ All examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
    process.exit(1);
  }
}

main();
