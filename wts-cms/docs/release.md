<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# Release Process

Use this process for preparing WTS CMS releases.

## Pre-Release Checklist

```bash
pnpm test:full
```

Confirm:

- Working tree is clean.
- Version is correct.
- `CHANGELOG.md` is updated.
- Documentation reflects changed behavior.
- Demo data contains no private information.
- Default credentials guidance is visible.
- Security and deployment notes are current.
- Public website, admin panel, and API build successfully.

## Versioning

Recommended versioning:

- Patch: bug fixes and documentation updates.
- Minor: backward-compatible features.
- Major: breaking API, content model, or deployment changes.

## Release Notes

Release notes should include:

- Summary.
- Added features.
- Fixed bugs.
- Security notes.
- Migration steps.
- Known limitations.
- Verification commands.

## Post-Release Checks

- Verify package metadata.
- Verify GitHub release notes.
- Verify public documentation links.
- Verify demo import.
- Verify clean install from the published branch or tag.
