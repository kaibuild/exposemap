import { describe, expect, it } from "vitest";
import { parseComposeContent } from "../src/parser.js";
import { buildJsonReport, renderJsonReport } from "../src/report/json.js";
import { analyzeProject } from "../src/rules/serviceClassifier.js";
import { getToolVersion } from "../src/version.js";

describe("JSON report output", () => {
  it("renders a structured CI-friendly report", () => {
    const report = analyzeProject(
      parseComposeContent(
        `
services:
  traefik:
    image: traefik:v3
    ports:
      - "80:80"
  app:
    image: ghcr.io/example/app:latest
    labels:
      traefik.enable: "true"
      traefik.http.routers.app.rule: Host(\`app.example.test\`)
    depends_on:
      - db
  db:
    image: postgres:16
    ports:
      - "5432:5432"
  admin:
    image: adminer:latest
    ports:
      - "127.0.0.1:8080:8080"
  worker:
    image: ghcr.io/example/worker:latest
  tunnel:
    image: cloudflare/cloudflared:latest
  caddy:
    image: caddy:2
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
`,
        "compose.yml"
      )
    );

    const json = buildJsonReport(report);

    expect(json.tool.name).toBe("ExposeMap");
    expect(json.tool.version).toBe(getToolVersion());
    expect(json.scannedFilePath).toBe("compose.yml");
    expect(Date.parse(json.generatedAt)).not.toBeNaN();
    expect(json.disclaimers).toEqual(
      expect.arrayContaining([
        "published means host-published in Compose, not internet-reachable.",
        "internal means no host-published ports found, not impossible to reach.",
        "Some Compose features, such as profiles, extends, include, anchors, merge keys, or variable interpolation, may require expanded Compose config for safer review."
      ])
    );
    expect(json.summary).toMatchObject({
      totalServices: 7,
      internal: 2,
      published: 3,
      unknown: 2,
      totalFindings: 4,
      high: 0,
      medium: 2,
      low: 2
    });
    expect(json.services.find((service) => service.name === "app")).toMatchObject({
      classification: "unknown",
      why: "proxy labels detected; note only in MVP",
      labels: {
        "traefik.enable": "true"
      },
      evidence: expect.arrayContaining(["proxy labels detected; note only in MVP"])
    });
    expect(json.exposureMap).toContainEqual(
      expect.objectContaining({
        service: "db",
        classification: "published",
        entrypoints: ["host-published-in-compose"],
        evidence: ["5432:5432"]
      })
    );
    expect(json.services.find((service) => service.name === "tunnel")).toMatchObject({
      classification: "unknown",
      why: "cloudflared tunnel detected; routes may live outside Compose",
      evidence: expect.arrayContaining(["cloudflared tunnel detected; routes may live outside Compose"])
    });
    expect(json.services.find((service) => service.name === "caddy")).toMatchObject({
      classification: "internal",
      evidence: expect.arrayContaining([
        "likely Caddy service detected",
        "Caddyfile or /etc/caddy mount detected; Caddyfile contents are not parsed"
      ]),
      notes: expect.arrayContaining(["Caddy routes may live in mounted Caddyfiles; ExposeMap does not parse Caddyfile contents."])
    });
    expect(json.findings.some((finding) => finding.ruleId === "risky-direct-port")).toBe(false);
    expect(json.mermaid).toContain("graph TD");
  });

  it("renders parseable JSON text", () => {
    const report = analyzeProject(
      parseComposeContent(
        `
services:
  app:
    image: nginx
`,
        "compose.yml"
      )
    );

    const parsed = JSON.parse(renderJsonReport(report));

    expect(parsed.tool.name).toBe("ExposeMap");
    expect(parsed.disclaimers).toContain("published means host-published in Compose, not internet-reachable.");
    expect(parsed.summary.totalServices).toBe(1);
  });
});
