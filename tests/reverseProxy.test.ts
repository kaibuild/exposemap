import { describe, expect, it } from "vitest";
import {
  hasCaddyConfigHint,
  hasCaddyRoutingHint,
  hasReverseProxyRoutingHint,
  isLikelyCloudflareTunnelService,
  isLikelyCaddyService,
  isLikelyReverseProxyService
} from "../src/rules/reverseProxy.js";
import type { ComposeService } from "../src/types.js";

describe("reverse proxy detection", () => {
  it("detects likely reverse proxy services by image", () => {
    expect(isLikelyReverseProxyService(service({ name: "proxy", image: "traefik:v3" }))).toBe(true);
    expect(isLikelyReverseProxyService(service({ name: "caddy", image: "caddy:2" }))).toBe(true);
  });

  it("detects Traefik routing labels", () => {
    expect(
      hasReverseProxyRoutingHint(
        service({
          labels: {
            "traefik.enable": "true",
            "traefik.http.routers.app.rule": "Host(`app.example.test`)"
          }
        })
      )
    ).toBe(true);
  });

  it("detects environment routing hints", () => {
    expect(
      hasReverseProxyRoutingHint(
        service({
          environment: {
            VIRTUAL_HOST: "app.example.test"
          }
        })
      )
    ).toBe(true);
  });

  it("detects Caddy services and Caddy routing hints without parsing Caddyfiles", () => {
    expect(isLikelyCaddyService(service({ name: "proxy", image: "caddy:2" }))).toBe(true);
    expect(
      isLikelyCaddyService(
        service({
          name: "proxy",
          image: "example/proxy",
          raw: {
            volumes: ["./Caddyfile:/etc/caddy/Caddyfile:ro"]
          }
        })
      )
    ).toBe(true);
    expect(
      isLikelyReverseProxyService(
        service({
          name: "proxy",
          image: "example/proxy",
          raw: {
            volumes: ["./Caddyfile:/etc/caddy/Caddyfile:ro"]
          }
        })
      )
    ).toBe(true);
    expect(
      hasCaddyConfigHint(
        service({
          raw: {
            volumes: ["./Caddyfile:/etc/caddy/Caddyfile:ro"]
          }
        })
      )
    ).toBe(true);
    expect(
      hasCaddyRoutingHint(
        service({
          labels: {
            caddy: "app.example.test",
            "caddy.reverse_proxy": "{{upstreams 3000}}"
          }
        })
      )
    ).toBe(true);
    expect(
      hasCaddyRoutingHint(
        service({
          environment: {
            CADDY_HOST: "app.example.test"
          }
        })
      )
    ).toBe(true);
  });

  it("detects likely Cloudflare Tunnel services without calling external APIs", () => {
    expect(isLikelyCloudflareTunnelService(service({ name: "cloudflared", image: "cloudflare/cloudflared:latest" }))).toBe(true);
    expect(
      isLikelyCloudflareTunnelService(
        service({
          name: "tunnel",
          image: "example/runner",
          raw: {
            command: ["cloudflared", "tunnel", "run"]
          }
        })
      )
    ).toBe(true);
    expect(
      isLikelyCloudflareTunnelService(
        service({
          environment: {
            TUNNEL_TOKEN: "placeholder"
          }
        })
      )
    ).toBe(true);
    expect(isLikelyCloudflareTunnelService(service({ name: "worker", image: "example/worker" }))).toBe(false);
  });
});

function service(input: Partial<ComposeService>): ComposeService {
  return {
    name: "app",
    ports: [],
    labels: {},
    environment: {},
    dependsOn: [],
    raw: {},
    ...input
  };
}
