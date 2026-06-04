import type { ComposeService } from "../types.js";

const REVERSE_PROXY_KEYWORDS = [
  "traefik",
  "caddy",
  "nginx",
  "nginx-proxy-manager",
  "haproxy",
  "swag",
  "letsencrypt"
];

const ROUTING_ENV_HINTS = ["VIRTUAL_HOST", "LETSENCRYPT_HOST", "CADDY_HOST"];

export function isLikelyReverseProxyService(service: ComposeService): boolean {
  const command = normalizeRawValue(service.raw.command);
  const haystack = `${service.name} ${service.image ?? ""} ${command}`.toLowerCase();

  if (REVERSE_PROXY_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
    return true;
  }

  return tokenize(haystack).includes("npm") || hasCaddyConfigHint(service);
}

export function isLikelyCaddyService(service: ComposeService): boolean {
  const command = normalizeRawValue(service.raw.command);
  const haystack = `${service.name} ${service.image ?? ""} ${command}`.toLowerCase();

  if (tokenize(haystack).includes("caddy")) {
    return true;
  }

  return hasCaddyConfigHint(service);
}

export function isLikelyCloudflareTunnelService(service: ComposeService): boolean {
  const command = normalizeRawValue(service.raw.command);
  const haystack = `${service.name} ${service.image ?? ""} ${command}`.toLowerCase();

  if (haystack.includes("cloudflared")) {
    return true;
  }

  if (haystack.includes("cloudflare") && haystack.includes("tunnel")) {
    return true;
  }

  return hasNonEmptyEnvironmentValue(service.environment, "TUNNEL_TOKEN");
}

export function hasReverseProxyRoutingHint(service: ComposeService): boolean {
  return hasTraefikRoutingHint(service.labels) || hasCaddyRoutingHint(service) || hasEnvironmentRoutingHint(service.environment);
}

export function hasTraefikRoutingHint(labels: Record<string, string>): boolean {
  return Object.entries(labels).some(([key, value]) => {
    const normalizedKey = key.toLowerCase();
    const normalizedValue = value.toLowerCase();

    if (normalizedKey === "traefik.enable") {
      return normalizedValue === "true";
    }

    return (
      normalizedKey.startsWith("traefik.http.routers.") ||
      normalizedKey.startsWith("traefik.http.services.") ||
      normalizedKey.startsWith("traefik.http.middlewares.")
    );
  });
}

export function hasCaddyRoutingHint(service: ComposeService): boolean {
  if (hasNonEmptyEnvironmentValue(service.environment, "CADDY_HOST")) {
    return true;
  }

  return Object.entries(service.labels).some(([key, value]) => {
    const normalizedKey = key.toLowerCase();
    const normalizedValue = value.toLowerCase();
    const entry = `${normalizedKey}=${normalizedValue}`;

    if (normalizedKey === "caddy" && normalizedValue.trim().length > 0) {
      return true;
    }

    if (normalizedKey.startsWith("caddy.")) {
      return true;
    }

    if (normalizedKey.startsWith("caddy_")) {
      return true;
    }

    return entry.includes("caddy") && (entry.includes("host") || entry.includes("reverse_proxy"));
  });
}

export function hasCaddyConfigHint(service: ComposeService): boolean {
  return normalizeRawList(service.raw.volumes).some((volume) => {
    const normalized = volume.toLowerCase();
    return normalized.includes("caddyfile") || normalized.includes("/etc/caddy");
  });
}

function hasEnvironmentRoutingHint(environment: Record<string, string>): boolean {
  return ROUTING_ENV_HINTS.some((key) => {
    const value = environment[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

function hasNonEmptyEnvironmentValue(environment: Record<string, string>, key: string): boolean {
  const value = environment[key];
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeRawValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(String).join(" ");
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function normalizeRawList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}

function tokenize(value: string): string[] {
  return value.split(/[^a-z0-9]+/).filter(Boolean);
}
