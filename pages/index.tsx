import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import BrandCard from '../components/BrandCard';
import BrandList from '../components/BrandList';
import Layout from '../components/Layout';
import { BRANDS, META, MINOR_MIN, majorsWithCount, minorsOf, toRow } from '../lib/data';
import type { Row } from '../lib/data';
import { FUNDS, SITE_NAME, majorPhoto, minorPhoto } from '../lib/format';
import s from '../styles/Home.module.css';

type Minor = { slug: string; name: string; count: number };
type Major = { slug: string; name: string; count: number; minors: Minor[] };
type Props = {
  rows: Row[];
  majors: Major[];
  fundCounts: Record<string, number>;
  tags: { slug: string; name: string; count: number }[];
  picks: { major: Major; rows: Row[] }[];
  lowCost: Row[];
  total: number;
  minorCount: number;
};

export default function Home({ rows, majors, fundCounts, tags, picks, lowCost, total, minorCount }: Props) {
  const [major, setMajor] = useState('');
  const [fund, setFund] = useState('');
  const [tag, setTag] = useState('');
  const [shown, setShown] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  // 選んだ条件をすべて満たす本部
  const hits = useMemo(
    () => rows.filter((r) => (!major || r.major === major) && (!fund || r.fund === fund) && (!tag || r.tags.includes(tag))),
    [rows, major, fund, tag],
  );
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setShown(true);
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <Layout
      title={SITE_NAME}
      description={`フランチャイズ・独立開業の本部${total}件を、業種・開業資金・加盟金・ロイヤリティで比較できます。金額は公式ページなどで確認した数字を、出典と確認日を付けて掲載しています。`}
    >
      <section className={s.hero}>
        <img className={s.heroImg} src="/img/hero.jpg" alt="" width={1536} height={1024} />
        <div className={s.heroShade} />
        <div className={s.heroInner}>
          <p className={s.pr}>PR</p>
          <h1 className={s.h1}>
            はじめての独立開業は、
            <br />
            本部選びから。
          </h1>
          <p className={s.lead}>
            {total}本部の開業資金・加盟金・ロイヤリティを、出典つきで並べて比べられます。
          </p>
        </div>
      </section>

      <form className={s.search} onSubmit={search} aria-label="フランチャイズを探す">
        <label className={s.sField}>
          <span>業種</span>
          <select value={major} onChange={(e) => setMajor(e.target.value)}>
            <option value="">すべての業種</option>
            {majors.map((m) => <option key={m.slug} value={m.slug}>{m.name}（{m.count}）</option>)}
          </select>
        </label>
        <label className={s.sField}>
          <span>開業資金</span>
          <select value={fund} onChange={(e) => setFund(e.target.value)}>
            <option value="">指定しない</option>
            {FUNDS.map((f) => <option key={f.slug} value={f.slug}>{f.name}（{fundCounts[f.slug] ?? 0}）</option>)}
          </select>
        </label>
        <label className={s.sField}>
          <span>こだわり条件</span>
          <select value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">指定しない</option>
            {tags.map((t) => <option key={t.slug} value={t.slug}>{t.name}（{t.count}）</option>)}
          </select>
        </label>
        <button type="submit" className={s.sGo} disabled={hits.length === 0}>
          {hits.length === 0 ? '該当なし' : <>この条件で探す<small className="num">{hits.length}件</small></>}
        </button>
      </form>

      {shown && (
        <section className={s.section} ref={resultRef} aria-labelledby="result-h">
          <div className={s.secHead}>
            <h2 id="result-h" className={s.h2}>検索結果</h2>
            <button type="button" className={s.all} onClick={() => setShown(false)}>閉じる</button>
          </div>
          <BrandList rows={hits} />
        </section>
      )}

      <section className={s.section} aria-labelledby="major-h">
        <div className={s.secHead}>
          <h2 id="major-h" className={s.h2}>業種から探す</h2>
          <Link href="/gyoshu/" className={s.all}>すべての業種（{minorCount}）</Link>
        </div>
        <ul className={s.majors}>
          {majors.map((m) => (
            <li key={m.slug}>
              <Link href={`/gyoshu/${m.slug}/`} className={s.majorTile}>
                <img src={majorPhoto(m.slug)} alt="" loading="lazy" width={480} height={320} />
                <span className={s.majorText}>
                  <strong>{m.name}</strong>
                  <span><span className="num">{m.count}</span>本部</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.section} aria-labelledby="fund-h">
        <div className={s.secHead}>
          <h2 id="fund-h" className={s.h2}>開業資金から探す</h2>
          <p className={s.secLead}>公表されている開業資金（初期投資）の目安で分けています。</p>
        </div>
        <ul className={s.funds}>
          {FUNDS.map((f, i) => (
            <li key={f.slug}>
              <Link href={`/shikin/${f.slug}/`} className={s.fund} data-step={i + 1}>
                <span className={s.fundSteps} aria-hidden="true">
                  {FUNDS.map((x, j) => <i key={x.slug} className={j <= i ? s.on : undefined} />)}
                </span>
                <strong>{f.name}</strong>
                <span><span className="num">{fundCounts[f.slug] ?? 0}</span>本部</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {lowCost.length > 0 && (
        <section className={`${s.section} ${s.band}`} aria-labelledby="low-h">
          <div className={s.bandInner}>
            <div className={s.secHead}>
              <h2 id="low-h" className={s.h2}>300万円以下で始められる本部</h2>
              <Link href="/ranking/#ini" className={s.all}>開業資金が低い順に見る</Link>
            </div>
            <div className={s.tiles}>
              {lowCost.map((r) => <BrandCard key={r.slug} r={r} layout="tile" />)}
            </div>
          </div>
        </section>
      )}

      {picks.map(({ major, rows }) => (
        <section key={major.slug} className={s.section} aria-labelledby={`pick-${major.slug}`}>
          <div className={s.secHead}>
            <h2 id={`pick-${major.slug}`} className={s.h2}>{major.name}のフランチャイズ</h2>
            <Link href={`/gyoshu/${major.slug}/`} className={s.all}>{major.name}をすべて見る（{major.count}）</Link>
          </div>
          <ul className={s.minorChips}>
            {major.minors.filter((m) => m.count >= MINOR_MIN).map((m) => (
              <li key={m.slug}>
                <Link href={`/gyoshu/${major.slug}/${m.slug}/`}>
                  <img src={minorPhoto(m.slug)} alt="" loading="lazy" width={64} height={64} />
                  {m.name}<span className="num">{m.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className={s.tiles}>
            {rows.map((r) => <BrandCard key={r.slug} r={r} layout="tile" />)}
          </div>
        </section>
      ))}

      <section className={s.section} aria-labelledby="tag-h">
        <div className={s.secHead}>
          <h2 id="tag-h" className={s.h2}>こだわり条件から探す</h2>
        </div>
        <ul className={s.tagGrid}>
          {tags.map((t) => (
            <li key={t.slug}>
              <Link href={`/tag/${t.slug}/`} className={s.tagLink}>
                {t.name}<span className="num">{t.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.section} aria-labelledby="rank-h">
        <div className={s.secHead}>
          <h2 id="rank-h" className={s.h2}>数字で並べたランキング</h2>
          <p className={s.secLead}>人気や当サイトの評価ではなく、各本部が公表している金額だけで並べています。</p>
        </div>
        <ul className={s.rankLinks}>
          <li><Link href="/ranking/#ini"><strong>開業資金が低い順</strong><span>少ない資金で始められる本部</span></Link></li>
          <li><Link href="/ranking/#roy"><strong>ロイヤリティ率が低い順</strong><span>売上から本部に払う割合が小さい本部</span></Link></li>
          <li><Link href="/ranking/#roy0"><strong>ロイヤリティなしの本部</strong><span>毎月のロイヤリティがかからない本部</span></Link></li>
        </ul>
      </section>

      <section className={`${s.section} ${s.about}`} aria-labelledby="about-h">
        <h2 id="about-h" className={s.h2}>掲載している金額について</h2>
        <div className={s.aboutGrid}>
          <div>
            <h3>公式ページの数字を優先</h3>
            <p>金額は各本部の公式の加盟募集ページを優先して転記しています。公式で確認できない項目は、掲載媒体の数字であることを明記しています。</p>
          </div>
          <div>
            <h3>出典と確認日を記載</h3>
            <p>本部ごとのページに、どこで確認した数字か、いつ確認したかを載せています。条件は変わることがあるため、加盟前には必ず本部の資料でご確認ください。</p>
          </div>
          <div>
            <h3>分からない項目は空欄</h3>
            <p>確認できなかった金額は推測で埋めず「—」で表示しています。比べるときは空欄の項目を本部に直接問い合わせてください。</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const majors = majorsWithCount()
    .sort((a, b) => b.count - a.count)
    .map((m) => ({ ...m, minors: minorsOf(m.slug) }));
  const fundCounts = Object.fromEntries(META.funds.map((f) => [f.slug, BRANDS.filter((b) => b.fund_band === f.slug).length]));
  const tags = Object.entries(META.tags)
    .map(([slug, name]) => ({ slug, name, count: BRANDS.filter((b) => b.tags.includes(slug)).length }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);
  const rows = BRANDS.map(toRow);
  // 金額が分かっている本部を優先して見せる（並びは開業資金の低い順。人気や評価の順ではない）
  const known = (r: Row) => (r.ini !== null ? 1 : 0) + (r.fee !== null ? 1 : 0) + (r.roy !== null ? 1 : 0);
  const pickFrom = (list: Row[], n: number) =>
    [...list].sort((a, b) => known(b) - known(a) || (a.ini ?? Infinity) - (b.ini ?? Infinity)).slice(0, n);
  const lowCost = pickFrom(rows.filter((r) => r.ini !== null && r.ini > 0 && r.ini <= 3_000_000), 4);
  const picks = majors.slice(0, 3).map((m) => ({ major: m, rows: pickFrom(rows.filter((r) => r.major === m.slug), 4) }));
  const minorCount = new Set(BRANDS.map((b) => b.minor)).size;
  return { props: { rows, majors, fundCounts, tags, picks, lowCost, total: BRANDS.length, minorCount } };
}
