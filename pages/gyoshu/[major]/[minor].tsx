import Link from 'next/link';
import BrandTable from '../../../components/BrandTable';
import Layout, { PageHead } from '../../../components/Layout';
import { BRANDS, META, MINOR_MIN, minorsOf, toRow } from '../../../lib/data';
import type { Row } from '../../../lib/data';
import s from '../../../styles/List.module.css';

type Sib = { slug: string; name: string; count: number };
type Props = { major: string; majorName: string; minor: string; name: string; rows: Row[]; siblings: Sib[] };

export default function MinorPage({ major, majorName, minor, name, rows, siblings }: Props) {
  return (
    <Layout
      title={`${name}のフランチャイズ一覧・比較（${rows.length}件）`}
      description={`${name}のフランチャイズ本部${rows.length}件を、開業資金・加盟金・ロイヤリティ・契約期間で比べられます。金額は公式ページなどの表示を出典付きで掲載しています。`}
      crumbs={[
        { href: '/gyoshu/', label: '業種から探す' },
        { href: `/gyoshu/${major}/`, label: majorName },
        { href: `/gyoshu/${major}/${minor}/`, label: name },
      ]}
    >
      <PageHead title={`${name}のフランチャイズ一覧・比較`} lead={`${name}のフランチャイズ本部${rows.length}件を、開業資金・加盟金・ロイヤリティで比べられます。`} />
      {siblings.length > 1 && (
        <nav className={s.subNav} aria-label={`${majorName}の詳しい業種`}>
          <p className={s.subNavLabel}>{majorName}のほかの業種</p>
          <ul className={s.chips}>
            {siblings.map((m) => (
              <li key={m.slug}>
                <Link href={`/gyoshu/${major}/${m.slug}/`} className={s.chip} aria-current={m.slug === minor ? 'page' : undefined}>
                  {m.name}<span className="num">{m.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
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
      siblings: minorsOf(params.major).filter((m) => m.count >= MINOR_MIN),
    },
  };
}
