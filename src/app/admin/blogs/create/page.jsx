'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import WYSIWYG Editor
const WYSIWYGEditor = dynamic(() => import('@/components/WYSIWYGEditor'), { ssr: false });

export default function CreateBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    categories: '',
    tags: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    },
    status: 'draft'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload/blog-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          featuredImage: data.data.url
        }));
      } else {
        alert('Failed to upload image: ' + data.message);
      }
    } catch (error) {
      alert('Failed to upload image');
      console.error('Error uploading image:', error);
    } finally {
      setImageUploading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const blogData = {
        ...formData,
        status: 'draft',
        categories: formData.categories.split(',').map(cat => cat.trim()).filter(cat => cat),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        seo: {
          ...formData.seo,
          keywords: formData.seo.keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword)
        }
      };

      // Instead of sending to the main API route, we can store it in localStorage
      // for preview purposes. This avoids creating a draft in the database.
      localStorage.setItem('blogPreview', JSON.stringify(blogData));

      // Open a new tab for preview
      const previewUrl = '/blog/preview';
      window.open(previewUrl, '_blank');

    } catch (error) {
      setError('Failed to generate preview');
      console.error('Error generating preview:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Process categories and tags
      const blogData = {
        ...formData,
        categories: formData.categories.split(',').map(cat => cat.trim()).filter(cat => cat),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        seo: {
          ...formData.seo,
          keywords: formData.seo.keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword)
        }
      };

      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData)
      });

      const data = await response.json();
      
      if (data.success) {
        router.push('/admin/blogs');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to create blog');
      console.error('Error creating blog:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
              <p className="text-gray-600 mt-1">Create engaging content to improve your SEO ranking</p>
            </div>
            <Link
              href="/admin/blogs"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Blogs
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-black">
          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Blog Content</h2>
            
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7242A] focus:border-[#D7242A]"
                  placeholder="Enter an engaging blog title"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt *
                  <span className="text-gray-500 font-normal ml-1">(Brief summary for listing pages)</span>
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7242A] focus:border-[#D7242A]"
                  placeholder="Write a compelling excerpt that summarizes your blog post"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.excerpt.length}/300 characters
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      {imageUploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <span className="text-sm text-gray-500">or</span>
                    <input
                      type="url"
                      value={formData.featuredImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7242A] focus:border-[#D7242A]"
                      placeholder="Enter image URL"
                    />
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {formData.featuredImage && (
                    <div className="mt-4">
                      <img
                        src={formData.featuredImage}
                        alt="Featured"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Content *
                </label>
                <div className="focus-within:ring-2 focus-within:ring-[#D7242A] focus-within:border-[#D7242A] rounded-lg">
                  <WYSIWYGEditor
                    value={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="Write your blog content here. Use the toolbar above for rich formatting..."
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Use the toolbar above for rich text formatting. Content will be saved as HTML and displayed properly to your readers.
                </div>
              </div>

              {/* Categories and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories
                    <span className="text-gray-500 font-normal ml-1">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    name="categories"
                    value={formData.categories}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7242A] focus:border-[#D7242A]"
                    placeholder="Real Estate, Investment, Property Tips"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                    <span className="text-gray-500 font-normal ml-1">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7242A] focus:border-[#D7242A]"
                    placeholder="buy property, bangalore, investment"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title *
                  <span className="text-gray-500 font-normal ml-1">(50-60 characters recommended)</span>
                </label>
                <input
                  type="text"
                  name="seo.metaTitle"
                  value={formData.seo.metaTitle}
                  onChange={handleInputChange}
                  required
                  maxLength={60}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7242A] focus:border-[#D7242A]"
                  placeholder="SEO-optimized title for search engines"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.seo.metaTitle.length}/60 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description *
                  <span className="text-gray-500 font-normal ml-1">(150-160 characters recommended)</span>
                </label>
                <textarea
                  name="seo.metaDescription"
                  value={formData.seo.metaDescription}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  maxLength={160}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7242A] focus:border-[#D7242A]"
                  placeholder="Brief description that will appear in search results"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.seo.metaDescription.length}/160 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Keywords
                  <span className="text-gray-500 font-normal ml-1">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  name="seo.keywords"
                  value={formData.seo.keywords}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7242A] focus:border-[#D7242A]"
                  placeholder="property investment, real estate tips, bangalore properties"
                />
              </div>
            </div>
          </div>

          {/* Publish Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Publish Settings</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7242A] focus:border-[#D7242A]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={handlePreview}
              disabled={loading}
              className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
            >
              Preview
            </button>
            <Link
              href="/admin/blogs"
              className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#D7242A] text-white font-medium rounded-lg hover:bg-[#D7242A]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Blog Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}