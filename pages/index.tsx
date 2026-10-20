import Link from 'next/link';
import { useMemo, useState } from 'react';
import BrandTable from '../components/BrandTable';
import Layout from '../components/Layout';
import { BRANDS, META, Row, SITE_NAME, majorsWithCount, minorsOf, toRow } from '../lib/data';
import s from '../styles/Home.module.css';

type Props = {
  rows: Row[];
  majors: { slug: string; name: string; count: number; minors: { slug: string; name: string; count: number }[] }[];
  funds: { slug: string; name: string; count: number }[];
  tags: { slug: string; name: string; count: number }[];
  total: number;
};

const BUDGET_MAX = [
  { v: 0, label: '指定なし' },
  { v: 1_000_000, label: '100万円以内' },
  { v: 3_000_000, label: '300万円以内' },
  { v: 5_000_000, label: '500万円以内' },
  { v: 10_000_000, label: '1,000万円以内' },
];

export default function Home({ rows, majors, funds, tags, total }: Props) {
  const [major, setMajor] = useState('');
  const [minor, setMinor] = useState('');
  const [budget, setBudget] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [roy0, setRoy0] = useState(false);
  const [q, setQ] = useState('');
  const [touched, setTouched] = useState(false);

  const minors = majors.find((m) => m.slug === major)?.minors || [];
  const hits = useMemo(() => {
    return rows.filter((r) => {
      if (major && r.major !== major) return false;
      if (minor && r.minor !== minor) return false;
      if (budget && (r.ini === null || r.ini > budget)) return false;
      if (roy0 && r.royRate !== 0) return false;
      if (picked.some((t) => !r.tags.includes(t))) return false;
      if (q && !(r.brand + r.minor_name).includes(q)) return false;
      return true;
    });
  }, [rows, major, minor, budget, roy0, picked, q]);

  const toggle = (t: string) => {
    setTouched(true);
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  };

  return (
    <Layout
      title={SITE_NAME}
      description={`フランチャイズ・独立開業の本部${total}件を、業種・開業資金・加盟金・ロイヤリティで比較。金額は公式ページで確認した数字に出典と確認日を付けて掲載しています。`}
    >
      <section className={s.hero}>
        <p className={s.pr}>PR</p>
        <h1 className={s.h1}>フランチャイズ・独立開業の本部を、数字で比べて探す</h1>
        <p className={s.lead}>掲載{total}本部。開業資金・加盟金・ロイヤリティを同じ表で比べられます。</p>

        <div className={s.search}>
          <div className={s.field}>
            <label>キーワード</label>
            <input value={q} placeholder="ブランド名・業種" onChange={(e) => { setTouched(true); setQ(e.target.value); }} />
          </div>
          <div className={s.field}>
            <label>業種</label>
            <select value={major} onChange={(e) => { setTouched(true); setMajor(e.target.value); setMinor(''); }}>
              <option value="">すべて</option>
              {majors.map((m) => <option key={m.slug} value={m.slug}>{m.name}（{m.count}）</option>)}
            </select>
          </div>
          <div className={s.field}>
            <label>詳しい業種</label>
            <select value={minor} disabled={!major} onChange={(e) => { setTouched(true); setMinor(e.target.value); }}>
              <option value="">すべて</option>
              {minors.map((m) => <option key={m.slug} value={m.slug}>{m.name}（{m.count}）</option>)}
            </select>
          </div>
          <div className={s.field}>
            <label>開業資金</label>
            <select value={budget} onChange={(e) => { setTouched(true); setBudget(Number(e.target.value)); }}>
              {BUDGET_MAX.map((b) => <option key={b.v} value={b.v}>{b.label}</option>)}
            </select>
          </div>
          <div className={s.tagRow}>
            {tags.map((t) => (
              <button key={t.slug} className={picked.includes(t.slug) ? s.tagOn : s.tag} onClick={() => toggle(t.slug)}>
                {t.name}
              </button>
            ))}
            <button className={roy0 ? s.tagOn : s.tag} onClick={() => { setTouched(true); setRoy0(!roy0); }}>ロイヤリティなし</button>
          </div>
        </div>
      </section>

      {touched && (
        <section className={s.section}>
          <h2 className={s.h2}>検索結果</h2>
          <BrandTable rows={hits} />
        </section>
      )}

      <section className={s.section}>
        <h2 className={s.h2}>業種から探す</h2>
        <div className={s.grid}>
          {majors.map((m) => (
            <div key={m.slug} className={s.card}>
              <Link href={`/gyoshu/${m.slug}/`} className={s.cardTitle}>{m.name}<span>{m.count}件</span></Link>
              <ul className={s.minorList}>
                {m.minors.map((mi) => (
                  <li key={mi.slug}>{mi.name}（{mi.count}）</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>開業資金から探す</h2>
        <div className={s.chips}>
          {funds.map((f) => (
            <Link key={f.slug} href={`/shikin/${f.slug}/`} className={s.chip}>{f.name}<span>{f.count}件</span></Link>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>こだわり条件から探す</h2>
        <div className={s.chips}>
          {tags.filter((t) => t.count > 0).map((t) => (
            <Link key={t.slug} href={`/tag/${t.slug}/`} className={s.chip}>{t.name}<span>{t.count}件</span></Link>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>条件別ランキング</h2>
        <div className={s.chips}>
          <Link href="/ranking/#ini" className={s.chip}>開業資金が低い順</Link>
          <Link href="/ranking/#roy" className={s.chip}>ロイヤリティ率が低い順</Link>
          <Link href="/ranking/#roy0" className={s.chip}>ロイヤリティなしの本部</Link>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const majors = majorsWithCount().map((m) => ({ ...m, minors: minorsOf(m.slug) }));
  const funds = META.funds.map((f) => ({ ...f, count: BRANDS.filter((b) => b.fund_band === f.slug).length }));
  const tags = Object.entries(META.tags).map(([slug, name]) => ({ slug, name, count: BRANDS.filter((b) => b.tags.includes(slug)).length }));
  return { props: { rows: BRANDS.map(toRow), majors, funds, tags, total: BRANDS.length } };
}
