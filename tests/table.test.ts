import { describe, expect, it } from "vitest";
import { parseComposeContent } from "../src/parser.js";
import { renderTableReport } from "../src/report/table.js";
import { analyzeProject } from "../src/rules/serviceClassifier.js";

describe("table report output", () => {
  it("renders MVP looks-like values and fixed safety copy", () => {
    const report = analyzeProject(
      parseComposeContent(
        `
services:
  web:
    image: nginx
    ports:
      - "8080:80"
  api:
    image: node
    expose:
      - "3000"
  admin:
    image: admin
    ports:
      - "127.0.0.1:8080:80"
  proxyish:
    image: app
    labels:
      traefik.enable: "true"
  odd:
    image: alpine
    ports:
      - "\${HOST_PORT}:80"
`,
        "compose.yml"
      )
    );

    const output = renderTableReport(report);

    expect(output).toContain("Service");
    expect(output).toContain("Looks like");
    expect(output).toContain("web        published");
    expect(output).toContain("api        internal");
    expect(output).toContain("admin      published");
    expect(output).toContain("proxyish   unknown");
    expect(output).toContain("odd        unknown");
    expect(output).toContain("published means host-published in Compose, not internet-reachable.");
    expect(output).toContain("internal means no host-published ports found, not impossible to reach.");
    expect(output).toContain("ExposeMap reads local Compose configuration only.");
    expect(output).toContain("Do not paste real Compose files or secrets into public issues.");
  });
});
