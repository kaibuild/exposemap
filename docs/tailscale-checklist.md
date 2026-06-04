# Tailscale Review Checklist

ExposeMap reads local Docker Compose configuration only.

Many self-hosted services are intentionally reachable only through a Tailscale tailnet. Compose can show host-published ports and service wiring, but it cannot prove whether access is limited to a tailnet.

Use this checklist when reviewing ExposeMap output for a stack that also uses Tailscale.

## What ExposeMap Can Show

ExposeMap can help you find:

- services with host-published Compose ports
- services that appear internal from Compose
- localhost-bound published ports
- reverse proxy hints that need manual review
- risky host-published database, cache, search, or admin-panel ports

These are Compose configuration hints. They are not proof of real reachability.

## What Tailscale Must Be Reviewed For

Review these outside ExposeMap:

- which users, groups, tags, and devices can reach the service
- whether ACLs allow access to the host or service port
- whether MagicDNS names point to the expected device
- whether subnet routes are advertised
- whether subnet routes are approved
- whether exit nodes change the expected access path
- whether SSH, Funnel, Serve, or other Tailscale features are enabled
- whether host firewall rules still restrict non-tailnet traffic
- whether a reverse proxy is also exposing the service outside the tailnet

Do not assume a service is tailnet-only just because the intended access path is Tailscale.

## Checklist

For each service marked `published` by ExposeMap:

1. Confirm whether the host-published port is required.
2. Check whether the port binds to `127.0.0.1`, `::1`, or a broader interface.
3. Verify the host firewall blocks non-tailnet access when the service should be tailnet-only.
4. Review Tailscale ACLs for the users, groups, tags, devices, and ports that can reach the service.
5. Check whether MagicDNS names are expected and documented.
6. Check whether subnet routes expose more hosts or ports than intended.
7. Check whether a reverse proxy, tunnel, or DNS record also exposes the service.
8. Record any assumption that ExposeMap cannot verify.

For each service marked `internal`:

1. Confirm that no host-published Compose port is needed.
2. Check whether another container, reverse proxy, or subnet route can still reach it.
3. Review whether tailnet access happens through another service in the same stack.

For each service marked `unknown`:

1. Expand Compose config if variables, profiles, anchors, or merge keys are involved.
2. Review reverse proxy labels and environment variables manually.
3. Check Tailscale ACLs, MagicDNS, subnet routes, host firewall rules, and proxy rules together.

## Safe Issue Guidance

If you open a public GitHub issue about Tailscale behavior, do not paste private ACLs, real device names, tailnet names, MagicDNS names, private domains, internal hostnames, customer names, or sensitive Compose files.

Use a minimal sanitized example instead:

```yaml
services:
  app:
    image: example/app
    ports:
      - "127.0.0.1:8080:80"
```

Good issue topics include:

- confusing wording around localhost-published services
- unclear `published` / `internal` / `unknown` classification
- missing docs for tailnet-only assumptions
- sanitized Compose examples that should produce clearer output

## Known Limit

ExposeMap does not call the Tailscale API, inspect ACLs, query MagicDNS, inspect devices, inspect routes, or verify live access. It does not prove a service is tailnet-only.
