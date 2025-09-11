import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navber from "./components/Navber";
import ChatBot from "./components/ChatBot";
import { Analytics } from "@vercel/analytics/next"

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
      { url: "/favicon.ico" },
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
        url: "/finalLogo.jpeg",
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
    images: ["/finalLogo.jpeg"],
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
        <link rel="icon" href="/finalLogo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/finalLogo.jpeg" />
        <meta name="theme-color" content="#D7242A" />
        <meta name="msapplication-TileColor" content="#D7242A" />
        <meta name="msapplication-TileImage" content="/finalLogo.jpeg" />
        <meta property="og:image" content="/finalLogo.jpeg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="600" />
        <meta name="twitter:image" content="/finalLogo.jpeg" />
        <link rel="shortcut icon" href="/finalLogo.jpeg" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <Navber/>
        {children}
        <Analytics />
        <ChatBot/>
      </body>
    </html>
  );
}
