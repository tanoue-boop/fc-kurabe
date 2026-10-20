import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { BRANDS, Row, toRow, yen } from '../lib/data';
import s from '../styles/Home.module.css';
import t from '../styles/Table.module.css';

const MAX = 4;

export default function Compare({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [sel, setSel] = useState<string[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => {
    const b = typeof router.query.b === 'string' ? router.query.b.split(',') : [];
    if (b.length) setSel(b.filter((x) => rows.some((r) => r.slug === x)).slice(0, MAX));
  }, [router.query.b, rows]);

  const picked = sel.map((x) => rows.find((r) => r.slug === x)!).filter(Boolean);
  const cand = useMemo(() => (q ? rows.filter((r) => (r.brand + r.minor_name).includes(q)).slice(0, 20) : []), [q, rows]);
  const lines: [string, (r: Row) => string][] = [
    ['業種', (r) => r.minor_name],
    ['開業資金', (r) => yen(r.ini) ?? '—'],
    ['加盟金', (r) => yen(r.fee) ?? '—'],
    ['ロイヤリティ', (r) => r.roy ?? '—'],
    ['契約期間', (r) => r.term ?? '—'],
    ['契約タイプ', (r) => r.contract_type ?? '—'],
  ];

  return (
    <Layout title="フランチャイズ本部の比較表" description="気になるフランチャイズ本部を最大4つ選んで、開業資金・加盟金・ロイヤリティ・契約期間を並べて比較。" crumbs={[{ href: '/compare/', label: '比較表' }]}>
      <p className={s.pr}>PR</p>
      <h1 className={s.h1}>フランチャイズ本部の比較表</h1>
      <div className={s.field}>
        <label>本部を追加（最大{MAX}つ）</label>
        <input value={q} placeholder="ブランド名・業種で検索" onChange={(e) => setQ(e.target.value)} />
      </div>
      {cand.length > 0 && (
        <div className={s.chips}>
          {cand.map((r) => (
            <button key={r.slug} className={s.tag} disabled={sel.length >= MAX || sel.includes(r.slug)} onClick={() => { setSel([...sel, r.slug]); setQ(''); }}>
              {r.brand}
            </button>
          ))}
        </div>
      )}
      {picked.length > 0 && (
        <div className={t.wrap}>
          <table className={t.table}>
            <thead>
              <tr>
                <th></th>
                {picked.map((r) => (
                  <th key={r.slug}>
                    <Link href={`/brand/${r.slug}/`}>{r.brand}</Link>
                    <button className={t.remove} onClick={() => setSel(sel.filter((x) => x !== r.slug))}>外す</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map(([k, f]) => (
                <tr key={k}><th>{k}</th>{picked.map((r) => <td key={r.slug}>{f(r)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  return { props: { rows: BRANDS.map(toRow) } };
}
