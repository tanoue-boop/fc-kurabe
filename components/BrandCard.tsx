import Link from 'next/link';
import { useCompare } from '../lib/compare';
import type { Row } from '../lib/data';
import { TAG_NAMES, yen } from '../lib/format';
import s from '../styles/BrandCard.module.css';

// 一覧の1本部ぶん。「何の事業で、いくらで始められるか」を最初に伝える
export default function BrandCard({ r, layout = 'row' }: { r: Row; layout?: 'row' | 'tile' }) {
  const { has, toggle, full } = useCompare();
  const on = has(r.slug);
  const href = `/brand/${r.slug}/`;
  const badges = [...(r.royRate === 0 ? ['ロイヤリティなし'] : []), ...r.tags.map((t) => TAG_NAMES[t] ?? t)].slice(0, 2);
  return (
    <article className={`${layout === 'tile' ? s.tile : s.row} ${on ? s.picked : ''}`}>
      <Link href={href} className={r.photo ? s.photo : `${s.photo} ${s.noPhoto}`} tabIndex={-1} aria-hidden="true">
        {r.photo ? <img src={r.photo} alt="" loading="lazy" width={480} height={320} /> : <span>{r.minor_name}</span>}
      </Link>
      <div className={s.body}>
        <p className={s.kind}>
          {r.minor_name}
          {r.contract_type && r.contract_type.length <= 8 && <span>{r.contract_type}</span>}
        </p>
        <h3 className={s.name}>
          <Link href={href}>{r.brand}</Link>
        </h3>
        <div className={s.main}>
          <span className={s.mainLabel}>開業資金</span>
          <strong className={`${s.mainValue} num`}>{yen(r.ini) ?? '未確認'}</strong>
        </div>
        <dl className={s.sub}>
          <div><dt>加盟金</dt><dd className="num">{yen(r.fee) ?? '—'}</dd></div>
          <div><dt>ロイヤリティ</dt><dd>{r.roy ?? '—'}</dd></div>
          {layout === 'row' && <div><dt>契約期間</dt><dd>{r.term ?? '—'}</dd></div>}
        </dl>
        {badges.length > 0 && (
          <ul className={s.badges}>
            {badges.map((b) => <li key={b}>{b}</li>)}
          </ul>
        )}
        <div className={s.actions}>
          <Link href={href} className={s.more}>詳細を見る</Link>
          <button
            type="button"
            className={s.cmp}
            aria-pressed={on}
            disabled={!on && full}
            onClick={() => toggle({ slug: r.slug, brand: r.brand })}
          >
            {on ? '比較に追加済み' : '＋ 比較に追加'}
          </button>
        </div>
      </div>
    </article>
  );
}
