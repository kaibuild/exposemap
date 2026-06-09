# Sanitized Tunnel and Tailnet Notes

ExposeMap does not inspect live tunnel configuration, but Compose files often
contain clues that a service may be reachable through a tunnel or private tailnet.
This guide explains how to document those clues without exposing real hostnames,
tokens, or private topology.

## What To Sanitize

Before sharing examples publicly, replace:

- real tunnel IDs
- private domains
- tailnet names
- auth tokens and cert paths
- real internal IP addresses

Keep only the structural clues needed for discussion.

## Safe Cloudflare Tunnel Example

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=redacted-token

  app:
    image: ghcr.io/example/app:latest
    expose:
      - "8080"
```

How to interpret it:

- `app` is still `internal` from Compose alone because it has no host-published port.
- `cloudflared` is a tunnel hint, not proof of a public route.
- Reviewers should inspect external tunnel config separately before making exposure claims.

## Safe Tailnet / Sidecar Example

```yaml
services:
  ts-sidecar:
    image: tailscale/tailscale:latest
    environment:
      - TS_AUTHKEY=redacted

  admin:
    image: ghcr.io/example/admin:latest
    expose:
      - "9000"
```

How to interpret it:

- `admin` still looks `internal` from Compose.
- a Tailnet sidecar suggests private-network reachability may exist outside the file
- ExposeMap should treat that as context for manual review, not as a live-route fact

## Recommended Review Wording

Prefer wording like:

- "tunnel service detected"
- "tailnet sidecar detected"
- "manual route review required"

Avoid wording like:

- "internet-exposed"
- "definitely reachable"
- "publicly accessible"

Those stronger claims require runtime validation outside Compose.
