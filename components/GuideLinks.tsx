import Link from 'next/link';
import type { GuideMeta } from '../lib/guide';
import s from '../styles/GuideLinks.module.css';

// 業種ページ・本部ページに置く「開業ガイド」への導線
export default function GuideLinks({ guides }: { guides: Pick<GuideMeta, 'slug' | 'title' | 'photo' | 'description'>[] }) {
  if (!guides.length) return null;
  return (
    <div className={s.box}>
      {guides.map((g) => (
        <Link key={g.slug} href={`/guide/${g.slug}/`} className={s.link}>
          <img src={g.photo} alt="" loading="lazy" width={240} height={160} />
          <span className={s.text}>
            <span className={s.kicker}>開業ガイド</span>
            <strong>{g.title}</strong>
            <span className={s.desc}>{g.description}</span>
          </span>
          <span className={s.arrow} aria-hidden="true">›</span>
        </Link>
      ))}
    </div>
  );
}
