import { describe, expect, it } from "vitest";
import { parseComposeContent } from "../src/parser.js";
import { renderHtmlReport } from "../src/report/html.js";
import { analyzeProject } from "../src/rules/serviceClassifier.js";

describe("HTML report output", () => {
  it("renders a self-contained static report with summary, findings, details, and Mermaid source", () => {
    const report = analyzeProject(
      parseComposeContent(
        `
services:
  web:
    image: nginx
    ports:
      - "8080:80"
  app:
    image: example/app
    labels:
      traefik.enable: "true"
      traefik.http.routers.app.rule: Host(\`app.example.test\`)
  worker:
    image: example/worker
`,
        "<compose.yml>"
      )
    );

    const output = renderHtmlReport(report);

    expect(output).toContain("<!doctype html>");
    expect(output).toContain("<h1>ExposeMap Report</h1>");
    expect(output).toContain("Summary");
    expect(output).toContain("Compose Visibility Summary");
    expect(output).toContain("Review Notes");
    expect(output).toContain("Service Details");
    expect(output).toContain("Mermaid Diagram");
    expect(output).toContain("web");
    expect(output).toContain("published");
    expect(output).toContain("app");
    expect(output).toContain("unknown");
    expect(output).toContain("graph TD");
    expect(output).toContain("&lt;compose.yml&gt;");
    expect(output).toContain("published means host-published in Compose, not internet-reachable.");
    expect(output).toContain("No external JavaScript is loaded by this report.");
    expect(output).not.toContain("<script");
    expect(output).not.toContain("</compose.yml>");
  });
});
