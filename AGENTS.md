# AGENTS.md

## Project Purpose

ExposeMap is a TypeScript CLI tool for self-hosted Docker Compose visibility mapping. It scans Compose configuration locally and reports whether services look `published`, `internal`, or `unknown`.

ExposeMap must stay read-only in the MVP. It must not modify `docker-compose.yml`, connect to containers, scan external networks, or add hosted/cloud functionality unless explicitly requested.

## Code Style Rules

- Keep code simple, readable, modular, and easy for open-source contributors to understand.
- Put individual checks in `src/rules/`.
- Put shared types in `src/types.ts`.
- Put report rendering in `src/report/`.
- Prefer small functions with clear names over clever abstractions.
- Do not build a web dashboard unless explicitly requested.
- Do not add real network scanning unless explicitly requested.
- Do not add cloud/hosted functionality unless explicitly requested.
- Do not add authentication unless explicitly requested.

## Testing Rules

- Use Vitest for tests.
- Add or update focused tests for every behavior change.
- Cover parser changes, rule changes, report rendering changes, and CLI behavior when practical.
- Run `npm test` and `npm run build` before committing.

## README Update Rules

- Update `README.md` when CLI behavior, Docker usage, output formats, limitations, or roadmap items change.
- Keep the README clear, technical, humble, and useful for self-hosters and GitHub visitors.
- Do not claim ExposeMap proves real internet exposure.
- Clearly state when behavior is based on heuristics.

## Git Workflow Rules

- Work on task branches, not directly on `main`.
- Do not overwrite unrelated user changes.
- Stage only relevant files.
- Do not force push.
- Do not commit generated build artifacts such as `dist/`, `coverage/`, or `node_modules/`.
- End every task with branch, commit hash, push status, and PR link if available.

## Security and Safety Rules

- Do not commit secrets, `.env` files, private Compose files, credentials, tokens, or sensitive infrastructure details.
- ExposeMap must run locally and must not send Compose files or reports anywhere.
- ExposeMap must not perform real network scans in the MVP.
- Treat findings as configuration-review heuristics, not proof of external reachability.
- Do not ask users to paste private Compose files with secrets into public issues.

## Verification Before Handoff

- Run `npm test`.
- Run `npm run build`.
- Run the CLI against at least one example.
- Build the Docker image when Docker changes or release readiness is requested.
- Report branch, commit hash, push status, PR link if available, and any blocked checks or manual steps.
