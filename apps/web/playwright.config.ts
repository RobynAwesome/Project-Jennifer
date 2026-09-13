import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.JENNIFER_WEB_URL ?? "http://127.0.0.1:3000",
    viewport: { width: 1440, height: 900 },
  },
  webServer: process.env.JENNIFER_WEB_URL
    ? undefined
    : {
        command: "corepack pnpm --filter @jennifer/web dev",
        url: "http://127.0.0.1:3000/game",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
