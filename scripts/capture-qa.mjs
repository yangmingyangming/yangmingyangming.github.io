#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const root = path.resolve(process.cwd());
const output = path.join(root, "qa", "screenshots");
await mkdir(output, { recursive: true });

async function assertColoredSphere(png, label) {
  const { data } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let coloredPixels = 0;
  for (let index = 0; index < data.length; index += 3) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    if (Math.max(red, green, blue) - Math.min(red, green, blue) > 12 && Math.max(red, green, blue) > 55) {
      coloredPixels += 1;
    }
  }
  if (coloredPixels < data.length / 3 / 20) {
    throw new Error(`${label} did not contain enough colored sphere pixels`);
  }
}

const browser = await chromium.launch({ headless: true });

async function captureHome(name, viewport, actions = async () => {}) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("http://127.0.0.1:4173/#/", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await actions(page);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(output, `${name}.png`) });
  if (errors.length) throw new Error(`${name} console errors:\n${errors.join("\n")}`);
  await page.close();
}

async function jumpTo(page, selector, progress = 0) {
  await page.evaluate(({ selector, progress }) => {
    const element = document.querySelector(selector);
    const top = element ? element.getBoundingClientRect().top + window.scrollY : 0;
    const distance = element ? Math.max(0, element.scrollHeight - window.innerHeight) : 0;
    const target = top + distance * progress;
    const browserWindow = window;
    if (browserWindow.__portfolioLenis) browserWindow.__portfolioLenis.scrollTo(target, { immediate: true, force: true });
    else window.scrollTo(0, target);
  }, { selector, progress });
}

await captureHome("desktop-hero-1920x908", { width: 1920, height: 908 });

const fallbackPage = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
await fallbackPage.goto("http://127.0.0.1:4173/#/", { waitUntil: "networkidle" });
await fallbackPage.waitForTimeout(700);
const isolateSphere = async (page) => {
  if (await page.locator("[data-testid='sphere-canvas']").count() === 0) {
    throw new Error("Cannot capture a WebGL fallback without a live sphere canvas");
  }
  return page.evaluate(() => {
  document.querySelectorAll("body *").forEach((element) => {
    if (element instanceof HTMLElement) element.style.visibility = "hidden";
  });
  const sphere = document.querySelector("[data-testid='sphere-canvas']");
  document.querySelectorAll("[data-testid='sphere-canvas'], [data-testid='sphere-canvas'] *").forEach((element) => {
    if (element instanceof HTMLElement) element.style.visibility = "visible";
  });
  let ancestor = sphere;
  while (ancestor instanceof HTMLElement) {
    ancestor.style.visibility = "visible";
    ancestor.style.opacity = "1";
    ancestor = ancestor.parentElement;
  }
  document.documentElement.style.background = "#171717";
  document.body.style.background = "#171717";
  });
};
await isolateSphere(fallbackPage);
await fallbackPage.waitForTimeout(450);
const fallbackPng = await fallbackPage.screenshot({ omitBackground: false });
await assertColoredSphere(fallbackPng, "desktop fallback");
await sharp(fallbackPng).webp({ quality: 86 }).toFile(path.join(root, "public", "sphere-fallback.webp"));
await fallbackPage.close();

const mobileFallbackPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await mobileFallbackPage.goto("http://127.0.0.1:4173/#/", { waitUntil: "networkidle" });
await mobileFallbackPage.waitForTimeout(700);
await isolateSphere(mobileFallbackPage);
await mobileFallbackPage.waitForTimeout(450);
const mobileFallbackPng = await mobileFallbackPage.screenshot({ omitBackground: false });
await assertColoredSphere(mobileFallbackPng, "mobile fallback");
await sharp(mobileFallbackPng).webp({ quality: 86 }).toFile(path.join(root, "public", "sphere-fallback-mobile.webp"));
await mobileFallbackPage.close();

