import Link from 'next/link';
import Layout from '../../components/Layout';
import { BRANDS, META } from '../../lib/data';
import s from '../../styles/Home.module.css';

export default function FundIndex({ funds }: { funds: { slug: string; name: string; count: number }[] }) {
  return (
    <Layout title="開業資金から探す" description="開業資金100万円以下から1,000万円超まで、資金帯別にフランチャイズ本部を探す。" crumbs={[{ href: '/shikin/', label: '資金から探す' }]}>
      <p className={s.pr}>PR</p>
      <h1 className={s.h1}>開業資金からフランチャイズを探す</h1>
      <div className={s.chips}>
        {funds.map((f) => (
          <Link key={f.slug} href={`/shikin/${f.slug}/`} className={s.chip}>{f.name}<span>{f.count}件</span></Link>
        ))}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  return { props: { funds: META.funds.map((f) => ({ ...f, count: BRANDS.filter((b) => b.fund_band === f.slug).length })) } };
}
