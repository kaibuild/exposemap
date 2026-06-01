# How to see what your self-hosted Docker Compose stack exposes

GitHub link: https://github.com/kaibuild/exposemap

## Why exposure is hard to reason about in self-hosted stacks

Self-hosted Docker Compose setups usually start simple. One app, one database, maybe a reverse proxy. Over time, the stack grows: admin panels, dashboards, caches, search backends, VPNs, tunnels, and old experiments that still have port mappings.

At some point, it becomes hard to answer a basic question: which services are reachable, and how?

Docker Compose makes this especially easy to lose track of because exposure can be implied by small details:

- `5432:5432` publishes PostgreSQL broadly unless host-level controls say otherwise.
- `127.0.0.1:5432:5432` is very different.
- A service with no `ports` entry may still be routed by a reverse proxy.
- A reverse proxy may expose only intended apps, or it may hide complexity in labels, mounted config, or external state.

## Mistake 1: Directly exposing databases

A common self-hosting mistake is leaving a database port mapped to the host:

```yaml
services:
  postgres:
    image: postgres:16
    ports:
      - "5432:5432"
```

This does not automatically mean the database is reachable from the internet. Firewalls, cloud security groups, VPNs, and host configuration matter. But it is still a strong signal that the setup deserves review.

For many setups, the safer default is to remove the host port mapping or bind it to localhost:

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

## Mistake 2: Confusing localhost-only with public bindings

These two Compose snippets look similar, but they have very different intent:

```yaml
ports:
  - "8080:8080"
```

```yaml
ports:
  - "127.0.0.1:8080:8080"
```

The first publishes a host port broadly. The second binds to localhost. That distinction is easy to miss during reviews, especially in larger files.

## Mistake 3: Assuming reverse proxy means everything is safe

Reverse proxies are useful, but the phrase "behind a reverse proxy" can hide a lot of assumptions.

Some services are routed through Traefik labels. Some are configured through Caddyfiles or Nginx files mounted into a container. Some use Nginx Proxy Manager state that is not visible in Compose. Some are exposed directly and proxied at the same time.

Compose alone cannot prove the real exposure path, but it can show useful hints and contradictions.

## Mistake 4: Losing track of admin panels

Admin tools often use ports such as `8080`, `9090`, or `3000`. Those ports are not always dangerous, but they are worth checking when they are broadly published.

Examples include database UIs, monitoring dashboards, container dashboards, internal tools, and temporary debugging interfaces.

## Mistake 5: Not documenting exposure paths

Even when the setup is correct, it helps to document why:

- Which service is intentionally public?
- Which service is only reachable through localhost?
- Which service is reachable through a VPN?
- Which service is routed through a reverse proxy?
- Which services should never be directly exposed?

Small exposure maps reduce future confusion.

## Why I built ExposeMap

I built ExposeMap as a small open-source CLI for this first-pass review.

It scans a `docker-compose.yml` file and classifies services as:

- internal
- localhost-only
- directly exposed
- reverse-proxy exposed
- unknown

It generates a Markdown report with:

- a summary table
- high-risk findings
- service details
- a Mermaid diagram
- limitations

It runs locally, does not modify Compose files, does not connect to containers, does not send reports anywhere, and does not perform real network scans.

That last point matters: ExposeMap is not a full security audit and does not prove internet exposure. It is a lightweight configuration review tool based on Compose heuristics.

## What might come next

The CLI is free and open source. Longer term, scheduled exposure checks, scan history, exposure diffs, and alerts when new services appear exposed may be worth exploring.

That would still be separate from real external exposure testing. The current tool remains local, read-only, and Compose-based.

GitHub: https://github.com/kaibuild/exposemap
