import Link from 'next/link';
import s from '../styles/FundRuler.module.css';

// 開業資金の帯。グラフは使わず、金額そのものを大きく見せる
const BANDS = [
  { slug: 'under-100', top: '〜100', unit: '万円', sub: '100万円以下' },
  { slug: '100-300', top: '〜300', unit: '万円', sub: '101〜300万円' },
  { slug: '300-500', top: '〜500', unit: '万円', sub: '301〜500万円' },
  { slug: '500-1000', top: '〜1,000', unit: '万円', sub: '501〜1,000万円' },
  { slug: 'over-1000', top: '1,000', unit: '万円〜', sub: '1,000万円超' },
];

export default function FundRuler({ counts, current }: { counts: Record<string, number>; current?: string }) {
  return (
    <ul className={s.cards}>
      {BANDS.map((b) => (
        <li key={b.slug}>
          <Link href={`/shikin/${b.slug}/`} className={s.card} aria-current={current === b.slug ? 'page' : undefined} aria-label={`開業資金${b.sub}（${counts[b.slug] ?? 0}本部）`}>
            <span className={s.label}>開業資金</span>
            <span className={s.amount}>
              <span className="num">{b.top}</span>
              <small>{b.unit}</small>
            </span>
            <span className={s.foot}>
              <span>{b.sub}</span>
              <span className={s.count}><span className="num">{counts[b.slug] ?? 0}</span>本部</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
