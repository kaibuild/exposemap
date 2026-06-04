import { describe, expect, it } from "vitest";
import {
  hasReverseProxyRoutingHint,
  isLikelyCloudflareTunnelService,
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
