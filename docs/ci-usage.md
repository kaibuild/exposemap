# CI Usage

ExposeMap can run in CI as a lightweight Docker Compose configuration review step. It remains local, read-only, and Compose-based.

ExposeMap does not prove real internet exposure, does not perform real network scans, does not connect to containers, and does not send `docker-compose.yml` files or reports anywhere.

## Local Usage

```bash
npm install
npm run build
node dist/cli.js scan ./docker-compose.yml --format table
```

Table output is the default:

```bash
node dist/cli.js scan ./docker-compose.yml
```

## Docker Usage

```bash
docker build -t exposemap .
docker run --rm -v $(pwd):/scan exposemap scan /scan/docker-compose.yml --format table
```

JSON output with a CI threshold:

```bash
docker run --rm -v $(pwd):/scan exposemap scan /scan/docker-compose.yml --format json --fail-on high
```

## JSON Output

Use JSON when a CI job, script, or later reporting step needs structured data:

```bash
node dist/cli.js scan ./docker-compose.yml --format json
```

The JSON report includes:

- tool name and version
- scanned file path
- generated timestamp
- disclaimers for local-only, configuration-only review
- summary counts
- services
- exposure map entries
- findings
- Mermaid diagram string

## Fail-on Thresholds

`--fail-on` controls whether ExposeMap exits non-zero after a successful scan.

```bash
node dist/cli.js scan ./docker-compose.yml --fail-on high
node dist/cli.js scan ./docker-compose.yml --format json --fail-on medium
```

Supported values:

- `none` - always exit `0` unless CLI usage or parsing fails
- `high` - exit `1` if any high finding exists
- `medium` - exit `1` if any medium or high finding exists
- `low` - exit `1` if any low, medium, or high finding exists

The default is `none` for backward compatibility.

## Exit Codes

- `0` - scan completed and the `--fail-on` threshold was not violated
- `1` - scan failed, or scan completed and the `--fail-on` threshold was violated
- `2` - invalid CLI usage or unsupported options

## GitHub Actions Example

See [github-actions-example.yml](github-actions-example.yml).

The example installs dependencies, builds ExposeMap, and runs table and JSON scans. Use `--fail-on` only after your team has agreed how to treat review notes in CI.

## Recommended Usage for Self-hosted Projects

- Start with `--fail-on none` and review the report manually.
- Move to stricter `--fail-on` settings only after the output is understood.
- Use JSON output for artifacts, pull request summaries, or later automation.
- Keep Compose snippets in public issues sanitized.
- Review ExposeMap notes alongside firewall rules, reverse proxy config, VPN setup, DNS, and host-level controls.
- If your Compose setup uses profiles, extends, include, anchors, merge keys, or variable interpolation, consider reviewing an expanded Compose config too.
