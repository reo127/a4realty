import HomeComponent from "./components/Home";

export const metadata = {
  title: "A4Realty — Buy, Sell & Rent Verified Properties in Bangalore | Built on Trust",
  description: "Discover 5,000+ verified properties in Bangalore with A4Realty. Browse apartments, villas, plots & new projects from top builders. Expert guidance for buying, selling & renting. RERA registered.",
  alternates: {
    canonical: "https://www.a4realty.in",
  },
  openGraph: {
    title: "A4Realty — Buy, Sell & Rent Verified Properties in Bangalore",
    description: "Discover 5,000+ verified properties in Bangalore. Browse apartments, villas, plots & new projects from top builders.",
    url: "https://www.a4realty.in",
    type: "website",
  },
};

export default function Home() {
  return <HomeComponent />;
}
