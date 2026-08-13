import { watch } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const outputPath = path.join(projectRoot, "pages/scripts/gallery-data.js");
const imageManifestPath = path.join(projectRoot, "assets/generated/images/manifest.json");
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const naturalSort = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });

const gallerySources = {
  culturalIp: "assets/images/cultural-ip/gallery",
  studentShowcase: "assets/images/art-education/course"
};

async function loadImageManifest() {
  try {
    return JSON.parse(await readFile(imageManifestPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

async function collectImages(relativeDirectory, manifest) {
  const directoryPath = path.join(projectRoot, relativeDirectory);
  const entries = await readdir(directoryPath, { withFileTypes: true });

  const imageNames = entries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name);

  return imageNames
    .sort((left, right) => naturalSort.compare(left, right))
    .map((name) => {
      const src = path.posix.join(relativeDirectory, name);
      return manifest[src] || { src, variants: [] };
    });
}

async function generateGalleryData() {
  const manifest = await loadImageManifest();
  const galleryData = Object.fromEntries(
    await Promise.all(
      Object.entries(gallerySources).map(async ([galleryName, relativeDirectory]) => [
        galleryName,
        await collectImages(relativeDirectory, manifest)
      ])
    )
  );

  const generatedFile = `/* 此文件由 tools/generate-gallery-data.mjs 自动生成，请勿手动编辑。 */\nwindow.HOOTO_GALLERY_IMAGES = ${JSON.stringify(galleryData, null, 2)};\n`;

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
