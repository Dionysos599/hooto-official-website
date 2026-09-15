# SEO production URL

Canonical links, social metadata, structured data, `sitemap.xml`, and `robots.txt`
currently use the inferred GitHub Pages URL:

`https://hooto-official.github.io/hooto-official-website/`

The repository did not contain a Git remote, `CNAME`, or documented production URL
when this configuration was added. **Confirm the public hostname before launch.** If
the site moves to a custom domain, update the absolute URLs in the six public HTML
files, then regenerate the crawler files with:

```bash
SITE_URL=https://www.example.com/ node tools/generate-seo-files.mjs
```

The trailing slash is recommended. The configured base path must match the actual
deployment path. Archived pages are deliberately excluded from `robots.txt` and
carry a `noindex, nofollow` directive.
