import Link from 'next/link';
import Layout, { PageHead } from '../../components/Layout';
import MajorIcon from '../../components/MajorIcon';
import { BRANDS, MINOR_MIN, majorsWithCount, minorsOf } from '../../lib/data';
import s from '../../styles/List.module.css';

type M = { slug: string; name: string; count: number; minors: { slug: string; name: string; count: number }[] };

export default function GyoshuIndex({ majors, total }: { majors: M[]; total: number }) {
  return (
    <Layout
      title="業種からフランチャイズを探す"
      description="フランチャイズ本部を業種から探せます。飲食、教育・スクール、フィットネス・美容、生活サービス、買取・小売、介護などの業種別一覧。"
      crumbs={[{ href: '/gyoshu/', label: '業種から探す' }]}
    >
      <PageHead title="業種からフランチャイズを探す" lead={`掲載している${total}本部を、8つの業種と、その中の詳しい業種に分けています。`} />
      <ul className={s.majors}>
        {majors.map((m) => (
          <li key={m.slug} className={s.major}>
            <Link href={`/gyoshu/${m.slug}/`} className={s.majorHead}>
              <span className={s.majorIcon}><MajorIcon major={m.slug} /></span>
              <span className={s.majorName}>{m.name}</span>
              <span className={s.majorCount}><span className="num">{m.count}</span>本部</span>
            </Link>
            <ul className={s.chips}>
              {m.minors.map((mi) =>
                mi.count >= MINOR_MIN ? (
                  <li key={mi.slug}><Link href={`/gyoshu/${m.slug}/${mi.slug}/`} className={s.chip}>{mi.name}<span className="num">{mi.count}</span></Link></li>
                ) : (
                  <li key={mi.slug}><span className={s.chipOff}>{mi.name}<span className="num">{mi.count}</span></span></li>
                ),
              )}
            </ul>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

export async function getStaticProps() {
  const majors = majorsWithCount().sort((a, b) => b.count - a.count).map((m) => ({ ...m, minors: minorsOf(m.slug) }));
  return { props: { majors, total: BRANDS.length } };
}
