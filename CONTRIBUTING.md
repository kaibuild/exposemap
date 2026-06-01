# Contributing to ExposeMap

Thanks for considering a contribution. ExposeMap is intentionally small: a local TypeScript CLI that reviews Docker Compose configuration and prints exposure reports.

## Install

```bash
npm install
```

## Run Tests

```bash
npm test
```

## Build

```bash
npm run build
```

## Run the CLI Locally

```bash
npm run build
node dist/cli.js scan examples/risky-compose.yml --format markdown
```

## Good First Contributions

Good first contributions should be small, reproducible, and based on public sanitized examples.

Good areas include:

- documentation wording
- sanitized Docker Compose examples
- parser edge cases with a focused test
- reverse proxy label hints
- report wording and Markdown formatting
- tests for an existing rule
- Docker and CI usage docs

Avoid issues or PRs that require live infrastructure, external scanning, private Compose files, credentials, hosted services, authentication, customer-specific context, or paid support workflows.

## Add a New Rule

1. Add the rule implementation under `src/rules/`.
2. Keep the rule read-only and based on Compose configuration.
3. Add shared types to `src/types.ts` if needed.
4. Wire the rule into `src/rules/serviceClassifier.ts`.
5. Add focused Vitest coverage under `tests/`.
6. Update `README.md` if the user-visible behavior changes.

## Open an Issue or PR

- Use a concise title.
- Include the command you ran and the output you expected.
- Include sanitized Compose snippets only.
- Do not include secrets, tokens, private domains, internal hostnames, credentials, private IP details, customer names, or sensitive infrastructure information.
- If the change affects a user-visible classification, report, CLI option, Docker usage, or CI usage, update the relevant docs.
- Link the issue or describe the reproducible case in the PR.

## Issue Triage Labels

Maintainers can use these labels to make the project easier to scan:

- `bug` for incorrect behavior or unexpected errors
- `enhancement` for feature requests
- `docs` for documentation-only work
- `good first issue` for small, well-scoped work that does not require private infrastructure
- `needs sanitized example` when the report needs a smaller public Compose snippet
- `question` for usage questions that may become docs

## Coding Style

- Keep code readable and modular.
- Prefer explicit rule names and clear evidence strings.
- Avoid broad refactors in small PRs.
- Do not add network scanning, hosted dashboards, authentication, or container connections unless the issue explicitly calls for it.
- Run `npm test` and `npm run build` before opening a PR.

## Pull Request Checklist

- [ ] The change stays local and read-only.
- [ ] No secrets, private Compose files, credentials, private domains, or sensitive infrastructure details are included.
- [ ] Tests were added or updated when behavior changed.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] README or docs were updated when user-visible behavior changed.
