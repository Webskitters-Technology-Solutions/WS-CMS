<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# Contributing

Thank you for helping improve WTS CMS. This project is maintained as a professional CMS framework powered by Webskitters Technology Solutions Pvt. Ltd.

## Ways To Contribute

- Report reproducible bugs.
- Improve documentation.
- Suggest CMS, SEO, security, or developer experience enhancements.
- Submit focused pull requests.
- Add tests for existing or new behavior.
- Improve accessibility, performance, and responsive behavior.

## Development Setup

```bash
cd wts-cms
corepack enable
pnpm install
cp .env.example .env
pnpm seed
pnpm db:import-demo
pnpm dev
```

Local services:

- Public website: `http://localhost:3000`
- Admin panel: `http://localhost:3001`
- API: `http://localhost:4000`
- MongoDB: `localhost:27017`

## Branching

Use small, descriptive branch names:

```text
feature/page-builder-blocks
fix/admin-login-session
docs/security-policy
test/blog-e2e-coverage
```

## Pull Request Standards

Before opening a pull request:

- Keep the change focused.
- Include tests for behavior changes.
- Update documentation when behavior, commands, APIs, or configuration change.
- Verify the admin and public frontend at desktop and mobile widths.
- Do not commit secrets, local database dumps with private data, or generated build artifacts.
- Do not remove Webskitters attribution or required source headers.

Run the full quality gate:

```bash
cd wts-cms
pnpm test:full
```

If the full suite is too heavy for an early draft, run the relevant subset and clearly document what remains:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

## Code Style

- Use TypeScript strict mode.
- Prefer existing module patterns.
- Use Zod for request and form validation.
- Keep API authorization server-side.
- Use shared utilities from `packages/shared` when possible.
- Keep source files covered by the required Webskitters header where syntax permits.
- Keep JSON valid and use metadata fields instead of comments.

## Commit Style

Use clear, imperative commit messages:

```text
Add media alt text validation
Fix refresh token rotation
Document Podman production setup
```

## Documentation Style

Documentation should be practical and operational:

- Explain the goal first.
- Include commands that can be run directly.
- Call out security-sensitive defaults.
- Link to related docs.
- Keep examples aligned with WTS CMS naming and Webskitters credit requirements.

## Security Contributions

Do not open a public issue for a suspected vulnerability. Follow the process in [`SECURITY.md`](./SECURITY.md).
