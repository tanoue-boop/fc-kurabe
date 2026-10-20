import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { ReactNode } from 'react';
import { useCompare } from '../lib/compare';
import { SITE_NAME } from '../lib/format';
import s from '../styles/Layout.module.css';
import CompareBar from './CompareBar';

// GA4 測定ID（公開値）。環境変数があればそちらを優先
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-X6WFH5TMFX';
const SITE_URL = 'https://fc-kurabe.com';

const NAV = [
  { href: '/gyoshu/', label: '業種から探す' },
  { href: '/shikin/', label: '開業資金から探す' },
  { href: '/tag/', label: '条件から探す' },
  { href: '/ranking/', label: 'ランキング' },
];

type Props = {
  title: string;
  description: string;
  children: ReactNode;
  crumbs?: { href: string; label: string }[];
  wide?: boolean;
};

export default function Layout({ title, description, children, crumbs }: Props) {
  const { asPath, pathname } = useRouter();
  const { list } = useCompare();
  const canonical = SITE_URL + asPath.split(/[?#]/)[0];
  const full = title === SITE_NAME ? `${SITE_NAME}｜フランチャイズ本部を開業資金・加盟金・ロイヤリティで比較` : `${title}｜${SITE_NAME}`;
  return (
    <>
      <Head>
        <title>{full}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={canonical} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      {GA_ID && (
        // 本番ドメインだけで計測する（vercel.app・localhostは送らない）
        <Script id="ga" strategy="afterInteractive">{`if(location.hostname==='fc-kurabe.com'){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA_ID}';document.head.appendChild(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GA_ID}');}`}</Script>
      )}
      <header className={s.header}>
        <div className={s.headInner}>
          <Link href="/" className={s.logo} aria-label={`${SITE_NAME} トップへ`}>
            <span className={s.mark} aria-hidden="true">
              <i /><i /><i />
            </span>
            {SITE_NAME}
          </Link>
          <nav className={s.nav} aria-label="サイト内メニュー">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={pathname.startsWith(n.href) ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
            <Link href="/compare/" className={s.compareLink} aria-current={pathname === '/compare' ? 'page' : undefined}>
              比較表{list.length > 0 && <span className={`${s.badge} num`}>{list.length}</span>}
            </Link>
          </nav>
        </div>
      </header>
      <main className={s.main}>
        {crumbs && (
          <ol className={s.crumbs}>
            <li><Link href="/">トップ</Link></li>
            {crumbs.map((c, i) => (
              <li key={c.href}>{i === crumbs.length - 1 ? <span aria-current="page">{c.label}</span> : <Link href={c.href}>{c.label}</Link>}</li>
            ))}
          </ol>
        )}
        {children}
      </main>
      <footer className={s.footer}>
        <div className={s.footInner}>
          <div className={s.footBrand}>
            <p className={s.footLogo}>{SITE_NAME}</p>
            <p>フランチャイズ本部の開業資金・加盟金・ロイヤリティを、出典と確認日を付けて比べられるサイトです。</p>
          </div>
          <nav className={s.footNav} aria-label="フッターメニュー">
            {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
            <Link href="/compare/">比較表</Link>
          </nav>
          <p className={s.footNote}>
            掲載している金額は、各本部の公式ページまたは掲載媒体の表示を、確認日の時点で転記したものです。条件は変わることがあるため、最新の内容は各本部の資料や説明会でご確認ください。
          </p>
          <p className={s.footOwner}>運営：株式会社mjo</p>
        </div>
      </footer>
      {pathname !== '/compare' && <CompareBar />}
    </>
  );
}

// 各ページの見出し部分（PR表記・H1・説明文）。photo を渡すと写真の帯の上に見出しを置く
export function PageHead({ title, lead, children, photo }: { title: string; lead?: ReactNode; children?: ReactNode; photo?: string }) {
  if (photo) {
    return (
      <div className={s.photoHead}>
        <img src={photo} alt="" width={1536} height={1024} />
        <div className={s.photoShade} />
        <div className={s.photoText}>
          <p className={s.prLight}>PR</p>
          <h1 className={s.h1}>{title}</h1>
          {lead && <p className={s.lead}>{lead}</p>}
        </div>
        {children && <div className={s.photoExtra}>{children}</div>}
      </div>
    );
  }
  return (
    <div className={s.pageHead}>
      <p className={s.pr}>PR</p>
      <h1 className={s.h1}>{title}</h1>
      {lead && <p className={s.lead}>{lead}</p>}
      {children}
    </div>
  );
}
