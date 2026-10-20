import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { ReactNode } from 'react';
import { SITE_NAME } from '../lib/data';
import s from '../styles/Layout.module.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

type Props = { title: string; description: string; children: ReactNode; crumbs?: { href: string; label: string }[] };

export default function Layout({ title, description, children, crumbs }: Props) {
  const full = title === SITE_NAME ? title : `${title}｜${SITE_NAME}`;
  return (
    <>
      <Head>
        <title>{full}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}</Script>
        </>
      )}
      <header className={s.header}>
        <div className={s.inner}>
          <Link href="/" className={s.logo}>{SITE_NAME}</Link>
          <nav className={s.nav}>
            <Link href="/gyoshu/">業種から探す</Link>
            <Link href="/shikin/">資金から探す</Link>
            <Link href="/tag/">条件から探す</Link>
            <Link href="/ranking/">ランキング</Link>
            <Link href="/compare/">比較表</Link>
          </nav>
        </div>
      </header>
      <main className={s.main}>
        {crumbs && (
          <ol className={s.crumbs}>
            <li><Link href="/">トップ</Link></li>
            {crumbs.map((c) => (
              <li key={c.href}><Link href={c.href}>{c.label}</Link></li>
            ))}
          </ol>
        )}
        {children}
      </main>
      <footer className={s.footer}>
        <div className={s.inner}>
          <p>掲載している金額は、各本部の公式ページまたは掲載媒体の表示を確認日時点で転記したものです。最新の条件は必ず各本部の資料・説明会でご確認ください。</p>
          <p>運営：株式会社mjo</p>
        </div>
      </footer>
    </>
  );
}
