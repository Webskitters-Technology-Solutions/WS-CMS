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
import { createServer } from "node:http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase, disconnectDatabase } from "./database/connection.js";
import { createApp } from "./app.js";

async function bootstrap() {
  await connectDatabase();
  const server = createServer(createApp());
  server.listen(env.API_PORT, () => {
    logger.info(
      {
        port: env.API_PORT,
        service: "WTS CMS API",
        poweredBy: "Webskitters Technology Solutions Pvt. Ltd.",
        website: "https://www.webskitters.com"
      },
      "WTS CMS API started"
    );
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "WTS CMS API graceful shutdown started");
    server.close(async () => {
      await disconnectDatabase();
      logger.info("WTS CMS API graceful shutdown complete");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

void bootstrap().catch((error) => {
  logger.error({ error }, "WTS CMS API failed to start");
  process.exit(1);
});
