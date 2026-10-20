import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import BrandCard from '../components/BrandCard';
import BrandList from '../components/BrandList';
import Layout from '../components/Layout';
import { BRANDS, META, majorsWithCount, toRow } from '../lib/data';
import type { Row } from '../lib/data';
import { FUNDS, SITE_NAME, majorPhoto, minorPhoto, yen } from '../lib/format';
import { useCompare } from '../lib/compare';
import s from '../styles/Home.module.css';

type Major = { slug: string; name: string; count: number };
type Props = {
  rows: Row[];
  majors: Major[];
  fundCounts: Record<string, number>;
  tags: { slug: string; name: string; count: number }[];
  featured: Row[];
  sample: Row[];
  total: number;
  minIni: number;
  roy0: number;
  mikeiken: number;
};

const FUND_CARDS = [
  { slug: 'under-100', top: '100', unit: '万円以下', note: '0〜100万円' },
  { slug: '100-300', top: '300', unit: '万円以下', note: '101〜300万円' },
  { slug: '300-500', top: '500', unit: '万円以下', note: '301〜500万円' },
  { slug: '500-1000', top: '1,000', unit: '万円以下', note: '501〜1,000万円' },
  { slug: 'over-1000', top: '1,000', unit: '万円超', note: '1,000万円を超える' },
];

