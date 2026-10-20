import BrandTable from '../../components/BrandTable';
import Layout from '../../components/Layout';
import { BRANDS, META, Row, toRow } from '../../lib/data';
import s from '../../styles/Home.module.css';

export default function TagPage({ tag, name, rows }: { tag: string; name: string; rows: Row[] }) {
  return (
    <Layout
      title={`${name}フランチャイズ一覧（${rows.length}件）`}
      description={`${name}フランチャイズ本部${rows.length}件を、開業資金・加盟金・ロイヤリティで比較。`}
      crumbs={[{ href: '/tag/', label: '条件から探す' }, { href: `/tag/${tag}/`, label: name }]}
    >
      <p className={s.pr}>PR</p>
      <h1 className={s.h1}>{name}フランチャイズ</h1>
      <BrandTable rows={rows} />
    </Layout>
  );
}

// 掲載0件の条件ページは作らない
export async function getStaticPaths() {
  const paths = Object.keys(META.tags)
    .filter((t) => BRANDS.some((b) => b.tags.includes(t)))
    .map((tag) => ({ params: { tag } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { tag: string } }) {
  return { props: { tag: params.tag, name: META.tags[params.tag], rows: BRANDS.filter((b) => b.tags.includes(params.tag)).map(toRow) } };
}
