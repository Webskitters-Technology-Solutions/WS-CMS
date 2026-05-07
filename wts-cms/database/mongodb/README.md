<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# WTS CMS Demo MongoDB Database

This folder contains the committed portable MongoDB fixture for WTS CMS demo content powered by Webskitters Technology Solutions Pvt. Ltd.

Use:

```bash
pnpm db:import-demo
```

Refresh the fixture from a local database:

```bash
pnpm db:export-demo
```

The fixture intentionally excludes live refresh tokens and preview tokens.
