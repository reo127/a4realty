import { connectDB } from '@/lib/db';
import Property from '@/models/Property';
import Footer from "@/app/components/Footer";
import PropertyDetails from "../../../components/PropertyDetails";

async function getProperty(id) {
  try {
    await connectDB();
    const property = await Property.findById(id).lean();
    if (!property) return null;
    // Convert to plain JSON (removes Mongoose internals, ObjectIds become strings)
    return JSON.parse(JSON.stringify(property));
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const property = await getProperty(params.id);

  if (!property || property.status !== 'approved') {
    return { title: 'Property Not Found | A4Realty' };
  }

  const bhkStr = property.bhk ? `${property.bhk.toUpperCase()} ` : '';
  const typeStr = property.type ? property.type.replace(/-/g, ' ') : 'Property';
  const title = `${property.title} - ${bhkStr}${typeStr} in ${property.location} | A4Realty`;

  const description = property.description
    ? property.description.replace(/<[^>]*>/g, '').substring(0, 160)
    : `${bhkStr}${typeStr} in ${property.location} at ${property.price}. Explore premium real estate listings at A4Realty.`;

  const image = property.images?.[0] || null;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.a4realty.in';
  const url = `${baseUrl}/property/${params.slug}/${params.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'A4Realty',
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: property.title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function PropertyPage({ params }) {
  const initialData = await getProperty(params.id);

  return (
    <>
      <PropertyDetails initialData={initialData} />
      <Footer />
    </>
  );
}
