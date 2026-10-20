import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCompare } from '../lib/compare';
import type { Row } from '../lib/data';
import { yen } from '../lib/format';
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

export default function BrandTable({ rows, initialSort = 'default', current, hideSort }: { rows: Row[]; initialSort?: SortKey; current?: string; hideSort?: boolean }) {
  const [sort, setSort] = useState<SortKey>(initialSort);
  const { has, toggle, full } = useCompare();
  const sorted = useMemo(() => {
    const r = [...rows];
    if (sort === 'ini') r.sort((a, b) => cmp(a.ini, b.ini));
    if (sort === 'fee') r.sort((a, b) => cmp(a.fee, b.fee));
    if (sort === 'roy') r.sort((a, b) => cmp(a.royRate, b.royRate));
    return r;
  }, [rows, sort]);

  return (
    <div className={s.block}>
      {!hideSort && (
      <div className={s.sortBar}>
        <p className={s.total}>
          <strong className="num">{rows.length}</strong>件
        </p>
        <div className={s.sorts} role="group" aria-label="並び替え">
          {SORTS.map((o) => (
            <button key={o.key} type="button" className={s.sortBtn} aria-pressed={sort === o.key} onClick={() => setSort(o.key)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      )}
      <table className={hideSort ? `${s.table} ${s.boxed}` : s.table}>
        <thead>
          <tr>
            <th className={s.colCheck}><span className={s.vh}>比較</span></th>
            <th>本部</th>
            <th>開業資金</th>
            <th>加盟金</th>
            <th>ロイヤリティ</th>
            <th>契約期間</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const on = has(r.slug);
            return (
              <tr key={r.slug} className={r.slug === current ? s.current : on ? s.picked : undefined}>
                <td className={s.colCheck}>
                  <label className={s.check}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={!on && full}
                      onChange={() => toggle({ slug: r.slug, brand: r.brand })}
                    />
                    <span>比較</span>
                  </label>
                </td>
                <td className={s.name}>
                  <Link href={`/brand/${r.slug}/`}>{r.brand}</Link>
                  <span className={s.kind}>{r.minor_name}</span>
                </td>
                <td className={s.money} data-label="開業資金">
                  <span className="num">{yen(r.ini) ?? '—'}</span>
                </td>
                <td className={s.cell} data-label="加盟金"><span className="num">{yen(r.fee) ?? '—'}</span></td>
                <td className={s.cell} data-label="ロイヤリティ">{r.roy ?? '—'}</td>
                <td className={s.cell} data-label="契約期間">{r.term ?? '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!hideSort && (
        <p className={s.note}>
          「—」は、公式ページや掲載媒体で金額を確認できなかった項目です。金額の内訳と出典は各本部のページに載せています。
          {full && ' 比較リストは4社までです。'}
        </p>
      )}
    </div>
  );
}
