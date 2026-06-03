import type { ServiceAnalysis } from "../types.js";

export function renderMermaidDiagram(services: ServiceAnalysis[]): string {
  const lines = ["graph TD"];
  const published = services.filter((service) => service.classification === "published");
  const internal = services.filter((service) => service.classification === "internal");
  const unknown = services.filter((service) => service.classification === "unknown");

  lines.push("  Published[Host-published in Compose]");
  lines.push("  Internal[No host-published ports found]");
  lines.push("  Unknown[Unknown from Compose]");

  for (const service of published) {
    lines.push(`  Published --> ${nodeId(service.service.name)}[${escapeLabel(service.service.name)}]`);
  }

  for (const service of internal) {
    lines.push(`  Internal --> ${nodeId(service.service.name)}[${escapeLabel(service.service.name)}]`);
  }

  for (const service of unknown) {
    lines.push(`  Unknown -.-> ${nodeId(service.service.name)}[${escapeLabel(service.service.name)}]`);
  }

  addDependencyEdges(lines, services);

  return Array.from(new Set(lines)).join("\n");
}

function addDependencyEdges(lines: string[], services: ServiceAnalysis[]): void {
  const knownServices = new Set(services.map((service) => service.service.name));

  for (const service of services) {
    for (const dependency of service.service.dependsOn) {
      if (knownServices.has(dependency)) {
        lines.push(`  ${nodeId(service.service.name)} --> ${nodeId(dependency)}[${escapeLabel(dependency)}]`);
      }
    }
  }
}

function nodeId(name: string): string {
  return `svc_${name.replace(/[^a-zA-Z0-9_]/g, "_")}`;
}

function escapeLabel(label: string): string {
  return label.replace(/"/g, "'");
}
