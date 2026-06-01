# How to see what your self-hosted Docker Compose stack exposes

Self-hosted Docker Compose stacks often become difficult to reason about over time. A setup may start with one app and one database, then grow into a mix of admin panels, reverse proxies, caches, dashboards, VPNs, tunnels, and old experiments.

Eventually, a simple question becomes surprisingly hard to answer: which services are reachable, and how?

## Why exposure gets confusing

Compose exposure often depends on small details. `5432:5432` and `127.0.0.1:5432:5432` are not equivalent. A service with no `ports` entry may still be routed through Traefik. A reverse proxy may rely on mounted config or external state that is not obvious from the Compose file alone.

This does not mean Compose can prove real internet exposure. Firewalls, cloud security groups, DNS, VPNs, and host-level rules all matter. But Compose can still provide useful signals.

## Directly exposing databases

Database ports such as PostgreSQL `5432`, MySQL `3306`, Redis `6379`, MongoDB `27017`, and Elasticsearch/OpenSearch `9200` are worth reviewing carefully when they are published broadly.

```yaml
services:
  postgres:
    image: postgres:16
    ports:
      - "5432:5432"
```

For many stacks, localhost-only binding or no host port mapping is a safer default.

## Localhost-only is different from broad binding

These are easy to confuse:

```yaml
ports:
  - "8080:8080"
```

```yaml
ports:
  - "127.0.0.1:8080:8080"
```

The first publishes broadly. The second binds to localhost. In a large Compose file, this difference is easy to miss.

## Reverse proxies still need review

Reverse proxies are useful, but they are not magic. Traefik labels, Caddyfiles, Nginx Proxy Manager state, host firewall rules, and VPN routing can all affect the real exposure path.

Compose can show hints, but it cannot replace a full review.

## Why I built ExposeMap

I built ExposeMap as a small open-source CLI for self-hosted Docker Compose stacks.

It scans `docker-compose.yml` and classifies services as internal, localhost-only, directly exposed, reverse-proxy exposed, or unknown. It generates a Markdown report and a Mermaid diagram so you can quickly see likely exposure paths.

ExposeMap runs locally. It does not modify Compose files, connect to containers, send reports anywhere, or perform real network scans.

GitHub: https://github.com/kaibuild/exposemap

Technical feedback and sanitized Compose edge cases are welcome.
