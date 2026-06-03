import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import type { ComposeProject, ComposeService } from "./types.js";

export async function parseComposeFile(filePath: string): Promise<ComposeProject> {
  const content = await readFile(filePath, "utf8");
  return parseComposeContent(content, filePath);
}

export function parseComposeContent(content: string, filePath = "<memory>"): ComposeProject {
  const document = parse(content) as unknown;

  if (!isRecord(document)) {
    throw new Error("Compose file must contain a YAML object.");
  }

  if (!isRecord(document.services)) {
    throw new Error("Compose file must contain a services object.");
  }

  const services: ComposeService[] = Object.entries(document.services).map(([name, value]) => {
    if (!isRecord(value)) {
      throw new Error(`Service '${name}' must be a YAML object.`);
    }

    return {
      name,
      image: typeof value.image === "string" ? value.image : undefined,
      ports: Array.isArray(value.ports) ? value.ports : [],
      expose: normalizeList(value.expose),
      labels: normalizeKeyValueList(value.labels),
      environment: normalizeKeyValueList(value.environment),
      dependsOn: normalizeDependsOn(value.depends_on),
      raw: value
    };
  });

  return { filePath, services };
}

function normalizeList(value: unknown): unknown[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function normalizeKeyValueList(value: unknown): Record<string, string> {
  if (!value) {
    return {};
  }

  if (Array.isArray(value)) {
    return Object.fromEntries(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => {
          const equalsIndex = item.indexOf("=");
          if (equalsIndex === -1) {
            return [item, ""];
          }
          return [item.slice(0, equalsIndex), item.slice(equalsIndex + 1)];
        })
    );
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, item == null ? "" : String(item)])
    );
  }

  return {};
}

function normalizeDependsOn(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (isRecord(value)) {
    return Object.keys(value);
  }

  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
