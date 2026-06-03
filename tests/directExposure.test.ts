import { describe, expect, it } from "vitest";
import { getBroadlyBoundPorts, hasDirectExposure } from "../src/rules/directExposure.js";
import { parsePortMappings } from "../src/rules/ports.js";

describe("direct exposure detection", () => {
  it("detects broad short syntax", () => {
    const ports = parsePortMappings(["443:443"]);

    expect(hasDirectExposure(ports)).toBe(true);
    expect(getBroadlyBoundPorts(ports)).toHaveLength(1);
  });

  it("detects explicit 0.0.0.0 bindings as broad", () => {
    const ports = parsePortMappings(["0.0.0.0:6379:6379"]);

    expect(hasDirectExposure(ports)).toBe(true);
  });

  it("does not flag localhost-bound ports as broad host bindings", () => {
    const ports = parsePortMappings(["127.0.0.1:5432:5432"]);

    expect(hasDirectExposure(ports)).toBe(false);
  });
});
