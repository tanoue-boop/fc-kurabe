import BrandTable from '../../../components/BrandTable';
import Layout from '../../../components/Layout';
import { BRANDS, META, MINOR_MIN, Row, minorsOf, toRow } from '../../../lib/data';
import s from '../../../styles/Home.module.css';

type Props = { major: string; majorName: string; minor: string; name: string; rows: Row[] };

export default function MinorPage({ major, majorName, minor, name, rows }: Props) {
  return (
    <Layout
      title={`${name}のフランチャイズ一覧・比較（${rows.length}件）`}
      description={`${name}のフランチャイズ本部${rows.length}件を、開業資金・加盟金・ロイヤリティ・契約期間で比較。金額は公式ページの表示を出典付きで掲載。`}
      crumbs={[
        { href: '/gyoshu/', label: '業種から探す' },
        { href: `/gyoshu/${major}/`, label: majorName },
        { href: `/gyoshu/${major}/${minor}/`, label: name },
      ]}
    >
      <p className={s.pr}>PR</p>
      <h1 className={s.h1}>{name}のフランチャイズ一覧・比較</h1>
      <BrandTable rows={rows} />
    </Layout>
  );
}

export async function getStaticPaths() {
  const majors = [...new Set(BRANDS.map((b) => b.major))];
  const paths = majors.flatMap((major) =>
    minorsOf(major).filter((m) => m.count >= MINOR_MIN).map((m) => ({ params: { major, minor: m.slug } })),
  );
  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { major: string; minor: string } }) {
  const list = BRANDS.filter((b) => b.major === params.major && b.minor === params.minor);
  return {
    props: {
      major: params.major,
      majorName: META.majors[params.major],
      minor: params.minor,
      name: list[0].minor_name,
      rows: list.map(toRow),
    },
  };
}
