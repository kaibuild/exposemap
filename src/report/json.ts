import type { ExposureClassification, ExposureReport, Finding, PortMapping, ServiceAnalysis } from "../types.js";
import { TOOL_NAME, getToolVersion } from "../version.js";
import { REPORT_WARNING_LINES } from "../warnings.js";

interface JsonSummary {
  totalServices: number;
  internal: number;
  published: number;
  unknown: number;
  totalFindings: number;
  high: number;
  medium: number;
  low: number;
}

interface JsonService {
  name: string;
  classification: ExposureClassification;
  why: string;
  image?: string;
  ports: JsonPort[];
  labels: Record<string, string>;
  evidence: string[];
  notes: string[];
}

interface JsonPort {
  evidence: string;
  hostIp?: string;
  published?: string;
  target?: string;
  protocol?: string;
  isLocalhostBound: boolean;
  isBroadlyBound: boolean;
}

interface JsonExposureMapEntry {
  service: string;
  classification: ExposureClassification;
  entrypoints: string[];
  evidence: string[];
}

export interface JsonExposureReport {
  tool: {
    name: string;
    version: string;
  };
  scannedFilePath: string;
  generatedAt: string;
  disclaimers: string[];
  summary: JsonSummary;
  services: JsonService[];
  exposureMap: JsonExposureMapEntry[];
  findings: Finding[];
  mermaid: string;
}

export function buildJsonReport(report: ExposureReport): JsonExposureReport {
  return {
    tool: {
      name: TOOL_NAME,
      version: getToolVersion()
    },
    scannedFilePath: report.filePath,
    generatedAt: report.generatedAt,
    disclaimers: REPORT_WARNING_LINES,
    summary: buildSummary(report),
    services: report.services.map(buildService),
    exposureMap: report.services.map(buildExposureMapEntry),
    findings: report.findings,
    mermaid: report.mermaid
  };
}

export function renderJsonReport(report: ExposureReport): string {
  return `${JSON.stringify(buildJsonReport(report), null, 2)}\n`;
}

function buildSummary(report: ExposureReport): JsonSummary {
  return {
    totalServices: report.services.length,
    internal: countServices(report, "internal"),
    published: countServices(report, "published"),
    unknown: countServices(report, "unknown"),
    totalFindings: report.findings.length,
    high: countFindings(report, "high"),
    medium: countFindings(report, "medium"),
    low: countFindings(report, "low")
  };
}

function buildService(service: ServiceAnalysis): JsonService {
  return {
    name: service.service.name,
    classification: service.classification,
    why: service.why,
    image: service.service.image,
    ports: service.ports.map(buildPort),
    labels: service.service.labels,
    evidence: buildEvidence(service),
    notes: service.notes
  };
}

function buildPort(port: PortMapping): JsonPort {
  return {
    evidence: port.evidence,
    hostIp: port.hostIp,
    published: port.published,
    target: port.target,
    protocol: port.protocol,
    isLocalhostBound: port.isLocalhostBound,
    isBroadlyBound: port.isBroadlyBound
  };
}

function buildExposureMapEntry(service: ServiceAnalysis): JsonExposureMapEntry {
  return {
    service: service.service.name,
    classification: service.classification,
    entrypoints: getEntrypoints(service),
    evidence: buildEvidence(service)
  };
}

function buildEvidence(service: ServiceAnalysis): string[] {
  const evidence = service.ports.map((port) => port.evidence);

  if (service.isReverseProxy) {
    evidence.push("likely reverse proxy service; note only in MVP");
  }

  if (service.isCloudflareTunnel) {
    evidence.push("cloudflared tunnel detected; routes may live outside Compose");
  }

  if (service.isCaddyService) {
    evidence.push("likely Caddy service detected");
  }

  if (service.hasCaddyConfigHint) {
    evidence.push("Caddyfile or /etc/caddy mount detected; Caddyfile contents are not parsed");
  }

  if (service.hasCaddyRoutingHint) {
    evidence.push("Caddy routing hint detected; routes may live outside Compose");
  }

  if (service.hasReverseProxyRouting) {
    evidence.push("proxy labels detected; note only in MVP");
  }

  if (service.ports.length === 0) {
    evidence.push("no Compose ports detected");
  }

  return evidence;
}

function getEntrypoints(service: ServiceAnalysis): string[] {
  switch (service.classification) {
    case "published":
      return ["host-published-in-compose"];
    case "internal":
      return ["no-host-published-ports-found"];
    case "unknown":
      return ["unknown"];
  }
}

function countServices(report: ExposureReport, classification: ExposureClassification): number {
  return report.services.filter((service) => service.classification === classification).length;
}

function countFindings(report: ExposureReport, severity: Finding["severity"]): number {
  return report.findings.filter((finding) => finding.severity === severity).length;
}
