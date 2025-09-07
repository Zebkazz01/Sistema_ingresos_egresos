import Head from 'next/head';

interface PageHeadProps {
  title: string;
  description?: string;
  keywords?: string;
}

const PageHead = ({ title, description, keywords }: PageHeadProps) => {
  const siteName = 'App Ingresos y Egresos';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  
  const defaultDescription = 
    description || 'Sistema de gestión de ingresos y egresos financieros';
  
  const defaultKeywords = 
    keywords || 'finanzas, ingresos, egresos, gestión, dinero, contabilidad';

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={defaultDescription} />
      <meta name="keywords" content={defaultKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={defaultDescription} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={defaultDescription} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
    </Head>
  );
};

export default PageHead;
