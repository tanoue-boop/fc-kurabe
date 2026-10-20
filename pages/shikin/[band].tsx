import BrandTable from '../../components/BrandTable';
import FundRuler from '../../components/FundRuler';
import Layout, { PageHead } from '../../components/Layout';
import { BRANDS, META, toRow } from '../../lib/data';
import type { Row } from '../../lib/data';
import s from '../../styles/List.module.css';

type Props = { band: string; name: string; rows: Row[]; counts: Record<string, number> };

export default function FundPage({ band, name, rows, counts }: Props) {
  return (
    <Layout
      title={`開業資金${name}のフランチャイズ一覧（${rows.length}件）`}
      description={`開業資金${name}のフランチャイズ本部${rows.length}件を、加盟金・ロイヤリティ・契約期間で比べられます。`}
      crumbs={[{ href: '/shikin/', label: '開業資金から探す' }, { href: `/shikin/${band}/`, label: name }]}
    >
      <PageHead title={`開業資金${name}のフランチャイズ`} lead={`公表されている開業資金が${name}の本部${rows.length}件です。開業資金が低い順に並べています。`} />
      <div className={s.fundIntro}>
        <FundRuler counts={counts} current={band} />
      </div>
      <BrandTable rows={rows} initialSort="ini" />
    </Layout>
  );
}

export async function getStaticPaths() {
  return { paths: META.funds.map((f) => ({ params: { band: f.slug } })), fallback: false };
}

export async function getStaticProps({ params }: { params: { band: string } }) {
  const f = META.funds.find((x) => x.slug === params.band)!;
  const counts = Object.fromEntries(META.funds.map((x) => [x.slug, BRANDS.filter((b) => b.fund_band === x.slug).length]));
  return { props: { band: f.slug, name: f.name, rows: BRANDS.filter((b) => b.fund_band === f.slug).map(toRow), counts } };
}
