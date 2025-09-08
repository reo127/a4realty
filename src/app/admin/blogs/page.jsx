'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, statusFilter]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        admin: 'true',
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/blogs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setBlogs(data.data.blogs);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch blogs');
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/blogs/${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchBlogs(); // Refresh the list
      } else {
        alert('Failed to delete blog: ' + data.message);
      }
    } catch (error) {
      alert('Failed to delete blog');
      console.error('Error deleting blog:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D7242A]"></div>
      </div>
    );
  }

  console.log("blogs : ",blogs)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
              <p className="text-gray-600 mt-1">Create and manage your blog posts for SEO</p>
            </div>
            <Link
              href="/admin/blogs/create"
              className="bg-[#D7242A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#D7242A]/90 transition-colors"
            >
              Create New Blog
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7242A] focus:border-[#D7242A] text-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Blog List */}
        <div className="bg-white rounded-lg shadow-sm">
          {blogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blog Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          {blog.featuredImage && (
                            <img
                              src={blog.featuredImage}
                              alt={blog.title}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {blog.title}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {blog.excerpt}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {blog.categories.slice(0, 2).map((category) => (
                                <span
                                  key={category}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                >
                                  {category}
                                </span>
                              ))}
                              {blog.categories.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{blog.categories.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(blog.status)}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{blog.views || 0}</div>
                        <div className="text-xs text-gray-500">{blog.readingTime} min read</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          by {blog.author?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={blog.status === 'published' ? `/blog/${blog.slug}` : `/blog/${blog.slug}?preview=true`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title={blog.status === 'published' ? 'View Blog' : 'Preview Blog'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            href={`/admin/blogs/edit/${blog.slug}`}
                            className="text-[#D7242A] hover:text-[#D7242A]/80"
                            title="Edit Blog"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(blog.slug)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Blog"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No blogs found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first blog post.</p>
              <Link
                href="/admin/blogs/create"
                className="inline-flex items-center px-6 py-3 bg-[#D7242A] text-white font-medium rounded-lg hover:bg-[#D7242A]/90 transition-colors"
              >
                Create New Blog
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-white bg-[#D7242A] border border-transparent rounded-lg hover:bg-[#D7242A]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}