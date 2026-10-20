// ビルド前に public/sitemap.xml と public/robots.txt を生成する。
// ページの出し分けは pages/ 側の getStaticPaths と同じ条件にそろえること。
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';

const SITE_URL = 'https://fc-kurabe.com';
const MINOR_MIN = 5;

const { meta, brands } = JSON.parse(readFileSync(new URL('../data/brands.json', import.meta.url), 'utf8'));
const today = new Date().toISOString().slice(0, 10);

const paths = ['/', '/gyoshu/', '/shikin/', '/tag/', '/ranking/', '/compare/'];

const majors = [...new Set(brands.map((b) => b.major))];
for (const major of majors) {
  paths.push(`/gyoshu/${major}/`);
  const count = new Map();
  for (const b of brands.filter((x) => x.major === major)) count.set(b.minor, (count.get(b.minor) || 0) + 1);
  for (const [minor, n] of count) if (n >= MINOR_MIN) paths.push(`/gyoshu/${major}/${minor}/`);
}
for (const f of meta.funds) paths.push(`/shikin/${f.slug}/`);
for (const t of Object.keys(meta.tags)) if (brands.some((b) => b.tags.includes(t))) paths.push(`/tag/${t}/`);
for (const b of brands) paths.push(`/brand/${b.slug}/`);
const guideDir = new URL('../content/guide/', import.meta.url);
if (existsSync(guideDir)) {
  paths.push('/guide/');
  for (const f of readdirSync(guideDir)) if (f.endsWith('.md') && !f.startsWith('_')) paths.push(`/guide/${f.replace(/\.md$/, '')}/`);
}

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  paths.map((p) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  '\n</urlset>\n';

mkdirSync(new URL('../public/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
writeFileSync(
  new URL('../public/robots.txt', import.meta.url),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);
console.log(`sitemap.xml: ${paths.length} URLs`);
