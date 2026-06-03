import type { ExposureReport } from "../types.js";
import { CONFIGURATION_ONLY_WARNING } from "../warnings.js";

export function renderTableReport(report: ExposureReport): string {
  const rows = [
    ["Service", "Looks like", "Why"],
    ...report.services.map((service) => [service.service.name, service.classification, service.why])
  ];
  const widths = rows[0].map((_, column) => Math.max(...rows.map((row) => row[column].length)));

  return [
    rows.map((row) => row.map((cell, column) => cell.padEnd(widths[column])).join("   ")).join("\n"),
    "",
    "published means host-published in Compose, not internet-reachable.",
    "internal means no host-published ports found, not impossible to reach.",
    "",
    CONFIGURATION_ONLY_WARNING,
    ""
  ].join("\n");
}
