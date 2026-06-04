import type { ExposureClassification, ExposureReport, Finding, PortMapping, ServiceAnalysis } from "../types.js";
import { TOOL_NAME, getToolVersion } from "../version.js";
import { REPORT_WARNING_LINES } from "../warnings.js";

interface SummaryCounts {
  internal: number;
  published: number;
  unknown: number;
  high: number;
  medium: number;
  low: number;
}

export function renderHtmlReport(report: ExposureReport): string {
  const summary = buildSummary(report);

  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>${escapeHtml(TOOL_NAME)} Report</title>`,
    `  <style>${renderStyles()}</style>`,
    "</head>",
    "<body>",
    '  <main class="page">',
    "    <header>",
    `      <p class="eyebrow">${escapeHtml(TOOL_NAME)} ${escapeHtml(getToolVersion())}</p>`,
    "      <h1>ExposeMap Report</h1>",
    `      <p class="muted">Scanned file: <code>${escapeHtml(report.filePath)}</code></p>`,
    `      <p class="muted">Generated: <code>${escapeHtml(report.generatedAt)}</code></p>`,
    "    </header>",
    renderWarningPanel(),
    renderSummary(summary, report.services.length, report.findings.length),
    renderServiceSummary(report.services),
    renderFindings(report.findings),
    renderServiceDetails(report.services),
    renderMermaid(report.mermaid),
    "  </main>",
    "</body>",
    "</html>",
    ""
  ].join("\n");
}

function buildSummary(report: ExposureReport): SummaryCounts {
  return {
    internal: countServices(report, "internal"),
    published: countServices(report, "published"),
    unknown: countServices(report, "unknown"),
    high: countFindings(report, "high"),
    medium: countFindings(report, "medium"),
    low: countFindings(report, "low")
  };
}

function renderWarningPanel(): string {
  return [
    '    <section class="panel warning">',
    "      <h2>Local Configuration Only</h2>",
    "      <ul>",
    ...REPORT_WARNING_LINES.map((warning) => `        <li>${escapeHtml(warning)}</li>`),
    "      </ul>",
    "    </section>"
  ].join("\n");
}

function renderSummary(summary: SummaryCounts, serviceCount: number, findingCount: number): string {
  return [
    '    <section class="panel">',
    "      <h2>Summary</h2>",
    '      <div class="stats">',
    renderStat("Services", serviceCount),
    renderStat("Published", summary.published),
    renderStat("Internal", summary.internal),
    renderStat("Unknown", summary.unknown),
    renderStat("Findings", findingCount),
    renderStat("High", summary.high),
    renderStat("Medium", summary.medium),
    renderStat("Low", summary.low),
    "      </div>",
    "    </section>"
  ].join("\n");
}

function renderServiceSummary(services: ServiceAnalysis[]): string {
  return [
    '    <section class="panel">',
    "      <h2>Compose Visibility Summary</h2>",
    '      <div class="table-wrap">',
    "        <table>",
    "          <thead>",
    "            <tr><th>Service</th><th>Looks like</th><th>Why</th><th>Notes</th></tr>",
    "          </thead>",
    "          <tbody>",
    ...services.map(renderServiceRow),
    "          </tbody>",
    "        </table>",
    "      </div>",
    "    </section>"
  ].join("\n");
}

function renderFindings(findings: Finding[]): string {
  if (findings.length === 0) {
    return [
      '    <section class="panel">',
      "      <h2>Review Notes</h2>",
      '      <p class="muted">No review notes detected from Compose configuration.</p>',
      "    </section>"
    ].join("\n");
  }

  return [
    '    <section class="panel">',
    "      <h2>Review Notes</h2>",
    '      <div class="cards">',
    ...findings.map(renderFindingCard),
    "      </div>",
    "    </section>"
  ].join("\n");
}

function renderServiceDetails(services: ServiceAnalysis[]): string {
  return [
    '    <section class="panel">',
    "      <h2>Service Details</h2>",
    '      <div class="cards">',
    ...services.map(renderServiceCard),
    "      </div>",
    "    </section>"
  ].join("\n");
}

function renderMermaid(mermaid: string): string {
  return [
    '    <section class="panel">',
    "      <h2>Mermaid Diagram</h2>",
    '      <p class="muted">Mermaid source is included for internal renderers. No external JavaScript is loaded by this report.</p>',
    `      <pre class="mermaid"><code>${escapeHtml(mermaid)}</code></pre>`,
    "    </section>"
  ].join("\n");
}

function renderStat(label: string, value: number): string {
  return [
    '        <div class="stat">',
    `          <span class="stat-value">${value}</span>`,
    `          <span class="stat-label">${escapeHtml(label)}</span>`,
    "        </div>"
  ].join("\n");
}

function renderServiceRow(service: ServiceAnalysis): string {
  const notes = service.notes.length ? service.notes.map(escapeHtml).join("<br>") : "-";

  return [
    "            <tr>",
    `              <td><code>${escapeHtml(service.service.name)}</code></td>`,
    `              <td>${renderClassification(service.classification)}</td>`,
    `              <td>${escapeHtml(service.why)}</td>`,
    `              <td>${notes}</td>`,
    "            </tr>"
  ].join("\n");
}

function renderFindingCard(finding: Finding): string {
  return [
    '        <article class="card">',
    `          <h3>${escapeHtml(finding.title)}</h3>`,
    '          <dl class="meta">',
    `            <dt>Level</dt><dd>${renderSeverity(finding.severity)}</dd>`,
    `            <dt>Service</dt><dd><code>${escapeHtml(finding.service)}</code></dd>`,
    `            <dt>Rule</dt><dd><code>${escapeHtml(finding.ruleId)}</code></dd>`,
    `            <dt>Evidence</dt><dd><code>${escapeHtml(finding.evidence)}</code></dd>`,
    "          </dl>",
    `          <p>${escapeHtml(finding.description)}</p>`,
    `          <p><strong>Recommendation:</strong> ${escapeHtml(finding.recommendation)}</p>`,
    "        </article>"
  ].join("\n");
}

function renderServiceCard(service: ServiceAnalysis): string {
  return [
    '        <article class="card">',
    `          <h3>${escapeHtml(service.service.name)}</h3>`,
    '          <dl class="meta">',
    `            <dt>Looks like</dt><dd>${renderClassification(service.classification)}</dd>`,
    `            <dt>Why</dt><dd>${escapeHtml(service.why)}</dd>`,
    `            <dt>Image</dt><dd>${service.service.image ? `<code>${escapeHtml(service.service.image)}</code>` : "-"}</dd>`,
    "          </dl>",
    "          <h4>Ports</h4>",
    renderPorts(service.ports),
    "          <h4>Notes</h4>",
    renderList(service.notes, "No service-specific notes."),
    "        </article>"
  ].join("\n");
}

function renderPorts(ports: PortMapping[]): string {
  if (ports.length === 0) {
    return '<p class="muted">No Compose <code>ports</code> entries detected.</p>';
  }

  return renderList(ports.map((port) => port.evidence), "");
}

function renderList(items: string[], emptyMessage: string): string {
  if (items.length === 0) {
    return `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
  }

  return ["          <ul>", ...items.map((item) => `            <li>${escapeHtml(item)}</li>`), "          </ul>"].join("\n");
}

