import BrandTable from '../../components/BrandTable';
import Layout from '../../components/Layout';
import { BRANDS, META, Row, toRow } from '../../lib/data';
import s from '../../styles/Home.module.css';

export default function FundPage({ band, name, rows }: { band: string; name: string; rows: Row[] }) {
  return (
    <Layout
      title={`開業資金${name}のフランチャイズ一覧（${rows.length}件）`}
      description={`開業資金${name}で始められるフランチャイズ本部${rows.length}件を、加盟金・ロイヤリティ・契約期間で比較。`}
      crumbs={[{ href: '/shikin/', label: '資金から探す' }, { href: `/shikin/${band}/`, label: name }]}
    >
      <p className={s.pr}>PR</p>
      <h1 className={s.h1}>開業資金{name}のフランチャイズ</h1>
      <BrandTable rows={rows} initialSort="ini" />
    </Layout>
  );
}

export async function getStaticPaths() {
  return { paths: META.funds.map((f) => ({ params: { band: f.slug } })), fallback: false };
}

export async function getStaticProps({ params }: { params: { band: string } }) {
  const f = META.funds.find((x) => x.slug === params.band)!;
  return { props: { band: f.slug, name: f.name, rows: BRANDS.filter((b) => b.fund_band === f.slug).map(toRow) } };
}
