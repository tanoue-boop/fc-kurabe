import GuideLinks from '../../components/GuideLinks';
import { guidesFor } from '../../lib/guide';
import type { GuideMeta } from '../../lib/guide';
import Link from 'next/link';
import { useState } from 'react';
import BrandTable from '../../components/BrandTable';
import ExitButton from '../../components/ExitButton';
import Layout from '../../components/Layout';
import { useCompare } from '../../lib/compare';
import { BRANDS, META, MINOR_MIN, minorsOf, toRow } from '../../lib/data';
import type { Brand, Row } from '../../lib/data';
import { FUNDS, fundIndex, yen } from '../../lib/format';
import s from '../../styles/Brand.module.css';

type Props = { b: Brand; majorName: string; minorPage: boolean; peers: Row[]; tagNames: Record<string, string>; guides: GuideMeta[] };

function royaltyBig(b: Brand) {
  const r = b.royalty;
  if (!r || r.type === null) return null;
  if (r.type === 'none') return 'なし';
  if (r.type === 'rate' && r.rate !== null) return `${r.rate}%`;
  if (r.type === 'fixed' && r.fixed_yen !== null) return `月${yen(r.fixed_yen)}`;
  if (r.type === 'mixed' && r.rate !== null) return `${r.rate}%＋定額`;
  return null;
}

function Simulator({ b }: { b: Brand }) {
  const [sales, setSales] = useState(2_000_000);
  const r = b.royalty;
  if (!r || r.type === null || r.type === 'none') return null;
  const monthly = (r.rate ? (sales * r.rate) / 100 : 0) + (r.fixed_yen || 0);
  return (
    <section className={s.section} aria-labelledby="sim-h">
      <h2 id="sim-h" className={s.h2}>毎月のロイヤリティを試算する</h2>
      <div className={s.sim}>
        <label className={s.simInput}>
          <span>想定する月の売上</span>
          <span className={s.simField}>
            <input type="number" inputMode="numeric" min={0} step={100000} value={sales} onChange={(e) => setSales(Math.max(0, Number(e.target.value)))} />
            円
          </span>
        </label>
        <p className={s.simOut}>
          <span>毎月のロイヤリティ</span>
          <strong className="num">約{Math.round(monthly).toLocaleString()}円</strong>
        </p>
      </div>
      <p className={s.small}>公表されている「{b.royalty_text}」をもとにした単純な計算です。上限・下限や、ロイヤリティ以外の月額費用は含みません。</p>
    </section>
  );
}

