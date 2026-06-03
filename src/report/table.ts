import type { ExposureReport } from "../types.js";
import {
  CLASSIFICATION_WARNING_LINES,
  CONFIGURATION_ONLY_WARNING,
  STATIC_COMPOSE_LIMITATION_WARNING
} from "../warnings.js";

export function renderTableReport(report: ExposureReport): string {
  const rows = [
    ["Service", "Looks like", "Why"],
    ...report.services.map((service) => [service.service.name, service.classification, service.why])
  ];
  const widths = rows[0].map((_, column) => Math.max(...rows.map((row) => row[column].length)));

  return [
    rows.map((row) => row.map((cell, column) => cell.padEnd(widths[column])).join("   ")).join("\n"),
    "",
    ...CLASSIFICATION_WARNING_LINES,
    "",
    CONFIGURATION_ONLY_WARNING,
    STATIC_COMPOSE_LIMITATION_WARNING,
    ""
  ].join("\n");
}
