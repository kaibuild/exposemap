# Show HN: ExposeMap - local Docker Compose host-published service mapper

GitHub: https://github.com/kaibuild/exposemap

I built ExposeMap, a small open-source CLI for self-hosters who run services with Docker Compose.

It scans a `docker-compose.yml` file and classifies services as:

- published
- internal
- unknown

It generates table, Markdown, JSON, and static HTML reports so you can review which services look host-published from a Compose file.

The goal is not to prove real internet exposure. `published` means host-published in Compose, not internet-reachable. It does not perform network scans, connect to containers, inspect secrets, or send files anywhere. It is a local configuration review tool based on Compose heuristics.

The MVP currently handles common port mappings, localhost bindings, long syntax `ports`, `expose`, basic network context, reverse proxy labels, Caddy hints, Nginx Proxy Manager hints, and Cloudflare Tunnel hints as note-only context.

Longer term, scheduled checks, history, diffs, alerts, and opt-in external scans may be worth exploring, but the current project is just the free local CLI.

Feedback, edge cases, and sanitized Compose examples are welcome.
