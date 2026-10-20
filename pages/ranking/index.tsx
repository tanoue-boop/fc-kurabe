import Link from 'next/link';
import Layout from '../../components/Layout';
import { BRANDS, Row, royaltyShort, toRow, yen } from '../../lib/data';
import s from '../../styles/Home.module.css';
import t from '../../styles/Table.module.css';

type Props = { ini: Row[]; roy: Row[]; roy0: Row[] };

function List({ rows, value }: { rows: Row[]; value: (r: Row) => string }) {
  return (
    <ol className={t.rank}>
      {rows.map((r) => (
        <li key={r.slug}>
          <Link href={`/brand/${r.slug}/`}>{r.brand}</Link>
          <span className={t.rankMeta}>{r.minor_name}／{value(r)}</span>
        </li>
      ))}
    </ol>
  );
}

export default function Ranking({ ini, roy, roy0 }: Props) {
  return (
    <Layout
      title="フランチャイズ 条件別ランキング"
      description="開業資金が低い順、ロイヤリティ率が低い順など、根拠を明記した条件別のフランチャイズランキング。"
      crumbs={[{ href: '/ranking/', label: 'ランキング' }]}
    >
      <p className={s.pr}>PR</p>
      <h1 className={s.h1}>フランチャイズ 条件別ランキング</h1>
      <p className={s.lead}>人気や当サイトの評価ではなく、各本部が公表している数字だけで並べています。金額を確認できなかった本部は対象外です。</p>
      <h2 id="ini" className={s.h2}>開業資金が低い順 TOP20</h2>
      <List rows={ini} value={(r) => `開業資金 ${yen(r.ini)}`} />
      <h2 id="roy" className={s.h2}>ロイヤリティ率が低い順 TOP20</h2>
      <p className={s.lead}>売上に対する率で公表している本部のみ。定額制の本部は含みません。</p>
      <List rows={roy} value={(r) => `ロイヤリティ ${r.roy}`} />
      <h2 id="roy0" className={s.h2}>ロイヤリティなしの本部</h2>
      <List rows={roy0} value={(r) => `開業資金 ${yen(r.ini) ?? '—'}`} />
    </Layout>
  );
}

export async function getStaticProps() {
  const rows = BRANDS.map(toRow);
  const ini = rows.filter((r) => r.ini !== null && r.ini > 0).sort((a, b) => a.ini! - b.ini!).slice(0, 20);
  const roy = BRANDS.filter((b) => b.royalty?.type === 'rate' && b.royalty.rate! > 0)
    .sort((a, b) => a.royalty.rate! - b.royalty.rate!)
    .slice(0, 20)
    .map((b) => ({ ...toRow(b), roy: royaltyShort(b) }));
  const roy0 = rows.filter((r) => r.royRate === 0);
  return { props: { ini, roy, roy0 } };
}
