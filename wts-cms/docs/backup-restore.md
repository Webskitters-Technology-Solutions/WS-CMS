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
