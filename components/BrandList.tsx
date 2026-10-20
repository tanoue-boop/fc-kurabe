import { useMemo, useState } from 'react';
import type { Row } from '../lib/data';
import s from '../styles/BrandList.module.css';
import BrandCard from './BrandCard';
import BrandTable from './BrandTable';

type SortKey = 'default' | 'ini' | 'fee' | 'roy';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'default', label: '標準' },
  { key: 'ini', label: '開業資金が低い順' },
  { key: 'fee', label: '加盟金が低い順' },
  { key: 'roy', label: 'ロイヤリティ率が低い順' },
];

function cmp(a: number | null, b: number | null) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

// 一覧ページ用。写真付きカードで見せ、表に切り替えて数字だけを並べることもできる
export default function BrandList({ rows, initialSort = 'default' }: { rows: Row[]; initialSort?: SortKey }) {
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [view, setView] = useState<'card' | 'table'>('card');
  const sorted = useMemo(() => {
    const r = [...rows];
    if (sort === 'ini') r.sort((a, b) => cmp(a.ini, b.ini));
    if (sort === 'fee') r.sort((a, b) => cmp(a.fee, b.fee));
    if (sort === 'roy') r.sort((a, b) => cmp(a.royRate, b.royRate));
    return r;
  }, [rows, sort]);

  return (
    <div className={s.wrap}>
      <div className={s.bar}>
        <p className={s.total}><strong className="num">{rows.length}</strong>件の本部</p>
        <label className={s.sort}>
          <span>並び替え</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORTS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </label>
        <div className={s.view} role="group" aria-label="表示の切り替え">
          <button type="button" aria-pressed={view === 'card'} onClick={() => setView('card')}>写真で見る</button>
          <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>表で比べる</button>
        </div>
      </div>
      {view === 'card' ? (
        <div className={s.list}>
          {sorted.map((r) => <BrandCard key={r.slug} r={r} />)}
        </div>
      ) : (
        <BrandTable rows={sorted} hideSort />
      )}
      <p className={s.note}>「—」「未確認」は、公式ページや掲載媒体で金額を確認できなかった項目です。写真は業種のイメージで、各本部の店舗ではありません。</p>
    </div>
  );
}