export default function BrandPage({ b, majorName, minorPage, peers, tagNames, guides }: Props) {
  const { has, toggle, full } = useCompare();
  const inList = has(b.slug);
  const fi = fundIndex(b.fund_band);
  const spec: [string, string | null][] = [
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
  const minorHref = minorPage ? `/gyoshu/${b.major}/${b.minor}/` : `/gyoshu/${b.major}/`;

  const actions = (
    <>
      {b.exits.map((e, i) => <ExitButton key={e.type} exit={e} brand={b.brand} slug={b.slug} primary={i === 0} />)}
      <button
        type="button"
        className={s.compareBtn}
        aria-pressed={inList}
        disabled={!inList && full}
        onClick={() => toggle({ slug: b.slug, brand: b.brand })}
      >
        {inList ? '比較リストに追加済み' : full ? '比較リストは4社までです' : '比較リストに追加'}
      </button>
    </>
  );

  return (
    <Layout
      title={`${b.brand}のフランチャイズ｜加盟金・開業資金・ロイヤリティ`}
      description={`${b.brand}のフランチャイズの加盟金、開業資金、ロイヤリティ、契約期間を出典付きで掲載。${b.minor_name}のほかの本部とも比べられます。`}
      crumbs={[
        { href: '/gyoshu/', label: '業種から探す' },
        { href: `/gyoshu/${b.major}/`, label: majorName },
        ...(minorPage ? [{ href: `/gyoshu/${b.major}/${b.minor}/`, label: b.minor_name }] : []),
        { href: `/brand/${b.slug}/`, label: b.brand },
      ]}
    >
      <div className={s.head}>
        {b.photo && <img className={s.headImg} src={b.photo} alt="" width={1536} height={1024} />}
        <div className={s.headShade} />
        <div className={s.headText}>
        <p className={s.pr}>PR</p>
        <h1 className={s.h1}>{b.brand}のフランチャイズ</h1>
        <p className={s.meta}>
          <Link href={minorHref}>{b.minor_name}</Link>
          {b.contract_type && <span>{b.contract_type}</span>}
          {b.store_count_text && <span>{b.store_count_text}</span>}
        </p>
        {b.tags.length > 0 && (
          <ul className={s.tags}>
            {b.tags.map((t) => <li key={t}><Link href={`/tag/${t}/`}>{tagNames[t]}</Link></li>)}
          </ul>
        )}
        </div>
        {b.photo && <p className={s.photoNote}>写真はイメージです</p>}
      </div>

      <div className={s.layout}>
        <div className={s.main}>
          <dl className={s.figures}>
            <div className={s.fig}>
              <dt>開業資金</dt>
              <dd>
                <strong className="num">{yen(b.initial_investment_yen) ?? '—'}</strong>
                <span className={s.band}>
                  {fi >= 0 ? FUNDS[fi].name : '資金帯は未確認'}
                </span>
              </dd>
            </div>
            <div className={s.fig}>
              <dt>加盟金</dt>
              <dd><strong className="num">{yen(b.franchise_fee_yen) ?? '—'}</strong></dd>
            </div>
            <div className={s.fig}>
              <dt>ロイヤリティ</dt>
              <dd><strong className="num">{royaltyBig(b) ?? '—'}</strong></dd>
            </div>
          </dl>
          <p className={s.figNote}>
            金額は代表的な数字です。プランや物件によって変わるため、内訳は下の募集条件をご覧ください。
          </p>

          <div className={s.actionsInline}>{actions}</div>

          <section className={s.section} aria-labelledby="spec-h">
            <h2 id="spec-h" className={s.h2}>募集条件</h2>
            <table className={s.spec}>
              <tbody>
                {spec.filter(([, v]) => v).map(([k, v]) => (
                  <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
            <p className={s.source}>
              出典：{b.source_type ?? '—'}　確認日：<span className="num">{b.checked_date ?? '—'}</span>
              {b.official_fc_url && <> 　<a href={b.official_fc_url} target="_blank" rel="noopener">公式の募集ページを開く</a></>}
            </p>
          </section>

          <Simulator b={b} />
          <GuideLinks guides={guides} />

          {peers.length > 1 && (
            <section className={s.section} aria-labelledby="peer-h">
              <h2 id="peer-h" className={s.h2}>{b.minor_name}のほかの本部と比べる</h2>
              <BrandTable rows={peers} initialSort="ini" current={b.slug} />
            </section>
          )}
        </div>

        <aside className={s.aside} aria-label="問い合わせ">
          <div className={s.asideBox}>
            <p className={s.asideTitle}>{b.brand}</p>
            <p className={s.asideText}>加盟の条件や収支のモデルは、本部の資料や説明会で詳しく確認できます。</p>
            <div className={s.asideActions}>{actions}</div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  return { paths: BRANDS.map((b) => ({ params: { slug: b.slug } })), fallback: false };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const b = BRANDS.find((x) => x.slug === params.slug)!;
  const minorPage = (minorsOf(b.major).find((m) => m.slug === b.minor)?.count || 0) >= MINOR_MIN;
  const peers = BRANDS.filter((x) => x.minor === b.minor).slice(0, 12).map(toRow);
  if (!peers.some((p) => p.slug === b.slug)) peers.unshift(toRow(b));
  return { props: { b, majorName: META.majors[b.major], minorPage, peers, tagNames: META.tags, guides: guidesFor(b.minor, b.major) } };
}
