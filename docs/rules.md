# Exposure Rules

ExposeMap is a local, read-only Docker Compose review tool.

The rules below explain how the MVP classifies services and creates findings from Compose configuration. These are configuration-based hints, not proof of real internet reachability.

## Classifications

ExposeMap currently uses three classifications.

| Classification | Meaning | Important limit |
| --- | --- | --- |
| `published` | The service has at least one host-published Compose port. | This means host-published in Compose, not internet-reachable. |
| `internal` | The service has no host-published Compose ports and no reverse proxy routing hint. | This does not prove the service is impossible to reach. |
| `unknown` | ExposeMap cannot safely classify the service from Compose alone. | Manual review is needed. |

## Port Parsing

ExposeMap parses common short and long Docker Compose `ports` syntax.

Short syntax examples:

```yaml
services:
  web:
    ports:
      - "8080:80"
      - "127.0.0.1:8081:80"
      - "8443:443/tcp"
```

Long syntax example:

```yaml
services:
  api:
    ports:
      - target: 3000
        published: 3000
        protocol: tcp
```

If a service has parseable `ports`, ExposeMap classifies it as `published`.

If a service has a port entry that cannot be parsed safely, ExposeMap classifies it as `unknown` and emits an `unknown-port-syntax` finding.

Examples that may need expanded Compose config:

```yaml
services:
  web:
    ports:
      - "${WEB_PORT}:80"
```

## Localhost Bindings

ExposeMap detects these localhost bindings:

- `127.0.0.1`
- `localhost`
- `::1`

Example:

```yaml
services:
  admin:
    ports:
      - "127.0.0.1:8080:80"
```

This is still classified as `published` because it is host-published in Compose.

The report adds a note that the host binding is local. ExposeMap does not verify firewall rules, host routing, VPNs, tunnels, or real-world reachability.

## Internal Services

A service is classified as `internal` when ExposeMap finds no host-published Compose ports and no reverse proxy routing hint.

Examples:

```yaml
services:
  api:
    expose:
      - "3000"

  db:
    image: postgres:16
```

`internal` means no host-published Compose ports were found. It does not prove the service is impossible to reach.

## Reverse Proxy Hints

Reverse proxy behavior is note-only in the MVP.

ExposeMap detects likely reverse proxy services from service names or images containing common proxy keywords such as:

- `traefik`
- `caddy`
- `nginx`
- `nginx-proxy-manager`
- `haproxy`
- `swag`
- `letsencrypt`

ExposeMap also detects routing hints from labels and environment variables, including:

- Traefik router, service, middleware labels
- `traefik.enable=true`
- Caddy-like labels containing `caddy` with `host` or `reverse_proxy`
- `VIRTUAL_HOST`
- `LETSENCRYPT_HOST`
- `CADDY_HOST`

Example:

```yaml
services:
  app:
    image: example/app
    labels:
      traefik.enable: "true"
      traefik.http.routers.app.rule: Host(`app.example.test`)
```

Services with routing hints are classified as `unknown` because Compose labels alone do not prove the real proxy route.

If ExposeMap finds a likely reverse proxy service but no routed services, it emits a `reverse-proxy-routes-unclear` finding.

## Risky Host-Published Ports

ExposeMap emits high-severity findings for host-published Compose ports commonly associated with databases, caches, search backends, or admin panels.

Current risky targets include:

| Name | Ports |
| --- | --- |
| PostgreSQL | `5432` |
| MySQL / MariaDB | `3306` |
| Redis | `6379` |
| MongoDB | `27017` |
| Elasticsearch / OpenSearch | `9200` |
| Admin or web panel | `8080`, `9090`, `3000` |

Example:

```yaml
services:
  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

This produces a `risky-direct-port` finding.

This is not a vulnerability finding. Real reachability still depends on firewall, VPN, proxy, DNS, cloud security group, host rules, and runtime state.

## Finding Severities

| Severity | Used for | Meaning |
| --- | --- | --- |
| `high` | Risky host-published service ports | Review whether the host-published port is intentional. |
| `medium` | Unknown exposure or unclear reverse proxy routes | Manual review is needed. |
| `low` | Internal service notes | Confirm the intended access path. |

## Known Limits

ExposeMap does not:

- scan networks
- connect to containers
- inspect secrets
- verify firewall rules
- verify DNS, VPNs, tunnels, or cloud security groups
- prove internet reachability
- replace a security audit

Some Compose features may require expanded Compose config before review:

- profiles
- extends
- include
- anchors
- merge keys
- variable interpolation

## Opening Issues

Useful issues include:

- incorrect `published` / `internal` / `unknown` classifications
- parser edge cases
- unclear report wording
- Docker or CI usage problems
- sanitized Compose examples that ExposeMap should handle better

Do not paste private Compose files, `.env` files, credentials, private domains, internal hostnames, customer names, or sensitive infrastructure details into public issues.

If your stack is intended to be reachable only through Tailscale, also review [tailscale-checklist.md](tailscale-checklist.md). ExposeMap does not verify Tailscale ACLs, MagicDNS, subnet routes, device state, or live access.
