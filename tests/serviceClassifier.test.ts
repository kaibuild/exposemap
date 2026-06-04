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
  tunnel:
    image: cloudflare/cloudflared:latest
    command: tunnel run
  caddy:
    image: caddy:2
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
  caddyapp:
    image: example/app
    labels:
      caddy: caddyapp.example.test
      caddy.reverse_proxy: "{{upstreams 3000}}"
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
      tunnel: "unknown",
      caddy: "internal",
      caddyapp: "unknown",
      odd: "unknown"
    });

    const admin = report.services.find((service) => service.service.name === "admin");
    const app = report.services.find((service) => service.service.name === "app");
    const api = report.services.find((service) => service.service.name === "api");
    const tunnel = report.services.find((service) => service.service.name === "tunnel");
    const caddy = report.services.find((service) => service.service.name === "caddy");
    const caddyapp = report.services.find((service) => service.service.name === "caddyapp");

    expect(admin?.why).toBe("ports: 127.0.0.1:8080:8080");
    expect(app?.why).toBe("proxy labels detected; note only in MVP");
    expect(api?.why).toBe("expose only: 3000");
    expect(tunnel?.why).toBe("cloudflared tunnel detected; routes may live outside Compose");
    expect(tunnel?.notes).toContain("Cloudflare Tunnel routes may exist outside Compose; ExposeMap does not call the Cloudflare API.");
    expect(caddy?.isCaddyService).toBe(true);
    expect(caddy?.hasCaddyConfigHint).toBe(true);
    expect(caddy?.notes).toContain("Caddy routes may live in mounted Caddyfiles; ExposeMap does not parse Caddyfile contents.");
    expect(caddyapp?.why).toBe("Caddy routing hint detected; routes may live outside Compose");
    expect(caddyapp?.notes).toContain("Caddy labels and CADDY_HOST are hints only in MVP; verify the generated Caddy configuration manually.");
  });
});
