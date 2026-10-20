import Link from 'next/link';
import Layout, { PageHead } from '../../components/Layout';
import { allGuides } from '../../lib/guide';
import type { GuideMeta } from '../../lib/guide';
import s from '../../styles/Guide.module.css';

export default function GuideIndex({ guides }: { guides: GuideMeta[] }) {
  return (
    <Layout
      title="業種別の開業ガイド"
      description="ハウスクリーニング・結婚相談所など、業種ごとの開業の始め方・必要な資金・資格・本部の選び方をまとめています。"
      crumbs={[{ href: '/guide/', label: '開業ガイド' }]}
    >
      <PageHead photo="/img/hero.jpg" title="業種別の開業ガイド" lead="業種ごとに、始め方・必要な資金・資格・本部の選び方をまとめています。" />
      <ul className={s.cards}>
        {guides.map((g) => (
          <li key={g.slug}>
            <Link href={`/guide/${g.slug}/`}>
              <img src={g.photo} alt="" loading="lazy" width={480} height={320} />
              <strong>{g.title}</strong>
              <span>{g.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

export async function getStaticProps() {
  return { props: { guides: allGuides() } };
}
