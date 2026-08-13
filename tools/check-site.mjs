import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const htmlFiles = [
  'index.html',
  'pages/art-education.html',
  'pages/cultural-ip.html',
  'pages/technology.html',
  'pages/community-practice.html',
  'pages/gallery.html',
];
const documents = new Map();
const errors = [];

const report = (file, message) => errors.push(`${file}: ${message}`);
const attributes = (tag) => {
  const result = new Map();
  const pattern = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of tag.matchAll(pattern)) {
    result.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
  }
  return result;
};
const stripUrl = (value) => value.split('#', 1)[0].split('?', 1)[0];
const isRemote = (value) => /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value);
const decode = (value) => {
  try { return decodeURIComponent(value); } catch { return value; }
};

for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  const ids = new Set();
  for (const match of html.matchAll(/\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)) {
    const id = match[1] ?? match[2];
    if (ids.has(id)) report(file, `duplicate id "${id}"`);
    ids.add(id);
  }
  documents.set(file, { html, ids });

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!attributes(match[0]).has('alt')) report(file, `image is missing alt: ${match[0]}`);
  }
}

const resolveFile = (from, url) => {
  const clean = decode(stripUrl(url));
  if (!clean) return from;
  return path.relative(root, clean.startsWith('/')
    ? path.join(root, clean.slice(1))
    : path.resolve(root, path.dirname(from), clean));
};

for (const [file, { html }] of documents) {
  const references = [];
  for (const match of html.matchAll(/<(?:a|link|script|img|source)\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    for (const name of ['href', 'src']) {
      if (attrs.has(name)) references.push({ name, value: attrs.get(name) });
    }
    if (attrs.has('srcset')) {
      for (const candidate of attrs.get('srcset').split(',')) {
        const value = candidate.trim().split(/\s+/, 1)[0];
        if (value) references.push({ name: 'srcset', value });
      }
    }
  }

  for (const { name, value } of references) {
    if (!value || isRemote(value) || value.startsWith('data:')) continue;
    const target = resolveFile(file, value);
    if (stripUrl(value)) {
      try { await access(path.join(root, target)); }
      catch { report(file, `${name} target does not exist: "${value}"`); continue; }
    }

    if (name !== 'href' || !value.includes('#')) continue;
    const fragment = decode(value.slice(value.indexOf('#') + 1));
    if (!fragment) continue;
    const targetDocument = documents.get(target);
    if (!targetDocument) {
      if (target.endsWith('.html')) report(file, `cannot inspect anchor target outside the public page set: "${value}"`);
      continue;
    }
    if (!targetDocument.ids.has(fragment)) report(file, `anchor target does not exist: "${value}"`);
  }
}

if (errors.length) {
  console.error(`Site checks failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Site checks passed for ${htmlFiles.length} public HTML pages.`);
}
