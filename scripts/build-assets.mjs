#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const legacyRepo = path.resolve(root, "..", "yangmingyangming.github.io");
const mediaRoot = path.join(root, "public", "media");
const manifestPath = path.join(root, "src", "data", "media-manifest.json");
const manifest = {};

const readGitAsset = (source) => execFileSync(
  "git",
  ["show", `HEAD:${source}`],
  { cwd: legacyRepo, encoding: "buffer", maxBuffer: 128 * 1024 * 1024 },
);

async function convert(key, source, output, options = {}) {
  const input = readGitAsset(source);
  const destination = path.join(mediaRoot, output);
  await mkdir(path.dirname(destination), { recursive: true });
  let image = sharp(input, { limitInputPixels: false }).rotate();
  if (options.extract) image = image.extract(options.extract);
  image = image.resize({
    width: options.width ?? 1800,
    withoutEnlargement: true,
  });
  const info = await image.webp({ quality: options.quality ?? 82, effort: 5 }).toFile(destination);
  manifest[key] = {
    src: `./media/${output.replaceAll("\\", "/")}`,
    width: info.width,
    height: info.height,
  };
}

await rm(mediaRoot, { recursive: true, force: true });

await convert("portrait", "assets/images/profile/life-photo.jpg", "portrait.webp", { width: 900, quality: 84 });

const covers = [
  ["businessCover", "assets/images/projects/business-internship-cover.jpg", "covers/business-internship.webp"],
  ["wispCover", "assets/images/optimized/wisp-cover.webp", "covers/wisp.webp"],
  ["ayaCover", "assets/images/optimized/aya-cover.webp", "covers/aya.webp"],
  ["regroundCover", "assets/images/optimized/xigua-cover.webp", "covers/reground.webp"],
  ["everlifeCover", "assets/images/optimized/brand-cover.webp", "covers/everlife.webp"],
];
for (const [key, source, output] of covers) {
  await convert(key, source, output, { width: 1200, quality: 80 });
}

const wispSources = [
  "wisp_WISP封面.png",
  "wisp_WISP背景.png",
  "wisp_WISP商业.png",
  "wisp_WISP信息架构.png",
  "wisp_WISP设计系统.png",
  "wisp_WISP神像生成样本.png",
  "wisp_WISP界面1.png",
  "wisp_WISP界面2.png",
  "wisp_WISP界面3.png",
  "wisp_WISP界面4.png",
  "wisp_WISP界面5.png",
];
for (const [index, filename] of wispSources.entries()) {
  const id = String(index + 1).padStart(2, "0");
  await convert(`wisp${id}`, `assets/images/projects/wisp/${filename}`, `projects/wisp/${id}.webp`);
}

for (let page = 23; page <= 38; page += 1) {
  const id = String(page - 22).padStart(2, "0");
  await convert(`aya${id}`, `assets/images/projects/aya-game/aya-game-${page}.png`, `projects/aya/${id}.webp`);
}

for (let page = 1; page <= 10; page += 1) {
  const id = String(page).padStart(2, "0");
  await convert(`reground${id}`, `assets/images/projects/xigua/xigua_街头运动${page}.png`, `projects/reground/${id}.webp`);
}

for (let page = 3; page <= 25; page += 1) {
  const id = String(page - 2).padStart(2, "0");
  await convert(`everlife${id}`, `assets/images/projects/brand-design/brand-design-${String(page).padStart(2, "0")}.png`, `projects/everlife/${id}.webp`);
}

const businessSource = "assets/images/projects/business-internship.png";
const businessBuffer = readGitAsset(businessSource);
const businessMetadata = await sharp(businessBuffer, { limitInputPixels: false }).metadata();
const sourceHeight = businessMetadata.height ?? 0;
const sliceCount = 4;
for (let index = 0; index < sliceCount; index += 1) {
  const top = Math.floor((sourceHeight * index) / sliceCount);
  const bottom = Math.floor((sourceHeight * (index + 1)) / sliceCount);
  const id = String(index + 1).padStart(2, "0");
  const destination = path.join(mediaRoot, "projects", "business", `${id}.webp`);
  await mkdir(path.dirname(destination), { recursive: true });
  const info = await sharp(businessBuffer, { limitInputPixels: false })
    .extract({ left: 0, top, width: businessMetadata.width ?? 1, height: bottom - top })
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(destination);
  manifest[`business${id}`] = {
    src: `./media/projects/business/${id}.webp`,
    width: info.width,
    height: info.height,
  };
}

await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Prepared ${Object.keys(manifest).length} optimized media assets.`);
