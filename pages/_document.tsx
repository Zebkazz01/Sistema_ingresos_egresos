import { Html, Head, Main, NextScript } from 'next/document';

const Document = () => (
  <Html lang='es'>
    <Head>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta
        name='description'
        content='Sistema de gestión de ingresos y egresos financieros'
      />
      <meta name='author' content='App Ingresos y Egresos' />
      <link rel='icon' href='/favicon.ico' />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
