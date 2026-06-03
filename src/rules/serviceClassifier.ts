import type {
  ComposeProject,
  ComposeService,
  ExposureClassification,
  ExposureReport,
  Finding,
  ServiceAnalysis
} from "../types.js";
import { getBroadlyBoundPorts } from "./directExposure.js";
import { getLocalhostBindings } from "./localhostBindings.js";
import { parsePortMappings } from "./ports.js";
import { hasReverseProxyRoutingHint, isLikelyReverseProxyService } from "./reverseProxy.js";
import { renderMermaidDiagram } from "../report/mermaid.js";

export function analyzeProject(project: ComposeProject): ExposureReport {
  const analyses = project.services.map(analyzeService);
  const findings = analyses.flatMap((service) => service.findings);

  addReverseProxyClarityFindings(analyses, findings);

  return {
    filePath: project.filePath,
    services: analyses,
    findings,
    generatedAt: new Date().toISOString(),
    mermaid: renderMermaidDiagram(analyses)
  };
}

export function analyzeService(service: ComposeService): ServiceAnalysis {
  const ports = parsePortMappings(service.ports);
  const broadPorts = getBroadlyBoundPorts(ports);
  const localhostPorts = getLocalhostBindings(ports);
  const isReverseProxy = isLikelyReverseProxyService(service);
  const hasReverseProxyRouting = hasReverseProxyRoutingHint(service);
  const classification = classifyService({
    ports,
    hasReverseProxyRouting,
    service
  });
  const why = buildWhy(service, ports, classification, hasReverseProxyRouting);
  const notes = buildNotes(service, ports, hasReverseProxyRouting);

  const findings: Finding[] = buildInformationalFindings(service.name, classification, why);

  if (ports.length !== service.ports.length) {
    findings.push({
      ruleId: "unknown-port-syntax",
      severity: "medium",
      service: service.name,
      title: "Service exposure is unknown",
      description: "At least one port entry could not be parsed by ExposeMap.",
      evidence: JSON.stringify(service.ports),
      recommendation: "Review this service manually and consider opening an issue with a sanitized Compose snippet."
    });
  }

  return {
    service,
    classification,
    ports,
    broadPorts,
    localhostPorts,
    isReverseProxy,
    hasReverseProxyRouting,
    why,
    findings,
    notes
  };
}

function classifyService(input: {
  ports: ReturnType<typeof parsePortMappings>;
  hasReverseProxyRouting: boolean;
  service: ComposeService;
}): ExposureClassification {
  if (input.service.ports.length > 0 && input.ports.length !== input.service.ports.length) {
    return "unknown";
  }

  if (input.ports.length > 0) {
    return "published";
  }

  if (input.hasReverseProxyRouting) {
    return "unknown";
  }

  return "internal";
}

function buildWhy(
  service: ComposeService,
  ports: ReturnType<typeof parsePortMappings>,
  classification: ExposureClassification,
  hasReverseProxyRouting: boolean
): string {
  if (classification === "published") {
    return ports.map((port) => `ports: ${port.evidence}`).join(", ");
  }

  if (classification === "unknown") {
    if (service.ports.length > 0 && ports.length !== service.ports.length) {
      return "requires expanded compose config";
    }

    if (hasReverseProxyRouting) {
      return "proxy labels detected; note only in MVP";
    }

    return "unsupported compose syntax";
  }

  if (service.expose.length > 0) {
    return `expose only: ${service.expose.map(String).join(", ")}`;
  }

  if (hasServiceNetworks(service.raw.networks)) {
    return "no host-published ports; attached to service networks";
  }

  return "no host-published ports";
}

function hasServiceNetworks(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return typeof value === "object" && value !== null && Object.keys(value).length > 0;
}

function buildNotes(
  service: ComposeService,
  ports: ReturnType<typeof parsePortMappings>,
  hasReverseProxyRouting: boolean
): string[] {
  const notes: string[] = [];

  if (ports.some((port) => port.isLocalhostBound)) {
    notes.push("Host binding is local, but MVP still reports host-published ports as published.");
  }

  if (hasReverseProxyRouting) {
    notes.push("Reverse proxy labels are note only in MVP and are not a formal classification.");
  }

  if (service.ports.length > 0 && ports.length !== service.ports.length) {
    notes.push("One or more port mappings could not be parsed.");
  }

  return notes;
}

function buildInformationalFindings(serviceName: string, classification: ExposureClassification, why: string): Finding[] {
  if (classification === "unknown") {
    return [
      {
        ruleId: "unknown-exposure",
        severity: "medium",
        service: serviceName,
        title: "Service exposure is unknown",
        description: "ExposeMap could not confidently classify this service from Compose configuration alone.",
        evidence: why,
        recommendation: "Review this service manually, including reverse proxy, VPN, firewall, and host-level configuration."
      }
    ];
  }

  if (classification === "internal") {
    return [
      {
        ruleId: "internal-service",
        severity: "low",
        service: serviceName,
        title: "Service appears internal",
        description:
          "No host-published Compose ports were detected. This is not proof that the service is impossible to reach.",
        evidence: why,
        recommendation: "Confirm this matches the intended access path and document any proxy, VPN, or firewall assumptions."
      }
    ];
  }

  return [];
}

function addReverseProxyClarityFindings(analyses: ServiceAnalysis[], findings: Finding[]): void {
  const reverseProxies = analyses.filter((service) => service.isReverseProxy);
  const routedServices = analyses.filter((service) => service.hasReverseProxyRouting);

  if (reverseProxies.length > 0 && routedServices.length === 0) {
    for (const reverseProxy of reverseProxies) {
      findings.push({
        ruleId: "reverse-proxy-routes-unclear",
        severity: "medium",
        service: reverseProxy.service.name,
        title: "Reverse proxy service hint detected",
        description:
          "A likely reverse proxy service exists. Reverse proxy behavior is note-only in the MVP and is not a formal classification.",
        evidence: reverseProxy.service.image ?? reverseProxy.service.name,
        recommendation:
          "Review reverse proxy configuration outside Compose, such as mounted Caddyfiles, Nginx Proxy Manager state, Traefik dynamic config, or host files."
      });
    }
  }
}
