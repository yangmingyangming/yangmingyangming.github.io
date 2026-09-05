import { expect, test } from "@playwright/test";

test("home navigation and all project cards work", async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/#/");
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
  await expect(page.getByRole("heading", { name: /YANG MING/i })).toBeVisible();
  await expect(page.getByTestId("project-card")).toHaveCount(5);
  const firstCard = page.getByTestId("project-card").first();
  if (!isMobile) {
    await expect(firstCard.getByTestId("project-card-teaser")).toHaveCSS("opacity", "0");
    await expect(firstCard.locator(".project-card-cross")).toHaveCSS("opacity", "1");
    await firstCard.hover();
    await expect(firstCard.getByTestId("project-card-teaser")).toHaveCSS("opacity", "1");
    await expect(firstCard.locator(".project-card-arrow")).toHaveCSS("opacity", "1");
  }
  await firstCard.click();
  await expect(page.getByRole("heading", { name: "商业实习" })).toBeVisible();
  await expect(page.locator(".project-gallery img")).toHaveCount(5);
  await expect(page.getByRole("link", { name: /NEXT/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile menu reaches the resume sections", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile navigation test");
  await page.goto("/#/");
  await page.getByRole("button", { name: "打开导航" }).click();
  await expect(page.getByRole("navigation", { name: "主导航" })).toHaveClass(/is-open/);
  await page.getByRole("link", { name: "技能" }).click();
  await expect(page.locator("#skills")).toBeInViewport();
});

test("the WebGL sphere and cross transition render non-empty pixels", async ({ page }) => {
  await page.goto("/#/");
  const sphere = page.getByTestId("sphere-canvas").locator("canvas");
  await expect(sphere).toBeVisible();
  const sphereShot = await sphere.screenshot();
  expect(sphereShot.byteLength).toBeGreaterThan(10_000);

  const cross = page.getByTestId("cross-transition");
  await cross.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.75));
  await page.waitForTimeout(700);
  const crossShot = await cross.screenshot();
  expect(crossShot.byteLength).toBeGreaterThan(10_000);
});

test("the sphere responds with a damped ripple and keeps text unselected", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/#/");
  const canvas = page.getByTestId("sphere-canvas").locator("canvas");
  await expect(canvas).toBeVisible();
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Missing test viewport");

  await page.mouse.move(viewport.width * 0.79, viewport.height * 0.42);
  await page.waitForTimeout(140);
  const hover = await canvas.screenshot();
  await page.mouse.down();
  await page.mouse.move(viewport.width * 0.68, viewport.height * 0.49, { steps: 12 });
  await page.waitForTimeout(110);
  const drag = await canvas.screenshot();
  expect(await page.evaluate(() => window.getSelection()?.toString() ?? "")).toBe("");
  await page.mouse.up();
  await page.waitForTimeout(220);
  const release = await canvas.screenshot();

  expect(Buffer.compare(hover, drag)).not.toBe(0);
  expect(Buffer.compare(drag, release)).not.toBe(0);
  expect(errors).toEqual([]);
});
