import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@600;700;900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#2b2b2b" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
