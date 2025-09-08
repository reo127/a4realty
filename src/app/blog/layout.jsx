export const metadata = {
  title: {
    template: '%s | A4Realty Blog',
    default: 'A4Realty Blog - Real Estate Insights & Property Investment Tips'
  },
  description: 'Expert real estate insights, property investment tips, market trends, and buying guides from A4Realty. Stay informed with our comprehensive blog on real estate in Bangalore and beyond.',
  keywords: [
    'real estate blog',
    'property investment tips',
    'Bangalore real estate',
    'property buying guide',
    'real estate market trends',
    'property investment',
    'real estate advice',
    'property news',
    'housing market',
    'real estate experts'
  ],
  authors: [{ name: 'A4Realty Team' }],
  creator: 'A4Realty',
  publisher: 'A4Realty',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://a4realty.com'),
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'A4Realty Blog - Real Estate Insights & Investment Tips',
    description: 'Expert real estate insights, property investment tips, and market trends from A4Realty professionals.',
    url: '/blog',
    siteName: 'A4Realty',
    images: [
      {
        url: '/finalLogo.jpeg',
        width: 1200,
        height: 630,
        alt: 'A4Realty Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A4Realty Blog - Real Estate Insights & Investment Tips',
    description: 'Expert real estate insights, property investment tips, and market trends from A4Realty professionals.',
    images: ['/finalLogo.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
  },
};

export default function BlogLayout({ children }) {
  return (
    <>
      {children}
      
      {/* JSON-LD Schema for Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "A4Realty Blog",
            "description": "Expert real estate insights, property investment tips, and market trends from A4Realty professionals.",
            "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://a4realty.com'}/blog`,
            "publisher": {
              "@type": "Organization",
              "name": "A4Realty",
              "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://a4realty.com'}/finalLogo.jpeg`
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://a4realty.com'}/blog`
            }
          })
        }}
      />
    </>
  );
}