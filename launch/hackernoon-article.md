# How to see what your self-hosted Docker Compose stack exposes

Docker Compose makes self-hosting approachable, but it also makes exposure drift easy.

A stack may begin with a single app and a database. A few months later it has a reverse proxy, dashboards, admin tools, Redis, monitoring, a VPN, maybe a tunnel, and several old port mappings nobody remembers adding.

The practical question is simple: what is reachable?

## Direct database exposure

This is one of the easiest mistakes to make:

```yaml
services:
  postgres:
    image: postgres:16
    ports:
      - "5432:5432"
```

That Compose snippet does not prove public internet exposure. A firewall or cloud security group may block it. But it is a strong signal that the service should be reviewed.

The same applies to ports commonly used by Redis, MySQL/MariaDB, MongoDB, Elasticsearch/OpenSearch, and admin panels.

## Localhost-only bindings

This:

```yaml
ports:
  - "127.0.0.1:8080:8080"
```

is materially different from this:

```yaml
ports:
  - "8080:8080"
```

That distinction gets buried quickly when a Compose file grows.

## Reverse proxy assumptions

A service may have no direct `ports` entry but still be reachable through Traefik labels, a Caddyfile, Nginx config, or Nginx Proxy Manager state. Compose can show some hints, but not every source of truth.

That is why exposure mapping should be treated as documentation and review, not as a guarantee.

## Documenting the path

For each service, it helps to know whether it is:

- internal
- localhost-only
- directly exposed
- reverse-proxy exposed
- unknown

This simple classification can make future reviews much easier.

## Why I built ExposeMap

ExposeMap is an open-source CLI that scans `docker-compose.yml` and generates a Markdown exposure report with a Mermaid diagram.

It runs locally, does not send Compose files anywhere, does not connect to containers, does not modify files, and does not perform real network scans.

It is intentionally a first-pass configuration review tool, not a full security audit.

GitHub: https://github.com/kaibuild/exposemap

Technical feedback and sanitized Compose edge cases are welcome.
