import BlogListingContent from './BlogListingContent';

export const metadata = {
  title: "Real Estate Blog — Property Tips, Market Trends & Investment Guide | A4Realty",
  description: "Expert real estate insights from A4Realty. Read property investment tips, Bangalore market trends, home buying guides, and legal advice for buyers and sellers.",
  alternates: {
    canonical: "https://www.a4realty.in/blog",
  },
  openGraph: {
    title: "Real Estate Blog — Property Tips & Market Trends | A4Realty",
    description: "Expert insights on Bangalore real estate — investment tips, market trends, home buying guides.",
    url: "https://www.a4realty.in/blog",
    type: "website",
  },
};

export default function BlogPage() {
  return <BlogListingContent />;
}
