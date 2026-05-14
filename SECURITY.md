/**
 * ================================================================
 *  __        __   _     ____  _  _______ _____ _____ _____ _____
 *  \ \      / /__| |__ / ___|| |/ /_   _|_   _| ____|_   _/ ____|
 *   \ \ /\ / / _ \ '_ \\___ \| ' /  | |   | | |  _|   | | \___ \
 *    \ V  V /  __/ |_) |___) | . \  | |   | | | |___  | |  ___) |
 *     \_/\_/ \___|_.__/|____/|_|\_\ |_|   |_| |_____| |_| |____/
 *
 *  Project      : WTS CMS
 *  Powered By   : Webskitters Technology Solutions Pvt. Ltd.
 *  Website      : https://www.webskitters.com
 *  Description  : Enterprise-ready lightweight CMS starter platform
 *
 *  Copyright © Webskitters Technology Solutions Pvt. Ltd.
 * ================================================================
 */

# Security Policy

WTS CMS treats security reports with priority. Please report suspected vulnerabilities responsibly and avoid public disclosure until a fix or mitigation is available.

## Supported Versions

| Version | Supported |
| --- | --- |
| `main` | Yes |
| Released minor versions | Best effort |
| Unreleased local changes | No |

## Reporting A Vulnerability

Do not create a public issue for security vulnerabilities.

Report privately through the project maintainers or Webskitters Technology Solutions:

- Website: [https://www.webskitters.com](https://www.webskitters.com)
- Include: affected version or commit, reproduction steps, expected impact, logs or screenshots if safe, and suggested mitigation if known.

## Response Expectations

The maintainers will aim to:

- Acknowledge valid reports promptly.
- Triage severity and affected areas.
- Prepare a fix or documented mitigation.
- Credit reporters when appropriate and approved.
- Publish release notes after a safe disclosure window.

## Security Baseline

WTS CMS includes:

- Helmet headers and CSP-ready structure.
- CORS allowlisting.
- Rate limiting and request slow-down.
- Body size limits.
- MongoDB sanitisation.
- HTTP parameter pollution protection.
- Zod validation.
- Password hashing.
- JWT access and refresh tokens.
- RBAC middleware.
- Audit logging.
- Upload validation.
- Safe CMS HTML sanitisation.
- JSON-LD validation.
- Production-safe error responses.

See [`wts-cms/docs/security.md`](./wts-cms/docs/security.md) for implementation details.
