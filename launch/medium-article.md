# Why I made a small Docker Compose exposure mapper open source

GitHub: https://github.com/kaibuild/exposemap

I built ExposeMap because self-hosted Docker Compose stacks often become hard to reason about after a few months of real use.

A Compose file may start with one app and one database. Later it has a reverse proxy, a dashboard, Redis, a monitoring service, a tunnel, a VPN, a few temporary admin panels, and old port mappings that were added during debugging and never removed.

At that point, the useful question is not dramatic:

Which services appear published, proxied, localhost-only, internal, or unclear from this Compose file?

That is the narrow problem ExposeMap tries to solve.

## Why this should be local first

Compose files can contain sensitive infrastructure details: service names, internal hostnames, labels, image names, mounted paths, ports, and sometimes secrets that should not have been committed.

For this kind of review tool, a hosted-first workflow would be the wrong default. I do not want people uploading private Compose files just to get a first-pass exposure map.

ExposeMap is intentionally local and read-only:

- it reads the Compose file you point it at
- it does not upload Compose files or reports
- it does not connect to containers
- it does not modify infrastructure
- it does not run live network scans

The output is a Markdown or JSON report you can inspect yourself, share internally, or run in CI.

## What it actually checks

ExposeMap parses Docker Compose configuration and reports exposure hints such as:

- internal
- localhost-only
- directly exposed from Compose config
- reverse-proxy exposed
- unknown

It looks at common port mappings, localhost bindings, broad host bindings, Traefik-style labels, likely reverse proxy services, and directly published database, cache, search, or admin ports that deserve review.

It also generates a Mermaid diagram so the likely exposure paths are easier to discuss in issues, pull requests, and internal reviews.

## What it does not prove

This is important: ExposeMap does not prove real internet reachability.

Firewalls, cloud security groups, VPNs, tunnels, DNS, reverse proxies, and host rules can all change what is actually reachable. A Compose file is only one source of truth.

So ExposeMap should be treated as a first-pass configuration review tool, not a security audit and not a vulnerability scanner.

The goal is to make suspicious or confusing Compose exposure hints visible enough that a human can review them.

## Why open source matters here

I made it open source because the hard part is not just code. The hard part is edge cases.

Self-hosted Compose setups vary a lot. People use different reverse proxies, different label conventions, different bind patterns, different admin tools, and different ways of separating internal and external services.

If the tool is public, people can inspect the assumptions instead of trusting a black box. They can also point out where the wording is too strong, where a classification is misleading, or where a common Compose pattern is missing.

That feedback loop is the main reason this project belongs on GitHub.

## What I would like feedback on

The most useful feedback right now is practical and specific:

- sanitized Compose examples that are classified poorly
- false positives around reverse proxy labels
- false negatives around broad port publishing
- wording that sounds too certain
- report output that would be clearer in a pull request or CI job

I am especially interested in examples that make the classification more honest, not more dramatic.

## How to try it

Clone the repo, install dependencies, build it, and run a scan against a Compose file:

```bash
npm install
npm run build
node dist/cli.js scan ./docker-compose.yml --format markdown
```

Docker usage is also supported:

```bash
docker build -t exposemap .
docker run --rm -v $(pwd):/scan exposemap scan /scan/docker-compose.yml --format markdown
```

The README includes example output, Docker usage, JSON output, CI usage, exit codes, limitations, and a roadmap.

GitHub: https://github.com/kaibuild/exposemap

If you self-host with Docker Compose and have a sanitized edge case that ExposeMap should handle better, that is the kind of feedback I am looking for.
