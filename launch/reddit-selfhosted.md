# Looking for feedback: a read-only Docker Compose exposure map for self-hosted stacks

I built ExposeMap because I kept seeing the same problem in self-hosted stacks: after a few Compose files, reverse proxies, admin tools, databases, VPNs, and experiments, it becomes hard to quickly answer what is exposed and how.

Important caveat up front: ExposeMap is not a vulnerability scanner, does not perform real network scans, and does not prove internet exposure. It only reads Docker Compose configuration locally. It does not connect to containers, modify Compose files, inspect secrets, or send Compose files anywhere.

ExposeMap is a small open-source CLI that reads a `docker-compose.yml` file and classifies services as:

- internal
- localhost-only
- directly exposed
- reverse-proxy exposed
- unknown

It generates a Markdown report with a summary table, high-risk findings, service details, and a Mermaid diagram.

GitHub: https://github.com/kaibuild/exposemap

It can run locally with Node.js or Docker:

```bash
docker build -t exposemap .
docker run --rm -v $(pwd):/scan exposemap scan /scan/docker-compose.yml --format markdown
```

It is meant as a read-only Compose configuration review tool, not as proof that something is or is not reachable from the internet.

The MVP checks common port mappings, localhost-only bindings, broad/public bindings, Traefik labels, likely reverse proxy services, and risky directly exposed ports like Postgres, Redis, MySQL, MongoDB, Elasticsearch, and common admin panels.

I would appreciate technical feedback, edge cases, and sanitized Compose examples.
