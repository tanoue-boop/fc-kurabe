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
