import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import BrandTable from '../components/BrandTable';
import FundRuler from '../components/FundRuler';
import Layout from '../components/Layout';
import MajorIcon from '../components/MajorIcon';
import { BRANDS, META, MINOR_MIN, majorsWithCount, minorsOf, toRow } from '../lib/data';
import type { Row } from '../lib/data';
import { SITE_NAME } from '../lib/format';
import s from '../styles/Home.module.css';

type Minor = { slug: string; name: string; count: number };
type Props = {
  rows: Row[];
  majors: { slug: string; name: string; count: number; minors: Minor[] }[];
  fundCounts: Record<string, number>;
  fundKnown: number;
  tags: { slug: string; name: string; count: number }[];
  total: number;
};

const BUDGET_MAX = [
  { v: 0, label: 'こだわらない' },
  { v: 1_000_000, label: '100万円まで' },
  { v: 3_000_000, label: '300万円まで' },
  { v: 5_000_000, label: '500万円まで' },
  { v: 10_000_000, label: '1,000万円まで' },
];

export default function Home({ rows, majors, fundCounts, fundKnown, tags, total }: Props) {
  const [major, setMajor] = useState('');
  const [minor, setMinor] = useState('');
  const [budget, setBudget] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [roy0, setRoy0] = useState(false);
  const [q, setQ] = useState('');
  const [shown, setShown] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  const minors = majors.find((m) => m.slug === major)?.minors || [];
  const hits = useMemo(() => {
    const kw = q.trim();
    return rows.filter((r) => {
      if (major && r.major !== major) return false;
      if (minor && r.minor !== minor) return false;
      if (budget && (r.ini === null || r.ini > budget)) return false;
      if (roy0 && r.royRate !== 0) return false;
      if (picked.some((t) => !r.tags.includes(t))) return false;
      if (kw && !(r.brand + r.minor_name).includes(kw)) return false;
      return true;
    });
  }, [rows, major, minor, budget, roy0, picked, q]);

  const toggleTag = (t: string) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  const reset = () => { setMajor(''); setMinor(''); setBudget(0); setPicked([]); setRoy0(false); setQ(''); };
  const show = () => {
    setShown(true);
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <Layout
      title={SITE_NAME}
      description={`フランチャイズ・独立開業の本部${total}件を、業種・開業資金・加盟金・ロイヤリティで比較できます。金額は公式ページなどで確認した数字を、出典と確認日を付けて掲載しています。`}
    >
      <section className={s.hero}>
        <div className={s.heroInner}>
          <p className={s.pr}>PR</p>
          <h1 className={s.h1}>フランチャイズの本部を、お金の条件で比べる。</h1>
          <p className={s.lead}>
            {total}本部の開業資金・加盟金・ロイヤリティを同じ表に並べました。金額にはすべて出典と確認日を付けています。
          </p>

          <form className={s.panel} onSubmit={(e) => { e.preventDefault(); show(); }}>
            <fieldset className={s.budget}>
              <legend>開業に使えるお金</legend>
              <div className={s.seg}>
                {BUDGET_MAX.map((b) => (
                  <label key={b.v} className={budget === b.v ? s.segOn : s.segBtn}>
                    <input type="radio" name="budget" value={b.v} checked={budget === b.v} onChange={() => setBudget(b.v)} />
                    {b.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className={s.fields}>
              <label className={s.field}>
                <span>業種</span>
                <select value={major} onChange={(e) => { setMajor(e.target.value); setMinor(''); }}>
                  <option value="">すべての業種</option>
                  {majors.map((m) => <option key={m.slug} value={m.slug}>{m.name}（{m.count}）</option>)}
                </select>
              </label>
              <label className={s.field}>
                <span>詳しい業種</span>
                <select value={minor} disabled={!major} onChange={(e) => setMinor(e.target.value)}>
                  <option value="">{major ? 'すべて' : '先に業種を選んでください'}</option>
                  {minors.map((m) => <option key={m.slug} value={m.slug}>{m.name}（{m.count}）</option>)}
                </select>
              </label>
              <label className={s.field}>
                <span>ブランド名・業種名</span>
                <input value={q} placeholder="例：買取、学習塾" onChange={(e) => setQ(e.target.value)} />
              </label>
            </div>

            <fieldset className={s.conds}>
              <legend>こだわり条件</legend>
              <div className={s.condList}>
                {tags.map((t) => (
                  <button key={t.slug} type="button" className={s.cond} aria-pressed={picked.includes(t.slug)} onClick={() => toggleTag(t.slug)}>
                    {t.name}
                  </button>
                ))}
                <button type="button" className={s.cond} aria-pressed={roy0} onClick={() => setRoy0(!roy0)}>ロイヤリティなし</button>
              </div>
            </fieldset>

            <div className={s.panelFoot}>
              <p className={s.hitCount} aria-live="polite">
                条件に合う本部 <strong className="num">{hits.length}</strong> 件
              </p>
              <button type="button" className={s.reset} onClick={reset}>条件をリセット</button>
              <button type="submit" className={s.go} disabled={hits.length === 0}>この条件で一覧を見る</button>
            </div>
          </form>
        </div>
      </section>

      {shown && (
        <section className={s.section} ref={resultRef} aria-labelledby="result-h">
          <h2 id="result-h" className={s.h2}>検索結果</h2>
          {hits.length > 0 ? (
            <BrandTable rows={hits} />
          ) : (
            <p className={s.empty}>条件に合う本部がありません。開業資金の上限を広げるか、こだわり条件を外してみてください。</p>
          )}
        </section>
      )}

      <section className={s.section} aria-labelledby="fund-h">
        <div className={s.secHead}>
          <h2 id="fund-h" className={s.h2}>開業資金から探す</h2>
          <p className={s.secLead}>開業資金を数字で確認できた{fundKnown}本部を、金額の帯ごとに分けています。</p>
        </div>
        <FundRuler counts={fundCounts} />
      </section>

      <section className={s.section} aria-labelledby="major-h">
        <div className={s.secHead}>
          <h2 id="major-h" className={s.h2}>業種から探す</h2>
        </div>
        <ul className={s.majors}>
          {majors.map((m) => (
            <li key={m.slug} className={s.major}>
              <Link href={`/gyoshu/${m.slug}/`} className={s.majorHead}>
                <span className={s.majorIcon}><MajorIcon major={m.slug} /></span>
                <span className={s.majorName}>{m.name}</span>
                <span className={s.majorCount}><span className="num">{m.count}</span>本部</span>
              </Link>
              <ul className={s.minors}>
                {m.minors.slice(0, 6).map((mi) => (
                  <li key={mi.slug}>
                    {mi.count >= MINOR_MIN ? <Link href={`/gyoshu/${m.slug}/${mi.slug}/`}>{mi.name}</Link> : mi.name}
                  </li>
                ))}
                {m.minors.length > 6 && <li><Link href={`/gyoshu/${m.slug}/`}>ほか{m.minors.length - 6}業種</Link></li>}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.section} aria-labelledby="tag-h">
        <div className={s.secHead}>
          <h2 id="tag-h" className={s.h2}>こだわり条件から探す</h2>
        </div>
        <ul className={s.tagGrid}>
          {tags.filter((t) => t.count > 0).map((t) => (
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
  const fundKnown = BRANDS.filter((b) => b.fund_band).length;
  const tags = Object.entries(META.tags).map(([slug, name]) => ({ slug, name, count: BRANDS.filter((b) => b.tags.includes(slug)).length }));
  return { props: { rows: BRANDS.map(toRow), majors, fundCounts, fundKnown, tags, total: BRANDS.length } };
}
