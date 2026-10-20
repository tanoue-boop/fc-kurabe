import Link from 'next/link';
import FundMeter from '../../components/FundMeter';
import Layout, { PageHead } from '../../components/Layout';
import { BRANDS, royaltyShort, toRow } from '../../lib/data';
import type { Row } from '../../lib/data';
import { yen } from '../../lib/format';
import s from '../../styles/Ranking.module.css';

type Props = { ini: Row[]; roy: Row[]; roy0: Row[] };

function RankList({ rows, value, numbered = true }: { rows: Row[]; value: (r: Row) => string; numbered?: boolean }) {
  const Tag = numbered ? 'ol' : 'ul';
  return (
    <Tag className={numbered ? s.list : `${s.list} ${s.plain}`}>
      {rows.map((r, i) => (
        <li key={r.slug} className={s.item}>
          {numbered && <span className={`${s.rank} num`}>{i + 1}</span>}
          <span className={s.body}>
            <Link href={`/brand/${r.slug}/`} className={s.name}>{r.brand}</Link>
            <span className={s.kind}>{r.minor_name}</span>
          </span>
          <span className={s.value}>
            <strong className="num">{value(r)}</strong>
            <FundMeter band={r.fund} />
          </span>
        </li>
      ))}
    </Tag>
  );
}

export default function Ranking({ ini, roy, roy0 }: Props) {
  return (
    <Layout
      title="フランチャイズ 条件別ランキング"
      description="開業資金が低い順、ロイヤリティ率が低い順など、各本部が公表している数字だけで並べたフランチャイズのランキングです。"
      crumbs={[{ href: '/ranking/', label: 'ランキング' }]}
    >
      <PageHead photo="/img/hero.jpg"
        title="フランチャイズ 条件別ランキング"
        lead="人気や当サイトの評価ではなく、各本部が公表している数字だけで並べています。金額を確認できなかった本部は対象外です。"
      >
        <nav className={s.jump} aria-label="ランキングの種類">
          <a href="#ini">開業資金が低い順</a>
          <a href="#roy">ロイヤリティ率が低い順</a>
          <a href="#roy0">ロイヤリティなし</a>
        </nav>
      </PageHead>

      <section id="ini" className={s.section}>
        <h2 className={s.h2}>開業資金が低い順 TOP20</h2>
        <p className={s.lead}>公表されている開業資金（初期投資）の金額が低い順です。</p>
        <RankList rows={ini} value={(r) => yen(r.ini) ?? '—'} />
      </section>

      <section id="roy" className={s.section}>
        <h2 className={s.h2}>ロイヤリティ率が低い順 TOP20</h2>
        <p className={s.lead}>売上に対する割合でロイヤリティを公表している本部が対象です。定額制の本部は含みません。</p>
        <RankList rows={roy} value={(r) => r.roy ?? '—'} />
      </section>

      <section id="roy0" className={s.section}>
        <h2 className={s.h2}>ロイヤリティなしの本部（{roy0.length}件）</h2>
        <p className={s.lead}>毎月のロイヤリティがかからないと公表している本部です。開業資金が低い順に並べています。</p>
        <RankList rows={roy0} value={(r) => (r.ini !== null ? `開業資金 ${yen(r.ini)}` : '開業資金 —')} numbered={false} />
      </section>
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
  const roy0 = rows
    .filter((r) => r.royRate === 0)
    .sort((a, b) => (a.ini ?? Infinity) - (b.ini ?? Infinity));
  return { props: { ini, roy, roy0 } };
}
