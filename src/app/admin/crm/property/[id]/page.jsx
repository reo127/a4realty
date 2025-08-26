'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/utils/formatPrice';
import { getEmbedUrl, getVideoPlayerProps } from '@/utils/videoUtils';

export default function AdminPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState('images');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is admin
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      if (userData.role !== 'admin') {
        router.push('/admin'); // Redirect non-admin users
        return;
      }
    } else {
      router.push('/login'); // Redirect if not logged in
      return;
    }

    if (params.id) {
      fetchPropertyDetails();
    }
  }, [params.id, router]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch property details');
      }
      
      setProperty(data.data);
    } catch (error) {
      console.error('Error fetching property:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Property</h2>
            <p className="text-red-600">{error || 'Property not found'}</p>
            <div className="mt-4 space-x-4">
              <button 
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Property Details</h1>
                <p className="text-gray-600 mt-1">Complete property information for sales calls</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Admin Only
              </span>
              <Link 
                href="/admin/crm/leads"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to CRM
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Media Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                {/* Property Title and Price */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                    <div className="flex items-center text-lg text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-indigo-600">{formatPrice(property.price)}</div>
                    <div className="text-sm text-gray-500">{property.mode === 'rent' ? 'per month' : ''}</div>
                  </div>
                </div>

                {/* Property Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full capitalize">
                    {property.type}
                  </span>
                  {property.bhk && property.bhk !== 'na' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {property.bhk.toUpperCase()}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
                    For {property.mode}
                  </span>
                  {property.furnishingStatus && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full capitalize">
                      {property.furnishingStatus.replace('-', ' ')}
                    </span>
                  )}
                </div>

                {/* Media Gallery */}
                <div className="space-y-4">
                  {/* Media Tabs */}
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveMediaTab('images')}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeMediaTab === 'images'
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      📸 Images ({property.gallery?.length || 0})
                    </button>
                    {property.videos && property.videos.length > 0 && (
                      <button
                        onClick={() => setActiveMediaTab('videos')}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeMediaTab === 'videos'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        🎬 Videos ({property.videos.length})
                      </button>
                    )}
                  </div>

                  {/* Images Tab */}
                  {activeMediaTab === 'images' && property.gallery && property.gallery.length > 0 && (
                    <div>
                      {/* Main Image */}
                      <div className="relative mb-4">
                        <img
                          src={property.gallery[selectedImageIndex]}
                          alt={property.title}
                          className="w-full h-96 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                          {selectedImageIndex + 1} / {property.gallery.length}
                        </div>
                      </div>
                      
                      {/* Image Thumbnails */}
                      <div className="grid grid-cols-6 gap-2">
                        {property.gallery.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative rounded-lg overflow-hidden border-2 ${
                              selectedImageIndex === index ? 'border-indigo-500' : 'border-gray-200'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${property.title} ${index + 1}`}
                              className="w-full h-16 object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos Tab */}
                  {activeMediaTab === 'videos' && property.videos && property.videos.length > 0 && (
                    <div className="space-y-4">
                      {property.videos.map((videoUrl, index) => {
                        const embedUrl = getEmbedUrl(videoUrl);
                        if (embedUrl) {
                          return (
                            <div key={index} className="relative">
                              <iframe
                                src={embedUrl}
                                title={`Video ${index + 1}`}
                                className="w-full h-64 rounded-lg"
                                frameBorder="0"
                                allowFullScreen
                              ></iframe>
                            </div>
                          );
                        }
                        return (
                          <div key={index} className="bg-gray-100 rounded-lg p-4 text-center">
                            <p className="text-gray-600">Unable to embed video</p>
                            <a 
                              href={videoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 underline"
                            >
                              View Video
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Property Description */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{property.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Detailed Property Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Critical Sales Information */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Contact Number:</span>
                  <a href={`tel:${property.contactNumber}`} className="font-bold text-red-800 hover:text-red-900">
                    {property.contactNumber}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Property ID:</span>
                  <span className="font-medium text-gray-900">{property._id.slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Property Specifications */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
              <div className="space-y-3 text-black">
                {property.yearBuilt && ( 
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Year Built:</span>
                    <span className="font-medium">{property.yearBuilt}</span>
                  </div>
                )}
                {property.squareFootage && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Square Footage:</span>
                    <span className="font-medium">{property.squareFootage} sq ft</span>
                  </div>
                )}
                {property.lotSize && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Lot Size:</span>
                    <span className="font-medium">{property.lotSize}</span>
                  </div>
                )}
                {property.propertyCondition && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Condition:</span>
                    <span className="font-medium capitalize">{property.propertyCondition.replace('-', ' ')}</span>
                  </div>
                )}
                {property.parkingSpaces && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Parking Spaces:</span>
                    <span className="font-medium">{property.parkingSpaces}</span>
                  </div>
                )}
                {property.floorNumber && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Floor:</span>
                    <span className="font-medium">{property.floorNumber}{property.totalFloors ? ` of ${property.totalFloors}` : ''}</span>
                  </div>
                )}
                {property.availabilityDate && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Available From:</span>
                    <span className="font-medium">{formatDate(property.availabilityDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-green-50 rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Financial Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-green-100">
                  <span className="text-sm text-gray-600">Listing Price:</span>
                  <span className="font-bold text-green-700">{formatPrice(property.price)}</span>
                </div>
                {property.hoa && (
                  <div className="flex justify-between py-2 border-b border-green-100">
                    <span className="text-sm text-gray-600">HOA/Maintenance:</span>
                    <span className="font-medium">{property.hoa}</span>
                  </div>
                )}
                {property.propertyTax && (
                  <div className="flex justify-between py-2 border-b border-green-100">
                    <span className="text-sm text-gray-600">Property Tax:</span>
                    <span className="font-medium">{property.propertyTax}</span>
                  </div>
                )}
                {property.schoolDistrict && (
                  <div className="flex justify-between py-2 border-b border-green-100">
                    <span className="text-sm text-gray-600">School District:</span>
                    <span className="font-medium">{property.schoolDistrict}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Amenities */}
            {property.nearbyAmenities && property.nearbyAmenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Nearby Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.nearbyAmenities.map((amenity, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CRM Nearby Locations */}
            {property.nearbyLocations && property.nearbyLocations.length > 0 && (
              <div className="bg-purple-50 rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Also Serves Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.nearbyLocations.map((location, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                      {location}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-purple-600 mt-2">Use for leads interested in these areas</p>
              </div>
            )}

            {/* Property Metadata */}
            <div className="bg-gray-50 rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Information</h3>
              <div className="space-y-2 text-sm text-black">
                <div className="flex justify-between">
                  <span className="text-gray-600">Added Date:</span>
                  <span className="font-medium">{formatDate(property.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property ID:</span>
                  <span className="font-mono text-xs">{property._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed by:</span>
                  <span className="font-medium">{property.user?.name || 'Admin'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}