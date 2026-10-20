import Link from 'next/link';
import { COMPARE_MAX, useCompare } from '../lib/compare';
import s from '../styles/CompareBar.module.css';

// 比較リストに本部が入っているあいだ、画面下に出すバー
export default function CompareBar() {
  const { list, remove, clear } = useCompare();
  if (list.length === 0) return null;
  const href = `/compare/?b=${list.map((x) => x.slug).join(',')}`;
  return (
    <>
    <div className={s.spacer} aria-hidden="true" />
    <div className={s.bar} role="region" aria-label="比較リスト">
      <div className={s.inner}>
        <p className={s.count}>
          比較リスト <strong className="num">{list.length}</strong>/{COMPARE_MAX}
        </p>
        <ul className={s.items}>
          {list.map((x) => (
            <li key={x.slug}>
              {x.brand}
              <button type="button" onClick={() => remove(x.slug)} aria-label={`${x.brand}を比較リストから外す`}>×</button>
            </li>
          ))}
        </ul>
        <div className={s.actions}>
          <button type="button" className={s.clear} onClick={clear}>すべて外す</button>
          <Link href={href} className={s.go} aria-disabled={list.length < 2}>
            {list.length < 2 ? 'あと1社選ぶと比較できます' : '並べて比較する'}
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
