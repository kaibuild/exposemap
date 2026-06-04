import { describe, expect, it } from "vitest";
import { parseComposeContent } from "../src/parser.js";
import { analyzeProject } from "../src/rules/serviceClassifier.js";

describe("Mermaid diagram generation", () => {
  it("renders readable Compose visibility groups and dependencies without internet reachability claims", () => {
    const project = parseComposeContent(`
services:
  traefik:
    image: traefik:v3
    ports:
      - "80:80"
  admin:
    image: admin
    ports:
      - "127.0.0.1:8080:80"
  web:
    image: web
    labels:
      traefik.enable: "true"
      traefik.http.routers.web.rule: Host(\`web.example.test\`)
    depends_on:
      - db
  db:
    image: postgres
  mystery:
    image: mystery
    ports:
      - "\${MYSTERY_PORT}:80"
`);

    const report = analyzeProject(project);

    expect(report.mermaid).toContain("graph TD");
    expect(report.mermaid).toContain('subgraph group_published["Host-published in Compose"]');
    expect(report.mermaid).toContain('subgraph group_local["Localhost-published in Compose"]');
    expect(report.mermaid).toContain('subgraph group_proxy["Reverse proxy hints"]');
    expect(report.mermaid).toContain('subgraph group_internal["No host-published ports found"]');
    expect(report.mermaid).toContain('subgraph group_unknown["Needs manual review"]');
    expect(report.mermaid).toContain('svc_traefik["traefik"]');
    expect(report.mermaid).toContain('svc_admin["admin"]');
    expect(report.mermaid).toContain('svc_web["web"]');
    expect(report.mermaid).toContain('svc_db["db"]');
    expect(report.mermaid).toContain('svc_mystery["mystery"]');
    expect(report.mermaid).toContain("class svc_traefik published;");
    expect(report.mermaid).toContain("class svc_admin local;");
    expect(report.mermaid).toContain("class svc_web proxy;");
    expect(report.mermaid).toContain("class svc_db internal;");
    expect(report.mermaid).toContain("class svc_mystery unknown;");
    expect(report.mermaid).toContain("svc_web -->|depends_on| svc_db");
    expect((report.mermaid.match(/\n  subgraph /g) ?? []).length).toBe(5);
    expect((report.mermaid.match(/\n  end/g) ?? []).length).toBe(5);
    expect(report.mermaid).not.toContain("Published -->");
    expect(report.mermaid).not.toContain("Unknown -.->");
    expect(report.mermaid).not.toContain("Internet");
  });
});
