# ExposeMap

Open-source exposure map for Docker Compose self-hosters.

ExposeMap reads local Docker Compose configuration and shows first-pass, configuration-based hints about which services look host-published.

Local. Read-only. No upload.

```bash
npm install
npm run build
node dist/cli.js scan ./docker-compose.yml
```

Example output:

```text
Service   Looks like   Why
web       published    ports: 8080:80
api       internal     expose only: 3000
db        internal     no host-published ports
admin     published    ports: 127.0.0.1:8080:80
proxyish  unknown      proxy labels detected; note only in MVP

published means host-published in Compose, not internet-reachable.
internal means no host-published ports found, not impossible to reach.
```

ExposeMap reads local Compose configuration only.
It does not test live reachability, firewall, DNS, VPN, tunnels, cloud security groups, or vulnerabilities.
Do not paste real Compose files or secrets into public issues. Use sanitized examples only.

## What ExposeMap Is

ExposeMap is a lightweight, read-only configuration review tool for self-hosters, homelab users, small teams, and developers running Docker Compose.

It parses Compose files and prints a small map of what looks:

- `published`
- `internal`
- `unknown`

These are first-pass Compose configuration hints. They are not external reachability claims.

## Why ExposeMap Exists

Self-hosted stacks grow over time. After enough Compose edits, reverse proxy experiments, admin tools, databases, VPNs, and tunnels, it becomes hard to answer a simple question:

Which services look host-published from this Compose file?

ExposeMap makes that first-pass map visible without uploading the Compose file anywhere.

## What It Checks

- Docker Compose services
- `services.*.ports`
- `services.*.expose`
- `services.*.networks`
- Optional labels as note-only context

## What It Does Not Check

- It does not scan the network.
- It does not connect to containers.
- It does not inspect secrets.
- It does not verify firewall rules.
- It does not verify DNS, VPNs, tunnels, or cloud security groups.
- It does not prove internet reachability.
- It is not a vulnerability scanner.

## Classification

### `published`

The service has host-published Compose ports.

Examples:

- `8080:80`
- `127.0.0.1:8080:80`
- long syntax with `published`

`published` means host-published in Compose, not internet-reachable.

### `internal`

The service has no host-published Compose ports.

Examples:

- `expose` only
- no `ports`
- attached to service networks without host-published ports

`internal` means no host-published ports found, not impossible to reach.

### `unknown`

ExposeMap could not safely classify the service from the Compose file alone.

Examples:

- unsupported ports syntax
- variable interpolation that needs expanded Compose config
- reverse proxy labels, which are note-only in the MVP

## Quick Start

```bash
npm install
npm run build
node dist/cli.js scan ./docker-compose.yml
```

Table output is the default:

```bash
node dist/cli.js scan ./docker-compose.yml --format table
```

Markdown and JSON are also available:

```bash
node dist/cli.js scan ./docker-compose.yml --format markdown
node dist/cli.js scan ./docker-compose.yml --format json
```

If you install this repo as a local package, the bin name is:

```bash
exposemap scan ./docker-compose.yml --format table
```

## Exit Codes

- `0` - scan completed and the `--fail-on` threshold was not violated
- `1` - scan failed, or scan completed and the `--fail-on` threshold was violated
- `2` - invalid CLI usage or unsupported options

The default `--fail-on` value is `none`.

## Run With Docker

```bash
docker build -t exposemap .
docker run --rm -v $(pwd):/scan exposemap scan /scan/docker-compose.yml --format table
```

## CI Usage

ExposeMap can run in CI as a lightweight Compose configuration review step. It runs locally in the job, does not send Compose files or reports anywhere, and does not perform live network scans.

See [docs/ci-usage.md](docs/ci-usage.md) for local, Docker, JSON, and `--fail-on` examples.

## Example Report

See [examples/report.md](examples/report.md) for a generated sample.

## FAQ

### Does ExposeMap prove that a service is reachable from the internet?

No. ExposeMap reviews Docker Compose configuration and reports host-published hints based on that file. Firewalls, VPNs, tunnels, DNS, cloud security groups, host rules, reverse proxies, and runtime state can all change real-world reachability.

### Does ExposeMap upload my Compose file or report?

No. ExposeMap runs locally and does not upload Compose files, generated reports, service names, labels, secrets, or infrastructure details.

### Does ExposeMap inspect secrets or connect to containers?

No. It does not connect to containers, read running container state, inspect secret values, or modify infrastructure.

### Is this a vulnerability scanner?

No. ExposeMap is a first-pass configuration review tool. It does not replace external scanning, firewall review, threat modeling, or a security audit.

### Can I paste my real Compose file into an issue?

Please do not paste private Compose files, `.env` files, credentials, tokens, private domains, internal hostnames, or sensitive infrastructure details into public issues. Reduce the case to the smallest sanitized snippet that still shows the behavior.

### What kind of issues are useful right now?

Useful issues include parser edge cases, incorrect `published` / `internal` / `unknown` classifications, unclear report wording, Docker usage problems, CI usage problems, and sanitized Compose examples that ExposeMap should handle better.

See [docs/community.md](docs/community.md) for issue and contribution guidance.

## Current Limitations

- No real network scanning
- No Kubernetes support
- No Cloudflare Tunnel API integration
- No Tailscale API integration
- No hosted dashboard
- Results are heuristic checks based on Docker Compose configuration
- Reverse proxy, firewall, VPN, DNS, cloud security group, and host-level rules can change real exposure

ExposeMap does not prove real internet exposure. It does not replace a full security review, external exposure scan, firewall review, or threat model.

## Roadmap

- Better reverse proxy label support
- HTML report output
- Caddy config support
- Nginx Proxy Manager support
- Cloudflare Tunnel hints
- Tailscale checklist
- External scan integration, opt-in only
- Hosted dashboard

## Contributing

Contributions are welcome. Good first areas include parser edge cases, report output, docs, and sanitized Compose examples.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

## Community

For now, GitHub issues are the best place to share sanitized examples, edge cases, and ideas.

Read [docs/community.md](docs/community.md) before opening an issue.

Issue templates are available for [bug reports](.github/ISSUE_TEMPLATE/bug_report.md), [feature requests](.github/ISSUE_TEMPLATE/feature_request.md), [questions](.github/ISSUE_TEMPLATE/question.md), and [good first issue ideas](.github/ISSUE_TEMPLATE/good_first_issue.md).

## Future Notes

ExposeMap is free and open source.

The open-source CLI is the core product: local table output, Markdown reports, JSON output, Docker usage, CI usage, and Mermaid diagrams should remain useful without any paid service.

A hosted dashboard, setup review intake, pricing page, paid support plan, or service promise is not available. Future options may be considered later only if the OSS project shows clear demand.

## License

ExposeMap is licensed under AGPLv3. See [LICENSE](LICENSE).
