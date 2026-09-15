/**
 * Public site origin used by SEO asset generators.
 *
 * Override this in deployment when the final custom domain is known:
 * SITE_URL=https://example.com/ node tools/generate-seo-files.mjs
 */
export const SITE_URL = new URL(
  process.env.SITE_URL || "https://hooto-official.github.io/hooto-official-website/",
);

