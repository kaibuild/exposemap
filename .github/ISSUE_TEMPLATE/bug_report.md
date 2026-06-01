---
name: Bug report
about: Report incorrect behavior or an unexpected error
title: ""
labels: bug
assignees: ""
---

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

Please include the smallest sanitized Compose snippet that reproduces the issue.

```yaml
services:
  app:
    image: example/app
```

## Logs Without Secrets

Do not include tokens, credentials, private domains, secrets, or sensitive infrastructure details. Redact them before posting.

```text
Paste relevant logs here.
```
