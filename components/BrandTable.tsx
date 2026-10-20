import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Row, yen } from '../lib/data';
import s from '../styles/Table.module.css';

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

export default function BrandTable({ rows, initialSort = 'default' }: { rows: Row[]; initialSort?: SortKey }) {
  const [sort, setSort] = useState<SortKey>(initialSort);
  const sorted = useMemo(() => {
    const r = [...rows];
    if (sort === 'ini') r.sort((a, b) => cmp(a.ini, b.ini));
    if (sort === 'fee') r.sort((a, b) => cmp(a.fee, b.fee));
    if (sort === 'roy') r.sort((a, b) => cmp(a.royRate, b.royRate));
    return r;
  }, [rows, sort]);

  return (
    <div>
      <div className={s.sortBar}>
        <span>{rows.length}件</span>
        <div className={s.sorts}>
          {SORTS.map((o) => (
            <button key={o.key} className={sort === o.key ? s.sortOn : s.sortBtn} onClick={() => setSort(o.key)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className={s.wrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>本部</th>
              <th>業種</th>
              <th>開業資金</th>
              <th>加盟金</th>
              <th>ロイヤリティ</th>
              <th>契約期間</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.slug}>
                <td className={s.name}>
                  <Link href={`/brand/${r.slug}/`}>{r.brand}</Link>
                </td>
                <td>{r.minor_name}</td>
                <td className={s.num}>{yen(r.ini) ?? '—'}</td>
                <td className={s.num}>{yen(r.fee) ?? '—'}</td>
                <td>{r.roy ?? '—'}</td>
                <td>{r.term ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={s.note}>「—」は公式・掲載媒体で金額を確認できなかった項目です。金額の詳細と出典は各本部のページに記載しています。</p>
    </div>
  );
}
