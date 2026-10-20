// ブラウザ側でも使う表示用の関数・定数。data/brands.json を読み込まないこと（クライアントの容量が増えるため）

export const SITE_NAME = 'フランチャイズくらべ';

// 開業資金の帯。data-src/normalize.py の fund_band と同じ並び・slug にそろえる
export const FUNDS = [
  { slug: 'under-100', name: '100万円以下', short: '〜100万' },
  { slug: '100-300', name: '101〜300万円', short: '〜300万' },
  { slug: '300-500', name: '301〜500万円', short: '〜500万' },
  { slug: '500-1000', name: '501〜1,000万円', short: '〜1,000万' },
  { slug: 'over-1000', name: '1,000万円超', short: '1,000万超' },
] as const;

export function fundIndex(band: string | null | undefined) {
  return band ? FUNDS.findIndex((f) => f.slug === band) : -1;
}

export function yen(v: number | null | undefined) {
  if (v === null || v === undefined) return null;
  if (v === 0) return '0円';
  if (v >= 100_000_000) {
    const oku = v / 100_000_000;
    return `${Number.isInteger(oku) ? oku : oku.toFixed(2).replace(/0$/, '')}億円`;
  }
  if (v >= 10000) {
    const man = v / 10000;
    return `${Number.isInteger(man) ? man.toLocaleString() : man.toFixed(1)}万円`;
  }
  return `${v.toLocaleString()}円`;
}

// こだわり条件の表示名（data/brands.json の meta.tags と同じ）
export const TAG_NAMES: Record<string, string> = {
  fukugyo: '副業から始められる',
  mikeiken: '未経験から始められる',
  hitori: '1人で開業できる',
  josei: '女性が活躍',
  mutenpo: '無店舗・自宅で開業',
  houjin: '法人の新規事業向け',
  zaikonashi: '在庫なし',
  senior: '40代・定年後から',
  fuufu: '夫婦で開業',
  teishikin: '低資金で開業',
  'menu-add': '既存店舗にメニュー追加',
};

// 業種の写真。小分類ごとに1枚、大分類は代表の小分類の写真を使う
export const MAJOR_PHOTO: Record<string, string> = {
  food: 'restaurant',
  education: 'juku',
  'fitness-beauty': 'pilates',
  'life-service': 'house-cleaning',
  retail: 'kaitori',
  care: 'care',
  repair: 'reform',
  business: 'other',
};
// 本部が多い業種は写真を複数用意し、本部ごとに振り分ける（同じ写真が続かないように）
export const PHOTO_VARIANTS: Record<string, number> = {
  pilates: 3, other: 3, restaurant: 3, juku: 2, 'house-cleaning': 2, benriya: 2, kaitori: 2,
};
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
export const minorPhoto = (minor: string, slug?: string) => {
  const n = PHOTO_VARIANTS[minor] ?? 1;
  const v = slug && n > 1 ? hash(slug) % n : 0;
  return v === 0 ? `/img/gyoshu/${minor}.jpg` : `/img/gyoshu/${minor}-${v + 1}.jpg`;
};
export const majorPhoto = (major: string) => minorPhoto(MAJOR_PHOTO[major] ?? 'other');
