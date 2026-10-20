import Link from 'next/link';
import BrandCard from '../../components/BrandCard';
import BrandTable from '../../components/BrandTable';
import Layout, { PageHead } from '../../components/Layout';
import { allGuides, guideSlugs, loadGuide } from '../../lib/guide';
import type { Block, GuideMeta, Toc } from '../../lib/guide';
import s from '../../styles/Guide.module.css';

type Props = { meta: GuideMeta; blocks: Block[]; toc: Toc; others: GuideMeta[] };

export default function GuidePage({ meta, blocks, toc, others }: Props) {
  return (
    <Layout
      title={meta.title}
      description={meta.description}
      crumbs={[{ href: '/guide/', label: '開業ガイド' }, { href: `/guide/${meta.slug}/`, label: meta.title }]}
    >
      <PageHead photo={meta.photo} title={meta.title} lead={meta.lead} />
      <div className={others.length ? s.wrap : s.single}>
        <article className={s.article}>
          <p className={s.updated}>最終更新 {meta.updated.replace(/-/g, '.')}</p>
          {toc.length > 2 && (
            <nav className={s.toc} aria-label="目次">
              <p className={s.tocTitle}>目次</p>
              <ol>
                {toc.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.text}</a></li>)}
              </ol>
            </nav>
          )}
          {blocks.map((b, i) =>
            b.kind === 'html' ? (
              <div key={i} className={s.body} dangerouslySetInnerHTML={{ __html: b.html }} />
            ) : b.kind === 'table' ? (
              <div key={i} className={s.table}><BrandTable rows={b.rows} hideSort /></div>
            ) : (
              <div key={i} className={b.layout === 'tile' ? s.tiles : s.rows}>
                {b.rows.map((r) => <BrandCard key={r.slug} r={r} layout={b.layout} />)}
              </div>
            ),
          )}
        </article>
        {others.length > 0 && (
          <aside className={s.others}>
            <h2 className={s.othersTitle}>ほかの開業ガイド</h2>
            <ul>
              {others.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guide/${g.slug}/`}>
                    <img src={g.photo} alt="" loading="lazy" width={480} height={320} />
                    <span>{g.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  return { paths: guideSlugs().map((slug) => ({ params: { slug } })), fallback: false };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const { meta, blocks, toc } = loadGuide(params.slug);
  const others = allGuides().filter((g) => g.slug !== params.slug).slice(0, 6);
  return { props: { meta, blocks, toc, others } };
}
