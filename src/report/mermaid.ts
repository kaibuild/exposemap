import type { ServiceAnalysis } from "../types.js";

export function renderMermaidDiagram(services: ServiceAnalysis[]): string {
  const lines = [
    "graph TD",
    "  classDef published fill:#fee2e2,stroke:#b91c1c,color:#111827;",
    "  classDef local fill:#fef3c7,stroke:#b45309,color:#111827;",
    "  classDef proxy fill:#e0f2fe,stroke:#0369a1,color:#111827;",
    "  classDef internal fill:#dcfce7,stroke:#15803d,color:#111827;",
    "  classDef unknown fill:#ede9fe,stroke:#6d28d9,color:#111827;"
  ];

  addGroup(lines, "group_published", "Host-published in Compose", services.filter(isBroadlyPublished), "published");
  addGroup(lines, "group_local", "Localhost-published in Compose", services.filter(isLocalhostOnlyPublished), "local");
  addGroup(lines, "group_proxy", "Reverse proxy hints", services.filter(hasProxyHint), "proxy");
  addGroup(lines, "group_internal", "No host-published ports found", services.filter(isInternal), "internal");
  addGroup(lines, "group_unknown", "Needs manual review", services.filter(isOtherUnknown), "unknown");

  addDependencyEdges(lines, services);

  return lines.join("\n");
}

function addGroup(lines: string[], groupId: string, label: string, services: ServiceAnalysis[], className: string): void {
  if (services.length === 0) {
    return;
  }

  lines.push(`  subgraph ${groupId}["${escapeLabel(label)}"]`);

  for (const service of services) {
    lines.push(`    ${nodeId(service.service.name)}["${escapeLabel(service.service.name)}"]`);
    lines.push(`    class ${nodeId(service.service.name)} ${className};`);
  }

  lines.push("  end");
}

function addDependencyEdges(lines: string[], services: ServiceAnalysis[]): void {
  const knownServices = new Set(services.map((service) => service.service.name));
  const addedEdges = new Set<string>();

  for (const service of services) {
    for (const dependency of service.service.dependsOn) {
      if (knownServices.has(dependency)) {
        const edge = `  ${nodeId(service.service.name)} -->|depends_on| ${nodeId(dependency)}`;
        if (!addedEdges.has(edge)) {
          lines.push(edge);
          addedEdges.add(edge);
        }
      }
    }
  }
}

function isBroadlyPublished(service: ServiceAnalysis): boolean {
  return service.classification === "published" && service.broadPorts.length > 0;
}

function isLocalhostOnlyPublished(service: ServiceAnalysis): boolean {
  return service.classification === "published" && service.broadPorts.length === 0 && service.localhostPorts.length > 0;
}

function hasProxyHint(service: ServiceAnalysis): boolean {
  return service.classification === "unknown" && service.hasReverseProxyRouting;
}

function isInternal(service: ServiceAnalysis): boolean {
  return service.classification === "internal";
}

function isOtherUnknown(service: ServiceAnalysis): boolean {
  return service.classification === "unknown" && !service.hasReverseProxyRouting;
}

function nodeId(name: string): string {
  return `svc_${name.replace(/[^a-zA-Z0-9_]/g, "_")}`;
}

function escapeLabel(label: string): string {
  return label.replace(/"/g, "'");
}
