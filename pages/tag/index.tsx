import Link from 'next/link';
import Layout from '../../components/Layout';
import { BRANDS, META } from '../../lib/data';
import s from '../../styles/Home.module.css';

export default function TagIndex({ tags }: { tags: { slug: string; name: string; count: number }[] }) {
  return (
    <Layout title="こだわり条件から探す" description="副業から、未経験から、1人で、無店舗で、など条件別にフランチャイズ本部を探す。" crumbs={[{ href: '/tag/', label: '条件から探す' }]}>
      <p className={s.pr}>PR</p>
      <h1 className={s.h1}>こだわり条件からフランチャイズを探す</h1>
      <div className={s.chips}>
        {tags.map((t) => (
          <Link key={t.slug} href={`/tag/${t.slug}/`} className={s.chip}>{t.name}<span>{t.count}件</span></Link>
        ))}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const tags = Object.entries(META.tags)
    .map(([slug, name]) => ({ slug, name, count: BRANDS.filter((b) => b.tags.includes(slug)).length }))
    .filter((t) => t.count > 0);
  return { props: { tags } };
}
