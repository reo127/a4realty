import { connectDB } from '@/lib/db';
import Blog from '@/models/Blog';
import BlogPostClient from './BlogPostClient';

export async function generateMetadata({ params }) {
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug: params.slug, status: 'published' })
      .select('title seo featuredImage publishedAt author')
      .populate('author', 'name')
      .lean();

    if (!blog) {
      return { title: 'Blog Post Not Found | A4Realty' };
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.a4realty.in';
    const url = `${baseUrl}/blog/${params.slug}`;
    const title = blog.seo?.metaTitle || blog.title;
    const description = blog.seo?.metaDescription || '';
    const image = blog.featuredImage || null;

    return {
      title,
      description,
      keywords: blog.seo?.keywords?.join(', ') || '',
      alternates: {
        canonical: blog.seo?.canonicalUrl || url,
      },
      openGraph: {
        title,
        description,
        url,
        type: 'article',
        siteName: 'A4Realty',
        publishedTime: blog.publishedAt,
        authors: [blog.author?.name || 'A4Realty Team'],
        ...(image && { images: [{ url: image, width: 1200, height: 630, alt: title }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(image && { images: [image] }),
      },
    };
  } catch {
    return { title: 'Blog | A4Realty' };
  }
}

export default function BlogPostPage() {
  return <BlogPostClient />;
}
