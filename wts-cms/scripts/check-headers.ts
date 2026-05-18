/**
 * ================================================================
 *  __        __ _____ ____  ____  _  _____ _____ _____ _____ ____  ____
 *  \ \      / /| ____| __ )/ ___|| |/ /_ _|_   _|_   _| ____|  _ \/ ___|
 *   \ \ /\ / / |  _| |  _ \\___ \| ' / | |  | |   | | |  _| | |_) \___ \
 *    \ V  V /  | |___| |_) |___) | . \ | |  | |   | | | |___|  _ < ___) |
 *     \_/\_/   |_____|____/|____/|_|\_\___| |_|   |_| |_____|_| \_\____/
 *
 *  Project      : WTS CMS
 *  Powered By   : Webskitters Technology Solutions Pvt. Ltd.
 *  Website      : https://www.webskitters.com
 *  Description  : Enterprise-ready lightweight CMS starter platform
 *
 *  Copyright © Webskitters Technology Solutions Pvt. Ltd.
 * ================================================================
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".md", ".yml", ".yaml", ".sh"]);
const codeExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".scss"]);
const ignored = new Set(["node_modules", ".next", "dist", ".git", "coverage"]);
const ignoredFiles = new Set(["pnpm-lock.yaml", "next-env.d.ts"]);
const requiredCodeHeaderNeedle = "__        __ _____ ____  ____  _  _____ _____ _____ _____ ____  ____";
const failures: string[] = [];

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!checkedExtensions.has(path.extname(entry.name))) {
      continue;
    }
    if (ignoredFiles.has(entry.name)) {
      continue;
    }
    const source = fs.readFileSync(full, "utf8").slice(0, 1400);
    const extension = path.extname(entry.name);
    if (
      !source.includes("WTS CMS") ||
      !source.includes("Webskitters") ||
      (codeExtensions.has(extension) && !source.includes(requiredCodeHeaderNeedle))
    ) {
      failures.push(path.relative(root, full));
    }
  }
}

walk(root);

if (failures.length) {
  process.stderr.write(`Missing Webskitters headers:\n${failures.join("\n")}\n`);
  process.exit(1);
}

process.stdout.write("All source headers include WTS CMS and Webskitters credit.\n");
