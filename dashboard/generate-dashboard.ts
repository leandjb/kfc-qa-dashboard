import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface AssertionResult {
  fullName: string
  title: string
  status: 'passed' | 'failed'
  duration: number
}

interface SuiteResult {
  name: string
  assertionResults: AssertionResult[]
}

interface VitestJsonReport {
  startTime: number
  numTotalTests: number
  numPassedTests: number
  numFailedTests: number
  testResults: SuiteResult[]
}

function parseTestId(name: string): { id: string; description: string } {
  const match = name.match(/^(M-\w+-\d+)\s*[||-]\s*(.+)/)
  if (match) {
    return { id: match[1], description: match[2].trim() }
  }
  return { id: '', description: name }
}

function mapTestToCategory(name: string): string {
  if (name.includes('LOG')) return 'Login'
  if (name.includes('INV')) return 'Inventory'
  if (name.includes('CHK')) return 'Checkout'
  if (name.includes('NAV')) return 'Navigation'
  return 'Other'
}

function generateDashboard(report: VitestJsonReport, outputPath: string): void {
  const startTime = new Date(report.startTime).toLocaleString()

  let passedCount = 0
  let failedCount = 0
  let totalDuration = 0
  const rows: string[] = []

  for (const suite of report.testResults) {
    for (const test of suite.assertionResults) {
      const { id, description } = parseTestId(test.fullName)
      const category = id ? mapTestToCategory(id) : 'Other'
      const statusLabel = test.status === 'passed' ? 'PASS' : 'FAIL'
      const statusClass = test.status === 'passed' ? 'pass' : 'fail'
      const icon = test.status === 'passed' ? '&#10004;' : '&#10008;'
      const duration = (test.duration / 1000).toFixed(1)

      if (test.status === 'passed') passedCount++
      else failedCount++
      totalDuration += test.duration

      rows.push(`
        <tr class="${statusClass}">
          <td class="test-id">${id || '—'}</td>
          <td>${category}</td>
          <td class="test-desc">${escapeHtml(description)}</td>
          <td class="status">${icon} ${statusLabel}</td>
          <td class="duration">${duration}s</td>
        </tr>`)
    }
  }

  const totalTests = passedCount + failedCount
  const passRate = totalTests > 0 ? ((passedCount / totalTests) * 100).toFixed(1) : '0.0'
  const totalDurationSec = (totalDuration / 1000).toFixed(1)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QA Test Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f7fa;
      color: #333;
      padding: 24px;
      line-height: 1.5;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    h1 {
      font-size: 28px;
      margin-bottom: 8px;
      color: #1a1a2e;
    }
    .date { color: #666; font-size: 14px; margin-bottom: 24px; }
    .summary {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }
    .summary-card {
      background: #fff;
      border-radius: 10px;
      padding: 20px 28px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      flex: 1;
      min-width: 140px;
      text-align: center;
    }
    .summary-card .value {
      font-size: 32px;
      font-weight: 700;
    }
    .summary-card .label {
      font-size: 13px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-card.total .value { color: #1a1a2e; }
    .summary-card.passed .value { color: #22c55e; }
    .summary-card.failed .value { color: #ef4444; }
    .summary-card.rate .value { color: #3b82f6; }
    .summary-card.time .value { color: #8b5cf6; }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    th {
      background: #1a1a2e;
      color: #fff;
      padding: 14px 16px;
      text-align: left;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: #f8f9ff; }
    .test-id {
      font-family: 'SF Mono', 'Cascadia Code', monospace;
      font-size: 13px;
      font-weight: 600;
      color: #6366f1;
    }
    .test-desc { max-width: 400px; }
    .status {
      font-weight: 600;
      text-align: center;
    }
    .pass .status { color: #22c55e; }
    .fail .status { color: #ef4444; }
    .duration {
      font-family: 'SF Mono', 'Cascadia Code', monospace;
      font-size: 13px;
      text-align: center;
      color: #888;
    }
    @media (max-width: 640px) {
      body { padding: 12px; }
      th, td { padding: 10px 8px; font-size: 13px; }
      .summary-card { padding: 14px; min-width: 100px; }
      .summary-card .value { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>QA Test Dashboard</h1>
    <p class="date">Generated: ${new Date().toLocaleString()} | Test run started: ${startTime} | Target: saucedemo.com</p>

    <div class="summary">
      <div class="summary-card total">
        <div class="value">${totalTests}</div>
        <div class="label">Total Tests</div>
      </div>
      <div class="summary-card passed">
        <div class="value">${passedCount}</div>
        <div class="label">Passed</div>
      </div>
      <div class="summary-card failed">
        <div class="value">${failedCount}</div>
        <div class="label">Failed</div>
      </div>
      <div class="summary-card rate">
        <div class="value">${passRate}%</div>
        <div class="label">Pass Rate</div>
      </div>
      <div class="summary-card time">
        <div class="value">${totalDurationSec}s</div>
        <div class="label">Total Time</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Category</th>
          <th>Test</th>
          <th>Status</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        ${rows.join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`

  writeFileSync(outputPath, html, 'utf-8')
  console.log(`Dashboard generated: ${outputPath}`)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const reportsDir = resolve(__dirname, '..', 'reports')
const reportPath = resolve(reportsDir, 'test-results.json')

if (!existsSync(reportsDir)) {
  mkdirSync(reportsDir, { recursive: true })
}

const raw = readFileSync(reportPath, 'utf-8')
const report: VitestJsonReport = JSON.parse(raw)
const timestamp = new Date(report.startTime).toISOString().replace(/[:.]/g, '-')
const outputPath = resolve(reportsDir, `dashboard-${timestamp}.html`)

generateDashboard(report, outputPath)
