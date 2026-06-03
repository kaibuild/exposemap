import type { ExposureReport, Finding, ServiceAnalysis } from "../types.js";
import { CONFIGURATION_ONLY_WARNING } from "../warnings.js";

export function renderMarkdownReport(report: ExposureReport): string {
  return [
    "# ExposeMap Report",
    "",
    `Scanned file: \`${report.filePath}\``,
    "",
    `Total services: ${report.services.length}`,
    "",
    "## Compose Visibility Summary",
    "",
    renderSummaryTable(report.services),
    "",
    "## Review Notes",
    "",
    renderFindings(report.findings, "No review notes detected from Compose configuration."),
    "",
    "## Service Details",
    "",
    report.services.map(renderServiceDetails).join("\n\n"),
    "",
    "## Mermaid Diagram",
    "",
    "```mermaid",
    report.mermaid,
    "```",
    "",
    "## Limitations",
    "",
    "- ExposeMap is a lightweight, read-only configuration review tool.",
    "- Results are heuristic checks based on Docker Compose configuration.",
    "- published means host-published in Compose, not internet-reachable.",
    "- internal means no host-published ports found, not impossible to reach.",
    "- ExposeMap does not perform real network scans.",
    "- ExposeMap does not connect to containers or modify Compose files.",
    "- Reverse proxy, firewall, VPN, DNS, cloud security group, and host-level rules can change real exposure.",
    "",
    "```text",
    CONFIGURATION_ONLY_WARNING,
    "```",
    ""
  ].join("\n");
}

function renderSummaryTable(services: ServiceAnalysis[]): string {
  return [
    "| Service | Looks like | Why | Notes |",
    "| --- | --- | --- | --- |",
    ...services.map((service) => {
      const notes = service.notes.join("<br>") || "-";

      return `| ${service.service.name} | ${service.classification} | ${service.why} | ${notes} |`;
    })
  ].join("\n");
}

function renderFindings(findings: Finding[], emptyMessage: string): string {
  if (findings.length === 0) {
    return emptyMessage;
  }

  return findings
    .map(
      (finding) => [
        `### ${finding.title}`,
        "",
        `- Level: ${finding.severity}`,
        `- Service: \`${finding.service}\``,
        `- Rule: \`${finding.ruleId}\``,
        `- Evidence: \`${finding.evidence}\``,
        `- Recommendation: ${finding.recommendation}`,
        "",
        finding.description
      ].join("\n")
    )
    .join("\n\n");
}

function renderServiceDetails(service: ServiceAnalysis): string {
  const findings = service.findings.length
    ? renderFindings(service.findings, "")
    : "No service-specific findings.";
  const ports = service.ports.length
    ? service.ports.map((port) => `- \`${port.evidence}\``).join("\n")
    : "- No Compose `ports` entries detected.";

  return [
    `### ${service.service.name}`,
    "",
    `Looks like: **${service.classification}**`,
    "",
    `Why: ${service.why}`,
    "",
    "Ports:",
    "",
    ports,
    "",
    "Findings:",
    "",
    findings
  ].join("\n");
}
