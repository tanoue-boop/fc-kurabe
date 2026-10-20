import Link from 'next/link';
import { useCompare } from '../lib/compare';
import type { Row } from '../lib/data';
import { TAG_NAMES, minorPhoto, yen } from '../lib/format';
import s from '../styles/BrandCard.module.css';
import FundMeter from './FundMeter';

// 一覧の1本部ぶん。写真＋金額3つ＋比較ボタン
export default function BrandCard({ r, layout = 'row' }: { r: Row; layout?: 'row' | 'tile' }) {
  const { has, toggle, full } = useCompare();
  const on = has(r.slug);
  const href = `/brand/${r.slug}/`;
  return (
    <article className={`${layout === 'tile' ? s.tile : s.row} ${on ? s.picked : ''}`}>
      <Link href={href} className={s.photo} tabIndex={-1} aria-hidden="true">
        <img src={minorPhoto(r.minor, r.slug)} alt="" loading="lazy" width={480} height={320} />
        <span className={s.kind}>{r.minor_name}</span>
      </Link>
      <div className={s.body}>
        <h3 className={s.name}>
          <Link href={href}>{r.brand}</Link>
        </h3>
        {(r.req || r.royRate === 0 || r.tags.length > 0) && (
          <ul className={s.badges}>
            {r.royRate === 0 && <li className={s.hot}>ロイヤリティなし</li>}
            {r.tags.slice(0, layout === 'tile' ? 2 : 3).map((t) => <li key={t}>{TAG_NAMES[t] ?? t}</li>)}
          </ul>
        )}
        <dl className={s.figs}>
          <div className={s.figMain}>
            <dt>開業資金</dt>
            <dd>
              <strong className="num">{yen(r.ini) ?? '未確認'}</strong>
              <FundMeter band={r.fund} />
            </dd>
          </div>
          <div>
            <dt>加盟金</dt>
            <dd className="num">{yen(r.fee) ?? '—'}</dd>
          </div>
          <div>
            <dt>ロイヤリティ</dt>
            <dd>{r.roy ?? '—'}</dd>
          </div>
        </dl>
        <div className={s.actions}>
          <Link href={href} className={s.more}>詳しく見る</Link>
          <button
            type="button"
            className={s.cmp}
            aria-pressed={on}
            disabled={!on && full}
            onClick={() => toggle({ slug: r.slug, brand: r.brand })}
          >
            {on ? '比較に追加済み' : '比較に追加'}
          </button>
        </div>
      </div>
    </article>
  );
}