function renderClassification(classification: ExposureClassification): string {
  return `<span class="badge ${classification}">${classification}</span>`;
}

function renderSeverity(severity: Finding["severity"]): string {
  return `<span class="badge ${severity}">${severity}</span>`;
}

function countServices(report: ExposureReport, classification: ExposureClassification): number {
  return report.services.filter((service) => service.classification === classification).length;
}

function countFindings(report: ExposureReport, severity: Finding["severity"]): number {
  return report.findings.filter((finding) => finding.severity === severity).length;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderStyles(): string {
  return `
    :root {
      color-scheme: light;
      --bg: #f7f8f4;
      --panel: #ffffff;
      --text: #1f251f;
      --muted: #5f6b61;
      --line: #d9dfd3;
      --published: #245b40;
      --internal: #315f7d;
      --unknown: #815817;
      --high: #9b2f2f;
      --medium: #815817;
      --low: #315f7d;
      --soft: #eef4ee;
      --warn: #fff4df;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.6;
    }
    .page {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 40px 0;
    }
    header, .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 16px;
    }
    h1, h2, h3, h4, p, ul, dl { margin-top: 0; }
    h1 { font-size: 40px; line-height: 1.15; margin-bottom: 12px; }
    h2 { font-size: 24px; margin-bottom: 14px; }
    h3 { font-size: 19px; margin-bottom: 12px; }
    h4 { font-size: 15px; margin: 16px 0 8px; }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.95em;
    }
    .eyebrow {
      color: var(--muted);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .muted { color: var(--muted); }
    .warning { background: var(--warn); }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 12px;
    }
    .stat {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      background: var(--soft);
    }
    .stat-value {
      display: block;
      font-size: 26px;
      font-weight: 800;
    }
    .stat-label {
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
    }
    .table-wrap { overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 760px;
    }
    th, td {
      border-bottom: 1px solid var(--line);
      padding: 11px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      color: var(--muted);
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 12px;
    }
    .card {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      background: #fff;
    }
    .meta {
      display: grid;
      grid-template-columns: minmax(80px, max-content) 1fr;
      gap: 7px 12px;
    }
    .meta dt {
      color: var(--muted);
      font-weight: 700;
    }
    .meta dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 3px 9px;
      font-weight: 800;
      font-size: 12px;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .published { background: var(--published); }
    .internal, .low { background: var(--internal); }
    .unknown, .medium { background: var(--medium); }
    .high { background: var(--high); }
    pre {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f2f4ef;
      padding: 16px;
    }
    @media (max-width: 700px) {
      .page { width: min(100% - 20px, 1120px); padding-top: 20px; }
      header, .panel { padding: 16px; }
      h1 { font-size: 30px; }
      .cards { grid-template-columns: 1fr; }
    }
  `;
}
