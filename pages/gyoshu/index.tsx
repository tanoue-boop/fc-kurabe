import Link from 'next/link';
import Layout from '../../components/Layout';
import { MINOR_MIN, majorsWithCount, minorsOf } from '../../lib/data';
import s from '../../styles/Home.module.css';

type M = { slug: string; name: string; count: number; minors: { slug: string; name: string; count: number }[] };

export default function GyoshuIndex({ majors }: { majors: M[] }) {
  return (
    <Layout title="業種から探す" description="フランチャイズ本部を業種から探す。飲食、教育、フィットネス、生活サービス、買取・小売、介護などの業種別一覧。" crumbs={[{ href: '/gyoshu/', label: '業種から探す' }]}>
      <p className={s.pr}>PR</p>
      <h1 className={s.h1}>業種からフランチャイズを探す</h1>
      <div className={s.grid}>
        {majors.map((m) => (
          <div key={m.slug} className={s.card}>
            <Link href={`/gyoshu/${m.slug}/`} className={s.cardTitle}>{m.name}<span>{m.count}件</span></Link>
            <ul className={s.minorList}>
              {m.minors.map((mi) => (
                <li key={mi.slug}>
                  {mi.count >= MINOR_MIN ? <Link href={`/gyoshu/${m.slug}/${mi.slug}/`}>{mi.name}</Link> : mi.name}（{mi.count}）
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  return { props: { majors: majorsWithCount().map((m) => ({ ...m, minors: minorsOf(m.slug) })) } };
}
