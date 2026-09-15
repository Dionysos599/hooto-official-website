import { writeFile } from "node:fs/promises";
import { SITE_URL } from "./site-config.mjs";

const pages = [
  "",
  "pages/art-education.html",
  "pages/cultural-ip.html",
  "pages/technology.html",
  "pages/community-practice.html",
  "pages/gallery.html",
];

const urls = pages.map((page) => `  <url><loc>${new URL(page, SITE_URL).href}</loc></url>`);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /pages/archive/

Sitemap: ${new URL("sitemap.xml", SITE_URL).href}
`;

await Promise.all([
  writeFile(new URL("../sitemap.xml", import.meta.url), sitemap),
  writeFile(new URL("../robots.txt", import.meta.url), robots),
]);

console.log(`Generated SEO files for ${SITE_URL.href}`);
