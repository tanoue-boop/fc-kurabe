import { FUNDS, fundIndex } from '../lib/format';
import s from '../styles/FundMeter.module.css';

// 開業資金の帯を5段階のメーターで示す。帯が分からない本部は空のメーター
export default function FundMeter({ band, size = 'sm' }: { band: string | null | undefined; size?: 'sm' | 'md' }) {
  const idx = fundIndex(band);
  const label = idx >= 0 ? `開業資金の目安：${FUNDS[idx].name}` : '開業資金：未確認';
  return (
    <span className={size === 'md' ? s.md : s.sm} role="img" aria-label={label} title={label}>
      {FUNDS.map((f, i) => (
        <span key={f.slug} className={i <= idx ? s[`on${i + 1}`] : s.off} />
      ))}
    </span>
  );
}
