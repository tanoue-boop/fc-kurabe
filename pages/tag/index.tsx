import Link from 'next/link';
import Layout, { PageHead } from '../../components/Layout';
import { BRANDS, META } from '../../lib/data';
import s from '../../styles/List.module.css';

export default function TagIndex({ tags }: { tags: { slug: string; name: string; count: number }[] }) {
  return (
    <Layout
      title="こだわり条件からフランチャイズを探す"
      description="副業から、未経験から、1人で、無店舗・自宅で、など、働き方や始め方の条件でフランチャイズ本部を探せます。"
      crumbs={[{ href: '/tag/', label: '条件から探す' }]}
    >
      <PageHead title="こだわり条件からフランチャイズを探す" lead="働き方や始め方の条件ごとに、当てはまる本部をまとめています。" />
      <ul className={s.tagList}>
        {tags.map((t) => (
          <li key={t.slug}>
            <Link href={`/tag/${t.slug}/`}>
              {t.name}
              <span className={s.count}><span className="num">{t.count}</span>本部</span>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

export async function getStaticProps() {
  const tags = Object.entries(META.tags)
    .map(([slug, name]) => ({ slug, name, count: BRANDS.filter((b) => b.tags.includes(slug)).length }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);
  return { props: { tags } };
}
