import FundRuler from '../../components/FundRuler';
import Layout, { PageHead } from '../../components/Layout';
import { BRANDS, META } from '../../lib/data';
import s from '../../styles/List.module.css';

export default function FundIndex({ counts, known, total }: { counts: Record<string, number>; known: number; total: number }) {
  return (
    <Layout
      title="開業資金からフランチャイズを探す"
      description="開業資金100万円以下から1,000万円超まで、金額の帯ごとにフランチャイズ本部を探せます。"
      crumbs={[{ href: '/shikin/', label: '開業資金から探す' }]}
    >
      <PageHead title="開業資金からフランチャイズを探す" lead="各本部が公表している開業資金（初期投資）の金額で、本部を5つの帯に分けています。" />
      <div className={s.fundIntro}>
        <FundRuler counts={counts} />
        <p className={s.fundNote}>
          掲載{total}本部のうち、開業資金を数字で確認できた{known}本部が対象です。金額に幅がある場合は、最初に書かれている金額（多くは下限）で分けています。
        </p>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const counts = Object.fromEntries(META.funds.map((f) => [f.slug, BRANDS.filter((b) => b.fund_band === f.slug).length]));
  return { props: { counts, known: BRANDS.filter((b) => b.fund_band).length, total: BRANDS.length } };
}
