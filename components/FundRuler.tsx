import Link from 'next/link';
import { FUNDS } from '../lib/format';
import s from '../styles/FundRuler.module.css';

// 開業資金の帯を、資金が増えるほど高くなる階段で並べた入口
export default function FundRuler({ counts, current }: { counts: Record<string, number>; current?: string }) {
  return (
    <ol className={s.ruler}>
      {FUNDS.map((f, i) => (
        <li key={f.slug} className={s.step}>
          <Link href={`/shikin/${f.slug}/`} className={s.link} aria-current={current === f.slug ? 'page' : undefined}>
            <span className={s.bar} style={{ height: `${28 + i * 22}px` }} data-step={i + 1} />
            <span className={s.name}><span className={s.long}>{f.name}</span><span className={s.short}>{f.short}</span></span>
            <span className={s.count}>
              <span className="num">{counts[f.slug] ?? 0}</span>本部
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
