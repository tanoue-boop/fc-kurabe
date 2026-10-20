import { Exit } from '../lib/data';
import s from '../styles/Brand.module.css';

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

// 送客クリックはすべてGA4イベント fc_outbound で計測する（本部名・出口の種類・掲載ページ）
export default function ExitButton({ exit, brand, slug, primary }: { exit: Exit; brand: string; slug: string; primary?: boolean }) {
  const sponsored = exit.type === 'a8' || exit.type === 'bm';
  const onClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'fc_outbound', {
        brand_slug: slug,
        brand_name: brand,
        exit_type: exit.type,
        page_path: window.location.pathname,
      });
    }
  };
  return (
    <a
      href={exit.url}
      target="_blank"
      rel={sponsored ? 'sponsored noopener' : 'noopener'}
      className={primary ? s.btnPrimary : s.btn}
      onClick={onClick}
    >
      {exit.label}
    </a>
  );
}
