import { expect, test } from "@playwright/test";

test("Jennifer City canvas fills the browser instead of a 4:3 letterbox", async ({
  page,
}) => {
  await page.goto("/game");
  await page.waitForSelector("canvas", { timeout: 45_000 });

  const metrics = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return null;
    const box = canvas.getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    };
  });

  expect(metrics).not.toBeNull();
  expect(metrics!.width / metrics!.innerWidth).toBeGreaterThan(0.92);
  expect(metrics!.height / metrics!.innerHeight).toBeGreaterThan(0.92);
});
