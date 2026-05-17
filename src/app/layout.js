import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navber from "./components/Navber";
// import ChatBot from "./components/ChatBot";
import FloatingContact from "./components/FloatingContact";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "A4Realty - Premium Property Solutions",
  description: "Discover premium properties, new projects, and verified listings with A4Realty. Your trusted partner for buying, selling, and renting properties across India.",
  keywords: "real estate, property, buy property, rent property, new projects, verified listings, A4Realty, premium properties, India",
  authors: [{ name: "A4Realty" }],
  creator: "A4Realty",
  publisher: "A4Realty",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/finalLogo.jpeg", type: "image/jpeg" },
      { url: "/serachLogo.png" },
    ],
    apple: "/finalLogo.jpeg",
  },
  openGraph: {
    title: "A4Realty - Premium Property Solutions | Built on Trust",
    description: "Discover premium properties, new projects, and verified listings with A4Realty. Your trusted partner for buying, selling, and renting properties across India.",
    url: "https://a4realty.vercel.app",
    siteName: "A4Realty",
    images: [
      {
        url: "/serachLogo.png",
        // url: "/finalLogo.jpeg",

        width: 1200,
        height: 600,
        alt: "A4Realty - Built on Trust",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "A4Realty - Premium Property Solutions",
    description: "Discover premium properties, new projects, and verified listings with A4Realty. Your trusted partner for buying, selling, and renting properties across India.",
    images: ["/serachLogo.png"],
    // images: ["/finalLogo.jpeg"],

  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5M99MMM8');
          `}
        </Script>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-17580329809"
        ></Script>
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17580329809');
            gtag('config', 'G-3MYC2LLS31');
          `}
        </Script>
        {/* ContentSquare / Hotjar Analytics */}
        <Script
          src="https://t.contentsquare.net/uxa/78bbf96b8c928.js"
          strategy="afterInteractive"
        />
        <link rel="icon" href="/finalLogo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/finalLogo.jpeg" />
        <meta name="theme-color" content="#D7242A" />
        <meta name="msapplication-TileColor" content="#D7242A" />
        <meta name="msapplication-TileImage" content="/finalLogo.jpeg" />
        <meta property="og:image" content="/serachLogo.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="600" />
        <meta name="twitter:image" content="/serachLogo.png" />
        <link rel="shortcut icon" href="/finalLogo.jpeg" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5M99MMM8"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {/* Organization + WebSite Structured Data — helps Google & AI assistants understand A4Realty */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "RealEstateAgent",
                  "@id": "https://www.a4realty.in/#organization",
                  "name": "A4 Realty",
                  "alternateName": "A4Realty",
                  "url": "https://www.a4realty.in",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.a4realty.in/finalLogo.jpeg",
                    "width": 200,
                    "height": 60
                  },
                  "image": "https://www.a4realty.in/serachLogo.png",
                  "description": "A4 Realty is a premium real estate agency in Bangalore offering verified property listings, new residential projects, and expert guidance for buying, selling, and renting properties across India.",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "No.184, A4 Realty, Hennur Cross, 3rd Cross, Narayanappa Road, Kalyan Nagar Post",
                    "addressLocality": "Bengaluru",
                    "addressRegion": "Karnataka",
                    "postalCode": "560043",
                    "addressCountry": "IN"
                  },
                  "telephone": "+91-9002981353",
                  "contactPoint": [
                    {
                      "@type": "ContactPoint",
                      "telephone": "+91-9002981353",
                      "contactType": "sales",
                      "areaServed": "IN",
                      "availableLanguage": ["English", "Hindi"]
                    }
                  ],
                  "areaServed": {
                    "@type": "City",
                    "name": "Bengaluru"
                  },
                  "knowsAbout": ["Real Estate", "Property Investment", "Residential Properties", "New Projects", "Apartments", "Villas", "Plots"],
                  "slogan": "Built on Trust",
                  "foundingDate": "2020",
                  "numberOfEmployees": { "@type": "QuantitativeValue", "value": 50 },
                  "sameAs": [
                    "https://www.a4realty.in"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.a4realty.in/#website",
                  "url": "https://www.a4realty.in",
                  "name": "A4Realty",
                  "description": "Premium Property Solutions — Buy, Sell & Rent Verified Properties in India",
                  "publisher": { "@id": "https://www.a4realty.in/#organization" },
                  "inLanguage": "en-IN",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://www.a4realty.in/search?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
        <Navber/>
        {children}
        <Analytics />
        {/* <ChatBot/> */}
        <FloatingContact/>
      </body>
    </html>
  );
}
