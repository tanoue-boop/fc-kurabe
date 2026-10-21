// 開業ガイド記事（content/guide/*.md）を読み込む。ビルド時だけ使う（getStaticProps内）。
// 本文中の [[brands minor=xxx]] / [[brands slugs=a,b]] / [[brand slug=xxx]] は、
// サイトの本部データからカードを差し込む目印。金額は常に data/brands.json の最新値になる。
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { BRANDS, toRow } from './data';
import type { Row } from './data';

const ROOT = path.join(process.cwd(), 'content');
const DIR = path.join(ROOT, 'guide');

export type GuideMeta = {
  slug: string;
  title: string;
  description: string;
  lead: string;
  photo: string;
  minor?: string | null;
  major?: string | null;
  updated: string;
  order: number;
};

export type Block = { kind: 'html'; html: string } | { kind: 'brands'; rows: Row[]; layout: 'tile' | 'row' } | { kind: 'table'; rows: Row[] };
export type Toc = { id: string; text: string }[];

function parseFront(raw: string) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('frontmatter がありません');
  const meta: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1');
  }
  return { meta, body: m[2] };
}

function toMeta(slug: string, meta: Record<string, string>): GuideMeta {
  return {
    slug,
    title: meta.title,
    description: meta.description,
    lead: meta.lead ?? meta.description,
    photo: meta.photo ?? '/img/hero.jpg',
    minor: meta.minor || null,
    major: meta.major || null,
    updated: meta.updated,
    order: Number(meta.order ?? 99),
  };
}

export function guideSlugs() {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_')).map((f) => f.replace(/\.md$/, ''));
}

export function allGuides(): GuideMeta[] {
  return guideSlugs()
    .map((slug) => toMeta(slug, parseFront(fs.readFileSync(path.join(DIR, `${slug}.md`), 'utf8')).meta))
    .sort((a, b) => a.order - b.order);
}

function pickRows(arg: string): Row[] {
  const kv = Object.fromEntries(arg.trim().split(/\s+/).map((p) => p.split('=') as [string, string]));
  let list = BRANDS;
  if (kv.minor) list = list.filter((b) => kv.minor.split(',').includes(b.minor));
  if (kv.tag) list = list.filter((b) => b.tags.includes(kv.tag));
  if (kv.fund) list = list.filter((b) => kv.fund.split(',').includes(b.fund_band ?? ''));
  if (kv.slugs || kv.slug) {
    const want = (kv.slugs || kv.slug).split(',');
    list = want.map((s) => BRANDS.find((b) => b.slug === s)).filter(Boolean) as typeof BRANDS;
  }
  const rows = list.map(toRow);
  if (!kv.slugs && !kv.slug) rows.sort((a, b) => (a.ini ?? Infinity) - (b.ini ?? Infinity));
  return kv.limit ? rows.slice(0, Number(kv.limit)) : rows;
}

const slugify = (t: string, i: number) => `h-${i + 1}`;

// 条件ページなどに載せる解説（content/<dir>/<slug>.md）。なければ null
export function loadSection(dir: string, slug: string) {
  const f = path.join(ROOT, dir, `${slug}.md`);
  if (!fs.existsSync(f)) return null;
  return renderBody(fs.readFileSync(f, 'utf8'), slug);
}

export function loadGuide(slug: string) {
  return renderBody(fs.readFileSync(path.join(DIR, `${slug}.md`), 'utf8'), slug);
}

function renderBody(raw: string, slug: string) {
  const { meta, body } = parseFront(raw);
  const toc: Toc = [];
  let h2 = 0;
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = marked.Parser.parseInline(tokens);
    if (depth === 2) {
      const id = slugify(text, h2++);
      toc.push({ id, text: text.replace(/<[^>]+>/g, '') });
      return `<h2 id="${id}">${text}</h2>\n`;
    }
    return `<h${depth}>${text}</h${depth}>\n`;
  };
  renderer.link = ({ href, tokens }) => {
    const text = marked.Parser.parseInline(tokens);
    const ext = /^https?:/.test(href) && !href.includes('fc-kurabe.com');
    return `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
  };
  renderer.table = (token) => {
    const head = token.header.map((c) => `<th>${marked.Parser.parseInline(c.tokens)}</th>`).join('');
    const rows = token.rows.map((r) => `<tr>${r.map((c) => `<td>${marked.Parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('');
    return `<div class="tableWrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
  };
  renderer.paragraph = ({ tokens }) => {
    const html = marked.Parser.parseInline(tokens);
    return html.startsWith('出典：') ? `<p class="source">${html}</p>\n` : `<p>${html}</p>\n`;
  };
  const blocks: Block[] = [];
  const parts = body.split(/^\[\[(brands?|table)\s+([^\]]*)\]\]\s*$/m);
  // split の結果は [md, kind, arg, md, kind, arg, md ...]
  for (let i = 0; i < parts.length; i += 3) {
    const md = parts[i];
    if (md.trim()) blocks.push({ kind: 'html', html: marked.parse(md, { renderer, async: false }) as string });
    if (i + 2 < parts.length) {
      const rows = pickRows(parts[i + 2]);
      if (rows.length) blocks.push(parts[i + 1] === 'table' ? { kind: 'table', rows } : { kind: 'brands', rows, layout: parts[i + 1] === 'brand' ? 'row' : 'tile' });
    }
  }
  return { meta: toMeta(slug, meta), blocks, toc };
}

// 業種ページ・本部ページから関連する開業ガイドを引く
export function guidesFor(minor?: string, major?: string) {
  return allGuides().filter((g) => (minor && g.minor?.split(',').includes(minor)) || (!g.minor && major && g.major === major));
}
