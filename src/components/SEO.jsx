import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title,
  description = 'Kreatix Technologies — Software Development, Cybersecurity & Cloud Services. We build secure, scalable digital solutions with innovation and creativity.',
  keywords = 'software development, cybersecurity, VAPT, cloud services, penetration testing, web applications, IT consulting',
  pathname = '',
  image = 'https://kreatixtech.vercel.app/og-image.jpg',
  type = 'website',
  noindex = false,
  structuredData = null,
}) {
  const baseUrl = 'https://kreatixtech.vercel.app';
  const canonical = pathname ? `${baseUrl}${pathname}` : baseUrl;
  const pageTitle = title ? `${title} | Kreatix Technologies` : 'Kreatix Technologies — Software, Cybersecurity & Cloud';

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Kreatix Technologies" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Kreatix Technologies',
  url: 'https://kreatixtech.vercel.app',
  logo: 'https://kreatixtech.vercel.app/favicon.svg',
  description: 'Software Development, Cybersecurity & Cloud Services',
  sameAs: [
    // Add social links when available
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@kreatixtech.com',
    contactType: 'customer service',
    areaServed: 'Global',
    availableLanguage: ['English'],
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Kreatix Technologies',
  url: 'https://kreatixtech.vercel.app',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://kreatixtech.vercel.app/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};
