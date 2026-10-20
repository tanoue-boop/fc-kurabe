import Link from 'next/link';
import BrandList from '../../components/BrandList';
import Layout, { PageHead } from '../../components/Layout';
import { BRANDS, META, toRow } from '../../lib/data';
import type { Row } from '../../lib/data';
import s from '../../styles/List.module.css';

type T = { slug: string; name: string; count: number };

// 条件名に「フランチャイズ」を付けると不自然になるものは見出しを個別に決める
const HEADINGS: Record<string, string> = {
  josei: '女性が活躍しているフランチャイズ',
  mutenpo: '無店舗・自宅で開業できるフランチャイズ',
  zaikonashi: '在庫を持たずに始められるフランチャイズ',
  senior: '40代・定年後から始められるフランチャイズ',
  fuufu: '夫婦で開業できるフランチャイズ',
  teishikin: '低資金で開業できるフランチャイズ',
  'menu-add': '既存店舗にメニューを追加できるフランチャイズ',
};
const heading = (slug: string, name: string) => HEADINGS[slug] ?? `${name}フランチャイズ`;

export default function TagPage({ tag, name, rows, others }: { tag: string; name: string; rows: Row[]; others: T[] }) {
  return (
    <Layout
      title={`${heading(tag, name)}一覧（${rows.length}件）`}
      description={`${heading(tag, name)}${rows.length}件を、開業資金・加盟金・ロイヤリティで比べられます。`}
      crumbs={[{ href: '/tag/', label: '条件から探す' }, { href: `/tag/${tag}/`, label: name }]}
    >
      <PageHead photo="/img/hero.jpg" title={heading(tag, name)} lead={`「${name}」に当てはまる本部${rows.length}件を、開業資金・加盟金・ロイヤリティで比べられます。`} />
      <nav className={s.subNav} aria-label="ほかの条件">
        <p className={s.subNavLabel}>ほかの条件</p>
        <ul className={s.chips}>
          {others.map((t) => (
            <li key={t.slug}>
              <Link href={`/tag/${t.slug}/`} className={s.chip} aria-current={t.slug === tag ? 'page' : undefined}>
                {t.name}<span className="num">{t.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <BrandList rows={rows} />
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
  const others = Object.entries(META.tags)
    .map(([slug, name]) => ({ slug, name, count: BRANDS.filter((b) => b.tags.includes(slug)).length }))
    .filter((t) => t.count > 0);
  return {
    props: {
      tag: params.tag,
      name: META.tags[params.tag],
      rows: BRANDS.filter((b) => b.tags.includes(params.tag)).map(toRow),
      others,
    },
  };
}
