import Link from 'next/link';
import BrandTable from '../../../components/BrandTable';
import Layout from '../../../components/Layout';
import { BRANDS, META, MINOR_MIN, Row, minorsOf, toRow } from '../../../lib/data';
import s from '../../../styles/Home.module.css';

type Props = { major: string; name: string; rows: Row[]; minors: { slug: string; name: string; count: number }[] };

export default function MajorPage({ major, name, rows, minors }: Props) {
  return (
    <Layout
      title={`${name}のフランチャイズ一覧・比較`}
      description={`${name}のフランチャイズ本部${rows.length}件を、開業資金・加盟金・ロイヤリティ・契約期間で比較。`}
      crumbs={[{ href: '/gyoshu/', label: '業種から探す' }, { href: `/gyoshu/${major}/`, label: name }]}
    >
      <p className={s.pr}>PR</p>
      <h1 className={s.h1}>{name}のフランチャイズ一覧・比較</h1>
      <div className={s.chips}>
        {minors.map((m) =>
          m.count >= MINOR_MIN ? (
            <Link key={m.slug} href={`/gyoshu/${major}/${m.slug}/`} className={s.chip}>{m.name}<span>{m.count}件</span></Link>
          ) : (
            <span key={m.slug} className={s.chipOff}>{m.name}<span>{m.count}件</span></span>
          ),
        )}
      </div>
      <BrandTable rows={rows} />
    </Layout>
  );
}

export async function getStaticPaths() {
  const majors = [...new Set(BRANDS.map((b) => b.major))];
  return { paths: majors.map((major) => ({ params: { major } })), fallback: false };
}

export async function getStaticProps({ params }: { params: { major: string } }) {
  const rows = BRANDS.filter((b) => b.major === params.major).map(toRow);
  return { props: { major: params.major, name: META.majors[params.major], rows, minors: minorsOf(params.major) } };
}
