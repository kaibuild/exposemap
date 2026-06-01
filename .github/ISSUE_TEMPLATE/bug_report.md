---
name: Bug report
about: Report incorrect behavior or an unexpected error
title: ""
labels: bug
assignees: ""
---

Before posting, remove secrets, credentials, private domains, internal hostnames, customer names, private IP details, and sensitive infrastructure details. ExposeMap only reviews Compose configuration and does not prove real internet reachability.

## Environment

- OS:
- Node.js version:
- ExposeMap version or commit:
- Docker version, if relevant:

## Command Run

```bash
node dist/cli.js scan ./docker-compose.yml --format markdown
```

## Expected Behavior

What did you expect ExposeMap to report?

## Actual Behavior

What happened instead?

## Compose Snippet Without Secrets

Please include the smallest sanitized Compose snippet that reproduces the issue. Do not paste a full private Compose file.

```yaml
services:
  app:
    image: example/app
```

## Classification Context, If Relevant

- Which service was classified unexpectedly?
- What classification did ExposeMap report?
- What classification did you expect?
- Which Compose field, port mapping, or label seems relevant?

## Logs Without Secrets

Do not include tokens, credentials, private domains, secrets, or sensitive infrastructure details. Redact them before posting.

```text
Paste relevant logs here.
```