const markPage = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
await markPage.goto("http://127.0.0.1:4173/#/", { waitUntil: "networkidle" });
await jumpTo(markPage, ".cross-section", 0.08);
await markPage.waitForTimeout(700);
const markCanvas = await markPage.locator(".cross-canvas").screenshot({ omitBackground: true });
const markCrop = sharp(markCanvas)
  .extract({ left: 335, top: 335, width: 230, height: 230 })
  .ensureAlpha();
const { data: markPixels, info: markInfo } = await markCrop.raw().toBuffer({ resolveWithObject: true });
for (let index = 0; index < markPixels.length; index += 4) {
  const brightness = markPixels[index] + markPixels[index + 1] + markPixels[index + 2];
  if (brightness < 120) markPixels[index + 3] = 0;
}
await sharp(markPixels, { raw: markInfo })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ width: 96, height: 96, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 92 })
  .toFile(path.join(root, "public", "cross-mark.webp"));
await markPage.close();

await captureHome("desktop-projects-1440x900", { width: 1440, height: 900 }, async (page) => {
  await jumpTo(page, "#projects", 0);
});
await captureHome("desktop-projects-hover-1440x900", { width: 1440, height: 900 }, async (page) => {
  await jumpTo(page, "#projects", 0);
  await page.getByTestId("project-card").first().hover();
});
await captureHome("desktop-projects-1920x908", { width: 1920, height: 908 }, async (page) => {
  await jumpTo(page, "#projects", 0);
});
await captureHome("desktop-about-1440x900", { width: 1440, height: 900 }, async (page) => {
  await jumpTo(page, "#about", 0);
});
await captureHome("desktop-internship-1440x900", { width: 1440, height: 900 }, async (page) => {
  await jumpTo(page, "#internship", 0);
});
await captureHome("desktop-campus-1440x900", { width: 1440, height: 900 }, async (page) => {
  await jumpTo(page, "#campus", 0);
});
await captureHome("desktop-skills-1440x900", { width: 1440, height: 900 }, async (page) => {
  await jumpTo(page, "#skills", 0);
});
await captureHome("desktop-cross-small-1440x900", { width: 1440, height: 900 }, async (page) => {
  await jumpTo(page, ".cross-section", 0.08);
});

await captureHome("desktop-cross-mid-1440x900", { width: 1440, height: 900 }, async (page) => {
  await jumpTo(page, ".cross-section", 0.5);
});
await captureHome("desktop-cross-full-1440x900", { width: 1440, height: 900 }, async (page) => {
  await jumpTo(page, ".cross-section", 0.96);
});
await captureHome("desktop-cross-small-1920x908", { width: 1920, height: 908 }, async (page) => {
  await jumpTo(page, ".cross-section", 0.08);
});
await captureHome("desktop-cross-mid-1920x908", { width: 1920, height: 908 }, async (page) => {
  await jumpTo(page, ".cross-section", 0.5);
});
await captureHome("desktop-cross-full-1920x908", { width: 1920, height: 908 }, async (page) => {
  await jumpTo(page, ".cross-section", 0.96);
});
await captureHome("mobile-hero-390x844", { width: 390, height: 844 });
await captureHome("mobile-projects-390x844", { width: 390, height: 844 }, async (page) => {
  await jumpTo(page, "#projects", 0);
});
await captureHome("mobile-about-390x844", { width: 390, height: 844 }, async (page) => {
  await jumpTo(page, "#about", 0);
});
await captureHome("mobile-internship-390x844", { width: 390, height: 844 }, async (page) => {
  await jumpTo(page, "#internship", 0);
});
await captureHome("tablet-hero-1024x768", { width: 1024, height: 768 });
await captureHome("desktop-contact-1440x900", { width: 1440, height: 900 }, async (page) => {
  await jumpTo(page, "#contact", 0);
});
await captureHome("mobile-cross-full-390x844", { width: 390, height: 844 }, async (page) => {
  await jumpTo(page, ".cross-section", 0.96);
});

const detail = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await detail.goto("http://127.0.0.1:4173/#/work/business-internship", { waitUntil: "networkidle" });
await detail.screenshot({ path: path.join(output, "desktop-business-detail-1440x900.png") });
await detail.close();

await browser.close();
console.log(`Captured QA screenshots in ${output}`);
