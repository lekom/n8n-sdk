/**
 * Monitoring and reporting example
 *
 * This example shows how to use the n8n SDK to build monitoring
 * and reporting tools for your n8n instance.
 */

import { N8n, type Execution, type Workflow } from '../src/index.js';

const n8n = new N8n({
  baseUrl: process.env['N8N_URL'] ?? 'https://your-n8n-instance.com',
  apiKey: process.env['N8N_API_KEY'] ?? 'your-api-key',
});

interface WorkflowStats {
  id: string;
  name: string;
  active: boolean;
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
  lastExecution?: string;
  errorCount: number;
}

interface InstanceHealth {
  totalWorkflows: number;
  activeWorkflows: number;
  runningExecutions: number;
  recentErrors: Execution[];
  workflowStats: WorkflowStats[];
}

/**
 * Collect all items from a paginated endpoint
 */
async function collectAll<T>(
  fetcher: (cursor?: string) => Promise<{ data: T[]; nextCursor?: string }>
): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | undefined;

  do {
    const { data, nextCursor } = await fetcher(cursor);
    items.push(...data);
    cursor = nextCursor;
  } while (cursor);

  return items;
}

/**
 * Get statistics for a single workflow
 */
async function getWorkflowStats(workflow: Workflow): Promise<WorkflowStats> {
  const executions = await collectAll((cursor) =>
    n8n.executions.list({
      workflowId: workflow.id,
      limit: 100,
      cursor,
    })
  );

  const successful = executions.filter((e) => e.status === 'success');
  const errors = executions.filter((e) => e.status === 'error');

  // Calculate average duration for completed executions
  const completedWithDuration = executions.filter(
    (e) => e.stoppedAt && e.startedAt
  );
  const avgDuration =
    completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, e) => {
          const start = new Date(e.startedAt).getTime();
          const stop = new Date(e.stoppedAt!).getTime();
          return sum + (stop - start);
        }, 0) / completedWithDuration.length
      : 0;

  // Sort by date to find last execution
  const sorted = [...executions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  return {
    id: workflow.id,
    name: workflow.name,
    active: workflow.active,
    totalExecutions: executions.length,
    successRate:
      executions.length > 0
        ? (successful.length / executions.length) * 100
        : 100,
    avgDuration,
    lastExecution: sorted[0]?.startedAt,
    errorCount: errors.length,
  };
}

/**
 * Generate a health report for the n8n instance
 */
async function generateHealthReport(): Promise<InstanceHealth> {
  console.log('📊 Generating health report...\n');

  // Get all workflows
  const workflows = await collectAll((cursor) =>
    n8n.workflows.list({ cursor, limit: 100 })
  );

  // Get running executions
  const { data: running } = await n8n.executions.getRunning();

  // Get recent errors (last 24 hours worth, up to 50)
  const { data: recentErrors } = await n8n.executions.getFailed({ limit: 50 });
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const last24hErrors = recentErrors.filter(
    (e) => new Date(e.startedAt).getTime() > oneDayAgo
  );

  // Get stats for each workflow (limit to first 10 for demo)
  const statsPromises = workflows.slice(0, 10).map(getWorkflowStats);
  const workflowStats = await Promise.all(statsPromises);

  return {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter((w) => w.active).length,
    runningExecutions: running.length,
    recentErrors: last24hErrors,
    workflowStats,
  };
}

/**
 * Print a formatted health report
 */
function printHealthReport(health: InstanceHealth): void {
  console.log('=' .repeat(60));
  console.log('                    n8n Instance Health Report');
  console.log('=' .repeat(60));
  console.log();

  // Overview
  console.log('📈 Overview');
  console.log('-'.repeat(40));
  console.log(`  Total Workflows:      ${health.totalWorkflows}`);
  console.log(`  Active Workflows:     ${health.activeWorkflows}`);
  console.log(`  Running Executions:   ${health.runningExecutions}`);
  console.log(`  Errors (24h):         ${health.recentErrors.length}`);
  console.log();

  // Workflow stats table
  console.log('📋 Workflow Statistics (Top 10)');
  console.log('-'.repeat(80));
  console.log(
    '  Name'.padEnd(30) +
      'Status'.padEnd(10) +
      'Success'.padEnd(10) +
      'Errors'.padEnd(10) +
      'Avg Duration'
  );
  console.log('-'.repeat(80));

  for (const stat of health.workflowStats) {
    const name = stat.name.substring(0, 27).padEnd(30);
    const status = (stat.active ? '✅ Active' : '⏸️ Paused').padEnd(10);
    const success = `${stat.successRate.toFixed(1)}%`.padEnd(10);
    const errors = String(stat.errorCount).padEnd(10);
    const duration = `${(stat.avgDuration / 1000).toFixed(2)}s`;
    console.log(`  ${name}${status}${success}${errors}${duration}`);
  }
  console.log();

  // Recent errors
  if (health.recentErrors.length > 0) {
    console.log('⚠️ Recent Errors (Last 24h)');
    console.log('-'.repeat(60));
    for (const error of health.recentErrors.slice(0, 5)) {
      const time = new Date(error.startedAt).toLocaleString();
      console.log(`  [${time}] Workflow ${error.workflowId} - Execution ${error.id}`);
    }
    if (health.recentErrors.length > 5) {
      console.log(`  ... and ${health.recentErrors.length - 5} more`);
    }
    console.log();
  }

  console.log('=' .repeat(60));
}

/**
 * Generate a security audit report
 */
async function generateSecurityAudit(): Promise<void> {
  console.log('\n🔒 Generating security audit...\n');

  const audit = await n8n.audit.generate({
    additionalOptions: {
      categories: ['credentials', 'nodes', 'instance'],
      daysAbandonedWorkflow: 30,
    },
  });

  console.log('Security Audit Results');
  console.log('-'.repeat(40));

  for (const [category, result] of Object.entries(audit)) {
    const findings = result.findings;
    const highRisk = findings.filter((f) => f.risk === 'high').length;
    const mediumRisk = findings.filter((f) => f.risk === 'medium').length;
    const lowRisk = findings.filter((f) => f.risk === 'low').length;

    console.log(`\n📁 ${category.toUpperCase()}`);
    console.log(`   High Risk:   ${highRisk}`);
    console.log(`   Medium Risk: ${mediumRisk}`);
    console.log(`   Low Risk:    ${lowRisk}`);

    if (highRisk > 0) {
      console.log('\n   High Risk Findings:');
      for (const finding of findings.filter((f) => f.risk === 'high')) {
        console.log(`   ⚠️ ${finding.description}`);
        if (finding.recommendation) {
          console.log(`      → ${finding.recommendation}`);
        }
      }
    }
  }
}

async function main(): Promise<void> {
  console.log('🚀 n8n Monitoring Dashboard\n');

  try {
    const health = await generateHealthReport();
    printHealthReport(health);

    await generateSecurityAudit();

    console.log('\n✅ Report generation complete!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
