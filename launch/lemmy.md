# ExposeMap: a small CLI to map what a Docker Compose file appears to expose

I wanted a quick local way to review my own Docker Compose stacks before assuming a service was private, behind a reverse proxy, or only bound to localhost.

ExposeMap is a small open-source CLI that reads a `docker-compose.yml` file and reports exposure hints: internal, localhost-only, directly exposed from Compose config, reverse-proxy exposed, or unknown.

It generates a Markdown report and Mermaid diagram. It checks common port mappings, localhost bindings, Traefik-style labels, likely reverse proxy services, and risky directly published database/admin ports.

Important limitation: it does not prove internet reachability, run network scans, connect to containers, modify Compose files, inspect secrets, or upload anything.

GitHub: https://github.com/kaibuild/exposemap

I'm especially looking for sanitized Compose edge cases where the classification is misleading or the wording should be clearer.

## Pre-post check

Do not post until this section is completed.

- Target community name:
- Target community URL:
- Instance:
- Rules checked:
- Self-promotion allowed:
- OSS project launch allowed:
- GitHub links allowed:
- Why this post fits:
- Do-not-post conditions:
- User action needed:

Prepared Gate 6 values:

- Target community name: Selfhosted
- Target community URL: https://lemmy.world/c/selfhosted
- Instance: Lemmy.World
- Rules checked:
  - self-hosting focused
  - no spam
  - no copy-paste reposts from GitHub or a blog
  - headline must match the body
  - no low-effort posts
- Instance-wide policy checked:
  - relevant, useful, community-fit project sharing is acceptable when it is not broad commercial advertising
  - one-way promotion, paid-service-first advertising, and commercial CTA posts are not acceptable
- Self-promotion allowed: conditional. Do not post if it reads like advertising. Keep it relevant, practical, limitation-aware, and feedback-oriented.
- OSS project launch allowed: conditional. Post only as a practical self-hosted Compose review tool, not as a generic launch announcement.
- GitHub links allowed: conditional. Include one GitHub link only after the practical context and limitations.
- Why this post fits: ExposeMap is for people reviewing self-hosted Docker Compose stacks and their exposure hints.
- Do-not-post conditions:
  - self-promotion, project launches, or GitHub links are restricted
  - login, 2FA, terms acceptance, permissions, or final submission is required without user handoff
  - the post asks for stars
  - the post mentions paid support, waitlists, DMs, commercial support, hosted onboarding, or another commercial CTA
  - the post implies proof of internet reachability
  - the post reads like a vulnerability scanner
- User action needed: user must perform login, 2FA, terms acceptance, permissions, final submission, or any send/confirm action.

Do not post if self-promotion, project launches, or GitHub links are restricted. Do not post if login, 2FA, rules acceptance, permissions, or final submission is required without user handoff.
