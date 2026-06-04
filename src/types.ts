export type ExposureClassification =
  | "internal"
  | "published"
  | "unknown";

export type Severity = "high" | "medium" | "low";

export type PortSyntax = "short" | "long";

export interface PortMapping {
  syntax: PortSyntax;
  raw: unknown;
  evidence: string;
  hostIp?: string;
  published?: string;
  target?: string;
  protocol?: string;
  isPublished: boolean;
  isLocalhostBound: boolean;
  isBroadlyBound: boolean;
}

export interface ComposeService {
  name: string;
  image?: string;
  ports: unknown[];
  expose: unknown[];
  labels: Record<string, string>;
  environment: Record<string, string>;
  dependsOn: string[];
  raw: Record<string, unknown>;
}

export interface ComposeProject {
  filePath: string;
  services: ComposeService[];
}

export interface Finding {
  ruleId: string;
  severity: Severity;
  service: string;
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
}

export interface ServiceAnalysis {
  service: ComposeService;
  classification: ExposureClassification;
  ports: PortMapping[];
  broadPorts: PortMapping[];
  localhostPorts: PortMapping[];
  isReverseProxy: boolean;
  isCloudflareTunnel: boolean;
  isCaddyService: boolean;
  hasCaddyConfigHint: boolean;
  hasCaddyRoutingHint: boolean;
  hasReverseProxyRouting: boolean;
  why: string;
  findings: Finding[];
  notes: string[];
}

export interface ExposureReport {
  filePath: string;
  services: ServiceAnalysis[];
  findings: Finding[];
  generatedAt: string;
  mermaid: string;
}
