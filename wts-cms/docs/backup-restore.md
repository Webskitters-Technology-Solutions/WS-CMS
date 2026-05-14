<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# Backup And Restore

WTS CMS includes script helpers for database backup, restore, and demo database portability.

## Demo Import

```bash
pnpm db:import-demo
```

Imports the committed demo fixture from:

```text
database/mongodb/wts-cms-demo-database.json
```

## Demo Export

```bash
pnpm db:export-demo
```

Exports the current CMS data into the demo fixture. Only use this when the current database contains safe public demo content.

## Backup

```bash
pnpm backup
```

Use backups before production deployments, migrations, large content imports, or bulk edits.

## Restore

```bash
pnpm restore
```

Run restore operations carefully and confirm the target database before proceeding.

## Production Recommendations

- Use scheduled MongoDB backups.
- Store backups outside the application container.
- Encrypt backups at rest.
- Restrict backup access.
- Test restore procedures regularly.
- Keep a backup before each release.
- Do not commit private production data.
