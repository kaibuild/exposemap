import { describe, expect, it } from "vitest";
import { parseComposeContent } from "../src/parser.js";
import { analyzeProject } from "../src/rules/serviceClassifier.js";

describe("service classification", () => {
  it("classifies services into MVP looks-like values only", () => {
    const project = parseComposeContent(`
services:
  web:
    image: nginx
    ports:
      - "80:80"
  admin:
    image: adminer
    ports:
      - "127.0.0.1:8080:8080"
  app:
    image: app
    labels:
      traefik.enable: "true"
      traefik.http.routers.app.rule: Host(\`app.example.test\`)
  worker:
    image: worker
  api:
    image: api
    expose:
      - "3000"
  odd:
    image: odd
    ports:
      - "\${HOST_PORT}:80"
`);

    const report = analyzeProject(project);
    const classifications = Object.fromEntries(
      report.services.map((service) => [service.service.name, service.classification])
    );

    expect(classifications).toEqual({
      web: "published",
      admin: "published",
      app: "unknown",
      worker: "internal",
      api: "internal",
      odd: "unknown"
    });

    const admin = report.services.find((service) => service.service.name === "admin");
    const app = report.services.find((service) => service.service.name === "app");
    const api = report.services.find((service) => service.service.name === "api");

    expect(admin?.why).toBe("ports: 127.0.0.1:8080:8080");
    expect(app?.why).toBe("proxy labels detected; note only in MVP");
    expect(api?.why).toBe("expose only: 3000");
  });
});
