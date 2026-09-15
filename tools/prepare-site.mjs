import { cp, mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const sourceImageRoot = path.join(projectRoot, "assets/images");
const generatedRoot = path.join(projectRoot, "assets/generated/images");
const manifestPath = path.join(generatedRoot, "manifest.json");
const galleryDataPath = path.join(projectRoot, "pages/scripts/gallery-data.js");
const outputDirectory = path.join(projectRoot, "_site");
const excludedRootEntries = new Set([
  ".DS_Store",
  ".git",
  ".github",
  ".gitignore",
  "_site",
  "skills"
]);

function fail(message) {
  throw new Error(`Site artifact validation failed: ${message}`);
}

function resolveGeneratedPath(relativePath) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    fail("generated image path is missing");
  }
  const resolved = path.resolve(projectRoot, relativePath);
  if (resolved !== generatedRoot && !resolved.startsWith(`${generatedRoot}${path.sep}`)) {
    fail(`generated variant escapes assets/generated/images: ${relativePath}`);
  }
  return resolved;
}

function resolveSourceImagePath(relativePath) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    fail("source image path is missing");
  }
  const resolved = path.resolve(projectRoot, relativePath);
  if (resolved !== sourceImageRoot && !resolved.startsWith(`${sourceImageRoot}${path.sep}`)) {
    fail(`source image escapes assets/images: ${relativePath}`);
  }
  return resolved;
}

async function requireNonemptyFile(filePath, label) {
  let details;
  try {
    details = await stat(filePath);
  } catch (error) {
    if (error.code === "ENOENT") fail(`${label} does not exist`);
    throw error;
  }
  if (!details.isFile() || details.size === 0) fail(`${label} is empty or not a file`);
}

async function validateGeneratedImages() {
  await requireNonemptyFile(manifestPath, "image manifest");

  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    fail(`image manifest is not valid JSON (${error.message})`);
  }

  const entries = Object.entries(manifest);
  if (entries.length === 0) fail("image manifest contains no source images");

  const generatedPaths = new Set();
  for (const [sourcePath, image] of entries) {
    await requireNonemptyFile(resolveSourceImagePath(sourcePath), `source image ${sourcePath}`);
    if (!image || !Array.isArray(image.variants) || image.variants.length === 0) {
      fail(`image manifest has no WebP variants for ${sourcePath}`);
    }

    for (const variant of image.variants) {
      if (!variant?.src?.endsWith(".webp")) {
        fail(`image manifest contains a non-WebP variant for ${sourcePath}`);
      }
      await requireNonemptyFile(
        resolveGeneratedPath(variant.src),
        `generated image ${variant.src}`
      );
      generatedPaths.add(variant.src);
    }
  }

  console.log(`Validated ${generatedPaths.size} WebP files from ${entries.length} source images.`);
  return generatedPaths;
}

async function validateGalleryData(generatedPaths) {
  const contents = await readFile(galleryDataPath, "utf8");
  const assignment = "window.HOOTO_GALLERY_IMAGES = ";
  const assignmentIndex = contents.indexOf(assignment);
  if (assignmentIndex === -1) fail("gallery data assignment is missing");

  let galleryData;
  try {
    const serialized = contents
      .slice(assignmentIndex + assignment.length)
      .trim()
      .replace(/;\s*$/, "");
    galleryData = JSON.parse(serialized);
  } catch (error) {
    fail(`gallery data is not valid generated JSON (${error.message})`);
  }

  let galleryVariantCount = 0;
  for (const [galleryName, images] of Object.entries(galleryData)) {
    if (!Array.isArray(images) || images.length === 0) {
      fail(`gallery ${galleryName} contains no images`);
    }
    for (const image of images) {
      await requireNonemptyFile(
        resolveSourceImagePath(image?.src),
        `gallery source image ${image?.src || "unknown source"}`
      );
      if (!Array.isArray(image?.variants) || image.variants.length === 0) {
        fail(`gallery image has no generated variants: ${image?.src || "unknown source"}`);
      }
      for (const variant of image.variants) {
        if (!generatedPaths.has(variant.src)) {
          fail(`gallery references a WebP missing from the manifest: ${variant.src}`);
        }
        galleryVariantCount += 1;
      }
    }
  }

  console.log(`Validated ${galleryVariantCount} gallery WebP references.`);
}

async function assembleSite(generatedPaths) {
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  const rootEntries = await readdir(projectRoot, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (excludedRootEntries.has(entry.name)) continue;
    await cp(
      path.join(projectRoot, entry.name),
      path.join(outputDirectory, entry.name),
      { recursive: true, preserveTimestamps: true }
    );
  }

  await requireNonemptyFile(
    path.join(outputDirectory, "assets/generated/images/manifest.json"),
    "staged image manifest"
  );
  for (const relativePath of generatedPaths) {
    await requireNonemptyFile(
      path.join(outputDirectory, relativePath),
      `staged generated image ${relativePath}`
    );
  }
  console.log("Assembled GitHub Pages artifact in _site (without .gitignore).");
}

const generatedPaths = await validateGeneratedImages();
await validateGalleryData(generatedPaths);
await assembleSite(generatedPaths);
