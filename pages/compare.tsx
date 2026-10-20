import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import FundMeter from '../components/FundMeter';
import Layout, { PageHead } from '../components/Layout';
import { COMPARE_MAX, useCompare } from '../lib/compare';
import { BRANDS, toRow } from '../lib/data';
import type { Row } from '../lib/data';
import { yen } from '../lib/format';
import s from '../styles/Compare.module.css';

export default function Compare({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const { list, toggle, remove, clear, replace } = useCompare();
  const [q, setQ] = useState('');

  // URLの ?b= で本部が指定されていれば、それを比較リストにする
  useEffect(() => {
    if (!router.isReady) return;
    const b = typeof router.query.b === 'string' ? router.query.b.split(',') : [];
    const items = b
      .map((slug) => rows.find((r) => r.slug === slug))
      .filter((r): r is Row => !!r)
      .slice(0, COMPARE_MAX)
      .map((r) => ({ slug: r.slug, brand: r.brand }));
    if (items.length) replace(items);
  }, [router.isReady, router.query.b, rows, replace]);

  const picked = list.map((x) => rows.find((r) => r.slug === x.slug)).filter((r): r is Row => !!r);
  const cand = useMemo(() => {
    const kw = q.trim();
    return kw ? rows.filter((r) => (r.brand + r.minor_name).includes(kw)).slice(0, 12) : [];
  }, [q, rows]);

  const lines: [string, (r: Row) => React.ReactNode][] = [
    ['業種', (r) => r.minor_name],
    ['開業資金', (r) => (
      <>
        <strong className="num">{yen(r.ini) ?? '—'}</strong>
        <span className={s.meter}><FundMeter band={r.fund} /></span>
      </>
    )],
    ['加盟金', (r) => <strong className="num">{yen(r.fee) ?? '—'}</strong>],
    ['ロイヤリティ', (r) => r.roy ?? '—'],
    ['契約期間', (r) => r.term ?? '—'],
    ['契約タイプ', (r) => r.contract_type ?? '—'],
  ];

  return (
    <Layout
      title="フランチャイズ本部の比較表"
      description="気になるフランチャイズ本部を最大4つ選んで、開業資金・加盟金・ロイヤリティ・契約期間を並べて比べられます。"
      crumbs={[{ href: '/compare/', label: '比較表' }]}
    >
      <PageHead title="フランチャイズ本部の比較表" lead={`気になる本部を${COMPARE_MAX}つまで選んで、金額と条件を横に並べて比べられます。`} />

      <div className={s.picker}>
        <label className={s.search}>
          <span>本部を追加する（{list.length}/{COMPARE_MAX}）</span>
          <input
            value={q}
            placeholder="ブランド名・業種名で検索"
            disabled={list.length >= COMPARE_MAX}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        {cand.length > 0 && (
          <ul className={s.cands}>
            {cand.map((r) => {
              const on = list.some((x) => x.slug === r.slug);
              return (
                <li key={r.slug}>
                  <button type="button" disabled={on} onClick={() => { toggle({ slug: r.slug, brand: r.brand }); setQ(''); }}>
                    <span>{r.brand}</span>
                    <small>{on ? '追加済み' : r.minor_name}</small>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {q.trim() && cand.length === 0 && <p className={s.none}>「{q.trim()}」に当てはまる本部はありません。</p>}
      </div>

      {picked.length === 0 ? (
        <div className={s.empty}>
          <p>まだ本部が選ばれていません。</p>
          <p>上の検索欄で追加するか、各一覧の「比較」にチェックを入れてください。</p>
          <Link href="/gyoshu/">業種から本部を探す</Link>
        </div>
      ) : (
        <>
          <div className={s.wrap}>
            <table className={s.table} style={{ ['--cols' as string]: picked.length }}>
              <thead>
                <tr>
                  <th className={s.rowHead} scope="col"><span className={s.vh}>項目</span></th>
                  {picked.map((r) => (
                    <th key={r.slug} scope="col">
                      <Link href={`/brand/${r.slug}/`} className={s.brand}>{r.brand}</Link>
                      <button type="button" className={s.remove} onClick={() => remove(r.slug)}>外す</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map(([k, f]) => (
                  <tr key={k}>
                    <th scope="row" className={s.rowHead}>{k}</th>
                    {picked.map((r) => <td key={r.slug}>{f(r)}</td>)}
                  </tr>
                ))}
                <tr>
                  <th scope="row" className={s.rowHead}>詳しい条件</th>
                  {picked.map((r) => <td key={r.slug}><Link href={`/brand/${r.slug}/`}>出典と内訳を見る</Link></td>)}
                </tr>
              </tbody>
            </table>
          </div>
          <p className={s.foot}>
            <button type="button" className={s.clear} onClick={clear}>比較リストをすべて外す</button>
          </p>
        </>
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  return { props: { rows: BRANDS.map(toRow) } };
}
