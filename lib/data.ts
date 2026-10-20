import raw from '../data/brands.json';

export type Exit = { type: 'own' | 'a8' | 'bm' | 'official'; label: string; url: string };
export type Brand = {
  slug: string;
  brand: string;
  company: string | null;
  major: string;
  minor: string;
  minor_name: string;
  contract_type: string | null;
  tags: string[];
  franchise_fee_text: string | null;
  initial_investment_text: string | null;
  royalty_text: string | null;
  contract_term_text: string | null;
  deposit_text: string | null;
  training_fee_text: string | null;
  self_funds_text: string | null;
  store_count_text: string | null;
  recruit_area: string | null;
  target: string | null;
  official_fc_url: string | null;
  source_type: string | null;
  checked_date: string | null;
  notes: string | null;
  is_own: boolean | null;
  franchise_fee_yen: number | null;
  initial_investment_yen: number | null;
  royalty: { type: 'rate' | 'fixed' | 'mixed' | 'none' | 'other' | null; rate: number | null; fixed_yen: number | null };
  fund_band: string | null;
  exits: Exit[];
  monetized: boolean;
};

type Meta = {
  majors: Record<string, string>;
  tags: Record<string, string>;
  funds: { slug: string; name: string }[];
};

import { yen } from './format';
export { SITE_NAME, yen } from './format';

const data = raw as unknown as { meta: Meta; brands: Brand[] };

// 調査時に付けた出典ドメインの注記（例：［example.co.jp］）は画面に出さない
const SRC_NOTE = /\s*[［\[][^］\]]*\.(?:jp|com|net|co\.jp)[^］\]]*[］\]]/g;
const TEXT_KEYS = ['franchise_fee_text', 'initial_investment_text', 'royalty_text', 'contract_term_text', 'deposit_text', 'training_fee_text', 'self_funds_text', 'store_count_text', 'recruit_area', 'target'] as const;
for (const b of data.brands) {
  for (const k of TEXT_KEYS) {
    const v = b[k];
    if (typeof v === 'string') (b as Record<string, unknown>)[k] = v.replace(SRC_NOTE, '');
  }
}
export const META = data.meta;
export const BRANDS: Brand[] = data.brands;

// 中分類は掲載5本部以上で独立ページにする（未満は大分類ページの中にまとめる）
export const MINOR_MIN = 5;

export function minorsOf(major: string) {
  const map = new Map<string, { slug: string; name: string; count: number }>();
  for (const b of BRANDS.filter((x) => x.major === major)) {
    const m = map.get(b.minor) || { slug: b.minor, name: b.minor_name, count: 0 };
    m.count += 1;
    map.set(b.minor, m);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function majorsWithCount() {
  return Object.entries(META.majors)
    .map(([slug, name]) => ({ slug, name, count: BRANDS.filter((b) => b.major === slug).length }))
    .filter((m) => m.count > 0);
}

export function royaltyShort(b: Brand) {
  const r = b.royalty;
  if (!r || r.type === null) return null;
  if (r.type === 'none') return 'なし';
  if (r.type === 'other') return '条件により変動';
  if (r.type === 'rate') return `売上の${r.rate}%`;
  if (r.type === 'fixed') return `定額 ${yen(r.fixed_yen)}`;
  return `${r.rate}%＋${yen(r.fixed_yen)}`;
}

// 一覧・検索用に軽量化したデータ
export function toRow(b: Brand) {
  return {
    slug: b.slug,
    brand: b.brand,
    major: b.major,
    minor: b.minor,
    minor_name: b.minor_name,
    contract_type: b.contract_type,
    tags: b.tags,
    fee: b.franchise_fee_yen,
    ini: b.initial_investment_yen,
    roy: royaltyShort(b),
    royRate: b.royalty?.type === 'rate' ? b.royalty.rate : b.royalty?.type === 'none' ? 0 : null,
    term: b.contract_term_text,
    fund: b.fund_band,
    own: !!b.is_own,
    // 資料請求・問い合わせの窓口がある（公式サイトへのリンクだけではない）
    req: b.exits.some((e) => e.type !== 'official'),
  };
}
export type Row = ReturnType<typeof toRow>;
