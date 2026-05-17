import AboutContent from './AboutContent';

export const metadata = {
  title: "About A4Realty — RERA Registered Real Estate Agency in Bangalore",
  description: "A4 Realty is a trusted, RERA-registered real estate agency in Bangalore. 5+ years of experience, 10,000+ happy families, ₹500Cr+ properties sold. Meet our team and learn our story.",
  alternates: {
    canonical: "https://www.a4realty.in/about",
  },
  openGraph: {
    title: "About A4Realty — Trusted Real Estate Agency in Bangalore",
    description: "RERA-registered real estate agency with 5+ years experience. 10,000+ happy families, ₹500Cr+ properties sold across Bangalore.",
    url: "https://www.a4realty.in/about",
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
