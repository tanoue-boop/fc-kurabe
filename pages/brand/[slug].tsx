import Link from 'next/link';
import { useState } from 'react';
import ExitButton from '../../components/ExitButton';
import Layout from '../../components/Layout';
import { BRANDS, Brand, META, minorsOf, MINOR_MIN, yen } from '../../lib/data';
import s from '../../styles/Brand.module.css';

type Props = { b: Brand; majorName: string; minorPage: boolean; similar: { slug: string; brand: string }[]; tagNames: Record<string, string> };

function Sim({ b }: { b: Brand }) {
  const [sales, setSales] = useState(2_000_000);
  const r = b.royalty;
  if (!r || r.type === null || r.type === 'none') return null;
  const monthly = (r.rate ? (sales * r.rate) / 100 : 0) + (r.fixed_yen || 0);
  return (
    <section className={s.box}>
      <h2>ロイヤリティの試算</h2>
      <label className={s.simLabel}>
        想定の月商
        <input type="number" step={100000} value={sales} onChange={(e) => setSales(Number(e.target.value))} />円
      </label>
      <p className={s.simResult}>毎月のロイヤリティ：約 {Math.round(monthly).toLocaleString()}円</p>
      <p className={s.small}>公表されている「{b.royalty_text}」をもとにした単純計算です。上限・下限や別途の月額費用は含みません。</p>
    </section>
  );
}

export default function BrandPage({ b, majorName, minorPage, similar, tagNames }: Props) {
  const rows: [string, string | null][] = [
    ['業種', b.minor_name],
    ['契約タイプ', b.contract_type],
    ['開業資金（初期投資）', b.initial_investment_text],
    ['加盟金', b.franchise_fee_text],
    ['保証金', b.deposit_text],
    ['研修費', b.training_fee_text],
    ['ロイヤリティ', b.royalty_text],
    ['契約期間', b.contract_term_text],
    ['自己資金の目安', b.self_funds_text],
    ['店舗数', b.store_count_text],
    ['募集エリア', b.recruit_area],
    ['対象', b.target],
    ['運営会社', b.is_own ? `${b.company}（当サイトの運営会社）` : b.company],
  ];
  const primary = b.exits[0];
  return (
    <Layout
      title={`${b.brand}のフランチャイズ｜加盟金・開業資金・ロイヤリティ`}
      description={`${b.brand}のフランチャイズの加盟金、開業資金、ロイヤリティ、契約期間を出典付きで掲載。${b.minor_name}の他の本部との比較も。`}
      crumbs={[
        { href: '/gyoshu/', label: '業種から探す' },
        { href: `/gyoshu/${b.major}/`, label: majorName },
        ...(minorPage ? [{ href: `/gyoshu/${b.major}/${b.minor}/`, label: b.minor_name }] : []),
        { href: `/brand/${b.slug}/`, label: b.brand },
      ]}
    >
      <p className={s.pr}>PR</p>
      <h1 className={s.h1}>{b.brand}のフランチャイズ</h1>
      {b.tags.length > 0 && (
        <div className={s.tags}>
          {b.tags.map((t) => <Link key={t} href={`/tag/${t}/`} className={s.tag}>{tagNames[t]}</Link>)}
        </div>
      )}

      <div className={s.keyNums}>
        <div><span>開業資金</span><strong>{yen(b.initial_investment_yen) ?? '—'}</strong></div>
        <div><span>加盟金</span><strong>{yen(b.franchise_fee_yen) ?? '—'}</strong></div>
        <div><span>ロイヤリティ</span><strong>{b.royalty?.type === 'none' ? 'なし' : b.royalty?.rate ? `${b.royalty.rate}%${(b.royalty_text || '').includes('／') ? '〜' : ''}` : b.royalty?.fixed_yen ? yen(b.royalty.fixed_yen) : '—'}</strong></div>
      </div>

      {primary && (
        <div className={s.cta}>
          {b.exits.map((e, i) => <ExitButton key={e.type} exit={e} brand={b.brand} slug={b.slug} primary={i === 0} />)}
        </div>
      )}

      <section className={s.box}>
        <h2>募集条件</h2>
        <table className={s.spec}>
          <tbody>
            {rows.filter(([, v]) => v).map(([k, v]) => (
              <tr key={k}><th>{k}</th><td>{v}</td></tr>
            ))}
          </tbody>
        </table>
        <p className={s.small}>
          出典：{b.source_type ?? '—'}（確認日 {b.checked_date ?? '—'}）
          {b.official_fc_url && <> ／ <a href={b.official_fc_url} target="_blank" rel="noopener">公式の募集ページ</a></>}
        </p>
        {b.notes && <p className={s.small}>補足：{b.notes}</p>}
      </section>

      <Sim b={b} />

      {similar.length > 0 && (
        <section className={s.box}>
          <h2>{b.minor_name}の他の本部</h2>
          <ul className={s.similar}>
            {similar.map((x) => <li key={x.slug}><Link href={`/brand/${x.slug}/`}>{x.brand}</Link></li>)}
          </ul>
          <Link href={`/compare/?b=${[b.slug, ...similar.slice(0, 3).map((x) => x.slug)].join(',')}`}>この業種の本部を比較表で見る</Link>
        </section>
      )}

      {primary && (
        <div className={s.cta}>
          {b.exits.map((e, i) => <ExitButton key={e.type} exit={e} brand={b.brand} slug={b.slug} primary={i === 0} />)}
        </div>
      )}
    </Layout>
  );
}

export async function getStaticPaths() {
  return { paths: BRANDS.map((b) => ({ params: { slug: b.slug } })), fallback: false };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const b = BRANDS.find((x) => x.slug === params.slug)!;
  const minorPage = (minorsOf(b.major).find((m) => m.slug === b.minor)?.count || 0) >= MINOR_MIN;
  const similar = BRANDS.filter((x) => x.minor === b.minor && x.slug !== b.slug).slice(0, 8).map((x) => ({ slug: x.slug, brand: x.brand }));
  return { props: { b, majorName: META.majors[b.major], minorPage, similar, tagNames: META.tags } };
}
