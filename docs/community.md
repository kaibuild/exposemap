# Community and Issue Guide

ExposeMap is early and intentionally small. The best way to help right now is to make the Docker Compose review behavior clearer, safer, and easier to trust from public examples.

## Current Community Home

Use GitHub issues for:

- incorrect or confusing classifications
- parser edge cases
- reverse proxy labels or Compose patterns ExposeMap should treat as note-only context
- documentation gaps
- Docker or CI usage problems
- small contribution ideas

Do not use public issues for private setup reviews, urgent security help, paid support requests, or sharing sensitive infrastructure details.

## Before Opening an Issue

1. Run the latest version from the repository.
2. Check whether the behavior is already listed in `README.md` or `docs/ci-usage.md`.
3. Reduce the case to the smallest sanitized Compose snippet.
4. Remove secrets, tokens, credentials, private domains, internal hostnames, private IP details, customer names, and private file paths.
5. Include the exact command you ran and the output you expected.

## Good First Issue Areas

Good first issues should be small, reproducible, and safe for a new contributor to work on without needing private infrastructure.

Good first areas include:

- docs wording improvements
- sanitized Compose examples
- parser edge cases with a small fixture
- note-only reverse proxy label hints
- report wording and Markdown formatting
- tests for an existing rule
- CI and Docker usage documentation

Avoid good first issues that require live infrastructure, external scanning, private Compose files, credentials, hosted services, authentication, or customer-specific context.

## Privacy and Safety Rules

ExposeMap is a local, read-only Compose review tool. Public issues should follow the same boundary.

Do not post:

- `.env` files
- API keys, tokens, passwords, certificates, or cookies
- private Compose files
- private domains or internal hostnames
- IP addresses that identify private infrastructure
- customer names, account IDs, or deployment details
- screenshots that show sensitive service names or URLs

If a real setup triggered the issue, replace names and values with neutral placeholders before posting.

## What ExposeMap Can and Cannot Confirm

ExposeMap can show whether a service looks `published`, `internal`, or `unknown` from a Docker Compose file.

published means host-published in Compose, not internet-reachable.
internal means no host-published ports found, not impossible to reach.

ExposeMap cannot prove real internet reachability. Firewalls, DNS, VPNs, tunnels, cloud security groups, reverse proxies, host rules, and runtime state can all change what is actually reachable.

## Paid Support and Setup Reviews

There is no active paid setup review, support plan, hosted dashboard, intake form, pricing page, or service promise.

Please do not send private Compose files or sensitive infrastructure details for review.
