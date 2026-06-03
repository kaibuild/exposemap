import { describe, expect, it } from "vitest";
import { getLocalhostBindings, hasOnlyLocalhostBindings } from "../src/rules/localhostBindings.js";
import { parsePortMappings } from "../src/rules/ports.js";

describe("localhost binding detection", () => {
  it("detects localhost-bound ports", () => {
    const ports = parsePortMappings(["127.0.0.1:8080:8080", "localhost:3000:3000"]);

    expect(getLocalhostBindings(ports)).toHaveLength(2);
    expect(hasOnlyLocalhostBindings(ports)).toBe(true);
  });

  it("does not treat broad bindings as localhost-bound only", () => {
    const ports = parsePortMappings(["127.0.0.1:8080:8080", "80:80"]);

    expect(hasOnlyLocalhostBindings(ports)).toBe(false);
  });
});
