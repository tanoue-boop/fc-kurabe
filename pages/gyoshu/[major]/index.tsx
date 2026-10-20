import GuideLinks from '../../../components/GuideLinks';
import { allGuides } from '../../../lib/guide';
import type { GuideMeta } from '../../../lib/guide';
import Link from 'next/link';
import BrandList from '../../../components/BrandList';
import Layout, { PageHead } from '../../../components/Layout';
import { BRANDS, META, MINOR_MIN, minorsOf, toRow } from '../../../lib/data';
import type { Row } from '../../../lib/data';
import { majorPhoto } from '../../../lib/format';
import s from '../../../styles/List.module.css';

type Props = { major: string; name: string; rows: Row[]; minors: { slug: string; name: string; count: number }[]; guides: GuideMeta[] };

export default function MajorPage({ major, name, rows, minors, guides }: Props) {
  return (
    <Layout
      title={`${name}のフランチャイズ一覧・比較`}
      description={`${name}のフランチャイズ本部${rows.length}件を、開業資金・加盟金・ロイヤリティ・契約期間で比べられます。`}
      crumbs={[{ href: '/gyoshu/', label: '業種から探す' }, { href: `/gyoshu/${major}/`, label: name }]}
    >
      <PageHead photo={majorPhoto(major)} title={`${name}のフランチャイズ一覧・比較`} lead={`${name}のフランチャイズ本部${rows.length}件を、開業資金・加盟金・ロイヤリティで比べられます。`} />
      {minors.length > 1 && (
        <nav className={s.subNav} aria-label="詳しい業種">
          <p className={s.subNavLabel}>詳しい業種で絞る</p>
          <ul className={s.chips}>
            {minors.map((m) =>
              m.count >= MINOR_MIN ? (
                <li key={m.slug}><Link href={`/gyoshu/${major}/${m.slug}/`} className={s.chip}>{m.name}<span className="num">{m.count}</span></Link></li>
              ) : (
                <li key={m.slug}><span className={s.chipOff}>{m.name}<span className="num">{m.count}</span></span></li>
              ),
            )}
          </ul>
        </nav>
      )}
      <GuideLinks guides={guides} />
      <BrandList rows={rows} />
    </Layout>
  );
}

export async function getStaticPaths() {
  const majors = [...new Set(BRANDS.map((b) => b.major))];
  return { paths: majors.map((major) => ({ params: { major } })), fallback: false };
}

export async function getStaticProps({ params }: { params: { major: string } }) {
  const rows = BRANDS.filter((b) => b.major === params.major).map(toRow);
  const minors = minorsOf(params.major);
  const guides = allGuides().filter((g) => g.major === params.major || minors.some((m) => g.minor?.split(',').includes(m.slug)));
  return { props: { major: params.major, name: META.majors[params.major], rows, minors, guides } };
}
