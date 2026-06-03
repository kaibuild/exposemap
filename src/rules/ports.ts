import type { PortMapping } from "../types.js";

const LOCALHOST_BINDINGS = new Set(["127.0.0.1", "localhost", "::1"]);

export function parsePortMapping(raw: unknown): PortMapping | null {
  if (typeof raw === "number") {
    return buildPortMapping({
      syntax: "short",
      raw,
      evidence: String(raw),
      target: String(raw),
      isPublished: true
    });
  }

  if (typeof raw === "string") {
    return parseShortPort(raw);
  }

  if (isRecord(raw)) {
    return parseLongPort(raw);
  }

  return null;
}

export function parsePortMappings(rawPorts: unknown[]): PortMapping[] {
  return rawPorts.map(parsePortMapping).filter((port): port is PortMapping => port !== null);
}

export function isLocalhostBinding(hostIp: string | undefined): boolean {
  return hostIp ? LOCALHOST_BINDINGS.has(hostIp.toLowerCase()) : false;
}

function parseShortPort(raw: string): PortMapping | null {
  const trimmed = raw.trim();
  if (!trimmed || hasInterpolation(trimmed)) {
    return null;
  }

  const [withoutProtocol, protocol] = splitProtocol(trimmed);
  const parts = withoutProtocol.split(":");

  if (parts.some((part) => part.trim().length === 0)) {
    return null;
  }

  if (parts.length === 1) {
    return buildPortMapping({
      syntax: "short",
      raw,
      evidence: raw,
      target: parts[0],
      protocol,
      isPublished: true
    });
  }

  if (parts.length === 2) {
    return buildPortMapping({
      syntax: "short",
      raw,
      evidence: raw,
      published: parts[0],
      target: parts[1],
      protocol,
      isPublished: true
    });
  }

  const [hostIp, published, ...targetParts] = parts;
  return buildPortMapping({
    syntax: "short",
    raw,
    evidence: raw,
    hostIp,
    published,
    target: targetParts.join(":"),
    protocol,
    isPublished: true
  });
}

function parseLongPort(raw: Record<string, unknown>): PortMapping | null {
  const target = stringifyPort(raw.target);
  const published = stringifyPort(raw.published);
  const hostIp = typeof raw.host_ip === "string" ? raw.host_ip : undefined;
  const protocol = typeof raw.protocol === "string" ? raw.protocol : undefined;

  if ((!target && !published) || hasInterpolation(target) || hasInterpolation(published) || hasInterpolation(hostIp)) {
    return null;
  }

  return buildPortMapping({
    syntax: "long",
    raw,
    evidence: JSON.stringify(raw),
    hostIp,
    published,
    target,
    protocol,
    isPublished: true
  });
}

function hasInterpolation(value: string | undefined): boolean {
  return Boolean(value?.includes("$"));
}

function buildPortMapping(input: Omit<PortMapping, "isLocalhostBound" | "isBroadlyBound">): PortMapping {
  const isLocalhostBound = isLocalhostBinding(input.hostIp);
  return {
    ...input,
    isLocalhostBound,
    isBroadlyBound: input.isPublished && !isLocalhostBound
  };
}

function splitProtocol(value: string): [string, string | undefined] {
  const slashIndex = value.lastIndexOf("/");
  if (slashIndex === -1) {
    return [value, undefined];
  }
  return [value.slice(0, slashIndex), value.slice(slashIndex + 1)];
}

function stringifyPort(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
