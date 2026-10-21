import BrandCard from './BrandCard';
import BrandTable from './BrandTable';
import type { Block } from '../lib/guide';
import s from '../styles/Guide.module.css';

// 記事本文（Markdown）と、差し込みの本部カード・比較表を順に並べる
export default function GuideBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
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
    </>
  );
}
