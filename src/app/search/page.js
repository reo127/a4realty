import { Suspense } from "react";
import { Cinzel, Josefin_Sans } from "next/font/google";
import Footer from "../components/Footer";
import PropertyList from "./components/PropertyList";
import MobileStickyCTA from "../components/MobileStickyCTA";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
});

export const metadata = {
  title: "Search Properties in Bangalore — Buy, Rent & New Projects | A4Realty",
  description: "Search verified properties in Bangalore. Filter by location, price, BHK, type — apartments, villas, plots, new projects. Find your dream home with A4Realty.",
  alternates: {
    canonical: "https://www.a4realty.in/search",
  },
  openGraph: {
    title: "Search Properties in Bangalore — A4Realty",
    description: "Browse 5,000+ verified properties. Filter by apartments, villas, plots, new projects across Bangalore.",
    url: "https://www.a4realty.in/search",
    type: "website",
  },
};

function SearchFallback() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#D7242A]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#D7242A] rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium tracking-wide" style={{ fontFamily: 'var(--font-josefin)' }}>Loading search results...</p>
      </div>
    </div>
  );
}

export default function Search() {
  return (
    <div className={`${cinzel.variable} ${josefinSans.variable} min-h-screen bg-gray-50 pb-20 lg:pb-0`}>
      <MobileStickyCTA />
      <Suspense fallback={<SearchFallback />}>
        <PropertyList/>
      </Suspense>
      <Footer/>
    </div>
  );
}
