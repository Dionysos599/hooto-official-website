import { watch } from "node:fs";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const outputPath = path.join(projectRoot, "gallery-data.js");
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const naturalSort = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });

const gallerySources = {
  culturalIp: "sub1",
  studentShowcase: "sub2/course"
};

async function collectImages(relativeDirectory) {
  const directoryPath = path.join(projectRoot, relativeDirectory);
  const entries = await readdir(directoryPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => path.posix.join(relativeDirectory, entry.name))
    .sort((left, right) => naturalSort.compare(left, right));
}

async function generateGalleryData() {
  const galleryData = Object.fromEntries(
    await Promise.all(
      Object.entries(gallerySources).map(async ([galleryName, relativeDirectory]) => [
        galleryName,
        await collectImages(relativeDirectory)
      ])
    )
  );

  const generatedFile = `/* 此文件由 scripts/generate-gallery-data.mjs 自动生成，请勿手动编辑。 */\nwindow.HOOTO_GALLERY_IMAGES = ${JSON.stringify(galleryData, null, 2)};\n`;

  await writeFile(outputPath, generatedFile, "utf8");
  console.log(`Generated gallery-data.js (${galleryData.culturalIp.length} IP / ${galleryData.studentShowcase.length} student images)`);
}

await generateGalleryData();

if (process.argv.includes("--watch")) {
  let updateTimer;
  const scheduleUpdate = () => {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(() => {
      generateGalleryData().catch((error) => console.error("Gallery data update failed:", error));
    }, 120);
  };

  Object.values(gallerySources).forEach((relativeDirectory) => {
    watch(path.join(projectRoot, relativeDirectory), scheduleUpdate);
  });

  console.log("Watching gallery source folders for changes...");
}
