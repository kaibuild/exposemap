# Show HN: ExposeMap - open-source exposure mapper for Docker Compose services

GitHub: https://github.com/kaibuild/exposemap

I built ExposeMap, a small open-source CLI for self-hosters who run services with Docker Compose.

It scans a `docker-compose.yml` file and classifies services as:

- internal
- localhost-only
- directly exposed
- reverse-proxy exposed
- unknown

It also generates a Markdown report and a Mermaid diagram so you can review the likely exposure paths in a Compose stack.

The goal is not to prove real internet exposure. It does not perform network scans, connect to containers, or send files anywhere. It is a local configuration review tool based on Compose heuristics.

The MVP currently handles common port mappings, localhost bindings, Traefik-style labels, likely reverse proxy services, and risky directly exposed database/admin ports.

Longer term, scheduled checks, history, diffs, and alerts may be worth exploring, but the current project is just the free local CLI.

Feedback, edge cases, and sanitized Compose examples are welcome.