export default function Home({ rows, majors, fundCounts, tags, featured, sample, total, minIni, roy0, mikeiken }: Props) {
  const [major, setMajor] = useState('');
  const [fund, setFund] = useState('');
  const [tag, setTag] = useState('');
  const [shown, setShown] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const { list } = useCompare();

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
      {/* ファーストビュー */}
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.heroMain}>
            <p className={s.pr}>PR</p>
            <p className={s.ribbon}>フランチャイズ{total}本部を、金額で横並び比較</p>
            <h1 className={s.h1}>
              <span className={s.h1Small}>自分の店は、</span>
              <span className={s.marker}>数字</span>で選ぶ。
            </h1>
            <p className={s.lead}>
              開業資金・加盟金・ロイヤリティを
              <br />
              同じ表に並べて、納得できる本部を探せます。
            </p>
            <div className={s.heroCta}>
              <a href="#fund" className={s.ctaMain}>開業資金から探す</a>
              <a href="#gyoshu" className={s.ctaSub}>業種から探す</a>
            </div>
          </div>
          <ul className={s.callouts}>
            <li>
              <span>掲載本部数</span>
              <strong><em className="num">{total}</em>本部</strong>
            </li>
            <li>
              <span>開業資金</span>
              <strong><em className="num">{Math.round(minIni / 10000)}</em>万円〜</strong>
            </li>
            <li>
              <span>ロイヤリティなし</span>
              <strong><em className="num">{roy0}</em>本部</strong>
            </li>
            <li>
              <span>未経験から始められる</span>
              <strong><em className="num">{mikeiken}</em>本部</strong>
            </li>
          </ul>
        </div>
        <div className={s.collage} aria-hidden="true">
          <img src="/img/hero.jpg" alt="" width={1536} height={1024} />
          <img src={minorPhoto('ramen')} alt="" width={960} height={640} />
          <img src={minorPhoto('pilates')} alt="" width={960} height={640} />
          <img src={minorPhoto('house-cleaning')} alt="" width={960} height={640} />
          <img src={minorPhoto('juku')} alt="" width={960} height={640} />
        </div>
      </section>

      {/* 条件をかけ合わせて探す */}
      <section className={s.searchBand} aria-label="条件で探す">
        <form className={s.search} onSubmit={search}>
          <p className={s.searchTitle}>条件で絞り込む</p>
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
            <span>働き方・目的</span>
            <select value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="">指定しない</option>
              {tags.map((t) => <option key={t.slug} value={t.slug}>{t.name}（{t.count}）</option>)}
            </select>
          </label>
          <button type="submit" className={s.sGo} disabled={hits.length === 0}>
            {hits.length === 0 ? '該当なし' : <>この条件で探す<span className="num">{hits.length}件</span></>}
          </button>
        </form>
      </section>

      {shown && (
        <section className={s.section} ref={resultRef} aria-labelledby="result-h">
          <div className={s.secHead}>
            <h2 id="result-h" className={s.h2}>検索結果</h2>
            <button type="button" className={s.textLink} onClick={() => setShown(false)}>閉じる</button>
          </div>
          <BrandList rows={hits} />
        </section>
      )}

      {/* お悩み → 解決 */}
      <section className={s.worry} aria-labelledby="worry-h">
        <h2 id="worry-h" className={s.worryH}>本部選びで、こんな迷いはありませんか？</h2>
        <ul className={s.worryList}>
          <li>
            <img src={minorPhoto('other-3')} alt="" loading="lazy" width={240} height={240} />
            <p>資料を取り寄せても、<b>本部ごとに金額の書き方がバラバラ</b>で比べにくい</p>
          </li>
          <li>
            <img src={minorPhoto('cafe')} alt="" loading="lazy" width={240} height={240} />
            <p>開業資金のほかに、<b>毎月いくら本部に払うのか</b>が分からない</p>
          </li>
          <li>
            <img src={minorPhoto('it')} alt="" loading="lazy" width={240} height={240} />
            <p>比較サイトの数字が、<b>公式の発表と違っている</b>ことがある</p>
          </li>
        </ul>
      </section>
      <section className={s.answer} aria-labelledby="answer-h">
        <div className={s.answerInner}>
          <h2 id="answer-h" className={s.answerH}>
            <span>フランチャイズくらべなら</span>
            金額を、<span className={s.markerDark}>同じ物差し</span>で比べられます
          </h2>
          <ul className={s.points}>
            <li>
              <strong>3つの金額を横並び</strong>
              <p>開業資金・加盟金・ロイヤリティを同じ項目にそろえ、一覧と比較表で並べています。</p>
            </li>
            <li>
              <strong>出典と確認日つき</strong>
              <p>公式ページの数字を優先して転記し、どこで・いつ確認したかを本部ごとに載せています。</p>
            </li>
            <li>
              <strong>毎月の支払いを試算</strong>
              <p>想定の売上を入れると、ロイヤリティが毎月いくらになるかをその場で計算できます。</p>
            </li>
          </ul>
        </div>
      </section>

      {/* 開業資金から探す */}
      <section id="fund" className={s.section} aria-labelledby="fund-h">
        <div className={s.secHeadCenter}>
          <p className={s.secLabel}>予算から選ぶ</p>
          <h2 id="fund-h" className={s.h2}>開業資金から探す</h2>
          <p className={s.secLead}>用意できる資金に合わせて、始められる本部を探せます。</p>
        </div>
        <ul className={s.fundCards}>
          {FUND_CARDS.map((f) => (
            <li key={f.slug}>
              <Link href={`/shikin/${f.slug}/`} className={s.fundCard}>
                <span className={s.fundNote}>{f.note}</span>
                <span className={s.fundAmount}>
                  <em className="num">{f.top}</em>
                  <small>{f.unit}</small>
                </span>
                <span className={s.fundCount}><b className="num">{fundCounts[f.slug] ?? 0}</b>本部</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 業種から探す */}
      <section id="gyoshu" className={`${s.section} ${s.beigeBand}`} aria-labelledby="major-h">
        <div className={s.bandInner}>
          <div className={s.secHeadCenter}>
            <p className={s.secLabel}>仕事から選ぶ</p>
            <h2 id="major-h" className={s.h2}>業種から探す</h2>
            <p className={s.secLead}>どんな仕事をしたいかから、本部を探せます。</p>
          </div>
          <ul className={s.majors}>
            {majors.map((m) => (
              <li key={m.slug}>
                <Link href={`/gyoshu/${m.slug}/`} className={s.majorCard}>
                  <span className={s.majorPhoto}>
                    <img src={majorPhoto(m.slug)} alt="" loading="lazy" width={480} height={320} />
                    <span className={s.majorCount}><b className="num">{m.count}</b>本部</span>
                  </span>
                  <span className={s.majorName}>{m.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={s.centerLink}><Link href="/gyoshu/" className={s.ctaSub}>26の業種をすべて見る</Link></p>
        </div>
      </section>

      {/* 本部カード */}
      <section className={s.section} aria-labelledby="pick-h">
        <div className={s.secHeadCenter}>
          <p className={s.secLabel}>少ない資金で</p>
          <h2 id="pick-h" className={s.h2}>300万円以下で始められる本部</h2>
        </div>
        <div className={s.tiles}>
          {featured.map((r) => <BrandCard key={r.slug} r={r} layout="tile" />)}
        </div>
        <p className={s.centerLink}><Link href="/shikin/100-300/" className={s.ctaSub}>300万円以下の本部をもっと見る</Link></p>
      </section>

      {/* 比較表の見本 */}
      <section className={`${s.section} ${s.darkBand}`} aria-labelledby="why-h">
        <div className={s.bandInner}>
          <div className={s.secHeadCenter}>
            <p className={s.secLabelLight}>比べて選ぶ</p>
            <h2 id="why-h" className={s.h2Light}>気になる本部を、1つの表で比較</h2>
            <p className={s.secLeadLight}>「比較に追加」を押した本部を、最大4社まで同じ表に並べられます。</p>
          </div>
          <div className={s.sampleWrap}>
            <table className={s.sample}>
              <thead>
                <tr>
                  <th scope="col">本部</th>
                  <th scope="col">業種</th>
                  <th scope="col" className={s.hiCol}>開業資金</th>
                  <th scope="col">加盟金</th>
                  <th scope="col">ロイヤリティ</th>
                  <th scope="col">契約期間</th>
                </tr>
              </thead>
              <tbody>
                {sample.map((r) => (
                  <tr key={r.slug}>
                    <th scope="row"><Link href={`/brand/${r.slug}/`}>{r.brand}</Link></th>
                    <td>{r.minor_name}</td>
                    <td className={s.hiCol}><strong className="num">{yen(r.ini) ?? '—'}</strong></td>
                    <td className="num">{yen(r.fee) ?? '—'}</td>
                    <td>{r.roy ?? '—'}</td>
                    <td>{r.term ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={s.centerLink}>
            <Link href="/compare/" className={s.ctaMain}>
              比較表を開く{list.length > 0 && <span className="num">（{list.length}社を選択中）</span>}
            </Link>
          </p>
        </div>
      </section>

      {/* 使い方 */}
      <section className={s.section} aria-labelledby="flow-h">
        <div className={s.secHeadCenter}>
          <p className={s.secLabel}>使い方</p>
          <h2 id="flow-h" className={s.h2}>資料請求までの3ステップ</h2>
        </div>
        <ol className={s.flow}>
          <li>
            <span className={s.step}>STEP<b>1</b></span>
            <strong>探す</strong>
            <p>開業資金・業種・働き方から、気になる本部を探します。</p>
          </li>
          <li>
            <span className={s.step}>STEP<b>2</b></span>
            <strong>比べる</strong>
            <p>「比較に追加」で最大4社を選び、金額と条件を1つの表で比べます。</p>
          </li>
          <li>
            <span className={s.step}>STEP<b>3</b></span>
            <strong>問い合わせる</strong>
            <p>候補が決まったら、各本部の資料請求や説明会で詳しい条件を確かめます。</p>
          </li>
        </ol>
      </section>

      {/* 働き方・目的 */}
      <section className={s.section} aria-labelledby="tag-h">
        <div className={s.secHeadCenter}>
          <p className={s.secLabel}>始め方から選ぶ</p>
          <h2 id="tag-h" className={s.h2}>働き方・目的から探す</h2>
        </div>
        <ul className={s.tagGrid}>
          {tags.map((t) => (
            <li key={t.slug}>
              <Link href={`/tag/${t.slug}/`} className={s.tagLink}>
                <span>{t.name}</span>
                <b className="num">{t.count}</b>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ランキング */}
      <section className={s.section} aria-labelledby="rank-h">
        <div className={s.secHeadCenter}>
          <p className={s.secLabel}>数字で並べる</p>
          <h2 id="rank-h" className={s.h2}>条件別ランキング</h2>
          <p className={s.secLead}>人気や当サイトの評価ではなく、各本部が公表している金額だけで並べています。</p>
        </div>
        <ul className={s.rankLinks}>
          <li><Link href="/ranking/#ini"><img src={minorPhoto('takeout')} alt="" loading="lazy" width={480} height={320} /><strong>開業資金が低い順</strong><span>少ない資金で始められる本部</span></Link></li>
          <li><Link href="/ranking/#roy"><img src={minorPhoto('juku-2')} alt="" loading="lazy" width={480} height={320} /><strong>ロイヤリティ率が低い順</strong><span>売上から払う割合が小さい本部</span></Link></li>
          <li><Link href="/ranking/#roy0"><img src={minorPhoto('benriya')} alt="" loading="lazy" width={480} height={320} /><strong>ロイヤリティなしの本部</strong><span>毎月のロイヤリティがかからない本部</span></Link></li>
        </ul>
      </section>

      {/* 最後の行動喚起 */}
      <section className={s.finalCta} aria-labelledby="final-h">
        <img src={minorPhoto('restaurant')} alt="" loading="lazy" width={1536} height={1024} />
        <div className={s.finalInner}>
          <h2 id="final-h">あなたに合う本部を、まずは金額から。</h2>
          <div className={s.heroCta}>
            <a href="#fund" className={s.ctaMain}>開業資金から探す</a>
            <Link href="/ranking/" className={s.ctaLight}>ランキングを見る</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const majors = majorsWithCount().sort((a, b) => b.count - a.count);
  const fundCounts = Object.fromEntries(META.funds.map((f) => [f.slug, BRANDS.filter((b) => b.fund_band === f.slug).length]));
  const tags = Object.entries(META.tags)
    .map(([slug, name]) => ({ slug, name, count: BRANDS.filter((b) => b.tags.includes(slug)).length }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);
  const rows = BRANDS.map(toRow);
  // 金額が3つとも分かっている本部を優先。並びは開業資金の低い順（人気や評価の順ではない）
  const known = (r: Row) => (r.ini !== null ? 1 : 0) + (r.fee !== null ? 1 : 0) + (r.roy !== null ? 1 : 0);
  const pick = (list: Row[], n: number) =>
    [...list].sort((a, b) => known(b) - known(a) || (a.ini ?? Infinity) - (b.ini ?? Infinity)).slice(0, n);
  const featured = pick(rows.filter((r) => r.ini !== null && r.ini > 0 && r.ini <= 3_000_000 && !r.own), 4);
  const full = rows.filter((r) => known(r) === 3 && r.term && !r.own);
  const seen = new Set<string>();
  const sample = full.filter((r) => (seen.has(r.major) ? false : (seen.add(r.major), true))).slice(0, 4);
  const minIni = Math.min(...rows.filter((r) => r.ini !== null && r.ini > 0).map((r) => r.ini as number));
  return {
    props: {
      rows, majors, fundCounts, tags, featured, sample, total: BRANDS.length, minIni,
      roy0: rows.filter((r) => r.royRate === 0).length,
      mikeiken: rows.filter((r) => r.tags.includes('mikeiken')).length,
    },
  };
}
