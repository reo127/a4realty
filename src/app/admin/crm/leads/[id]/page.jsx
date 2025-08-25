'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLocationDisplayName, getNearbyLocations, normalizeLocationName } from '@/utils/locations';
import { formatPrice } from '@/utils/formatPrice';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [relatedProperties, setRelatedProperties] = useState([]);
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('exact');

  useEffect(() => {
    if (params.id) {
      fetchLeadDetails();
    }
  }, [params.id]);

  useEffect(() => {
    if (lead?.interestedLocation) {
      fetchRelatedProperties();
    }
  }, [lead]);

  const fetchLeadDetails = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      
      if (data.success) {
        const foundLead = data.data.find(l => l._id === params.id);
        if (foundLead) {
          setLead(foundLead);
        } else {
          throw new Error('Lead not found');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch lead details');
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      setError(error.message);
    }
  };

  const fetchRelatedProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      const data = await response.json();
      
      if (data.success) {
        const allProperties = data.data;
        const interestedLocation = normalizeLocationName(lead.interestedLocation);
        
        // Exact location matches
        const exactMatches = allProperties.filter(property => 
          normalizeLocationName(property.location) === interestedLocation
        );
        
        // Nearby location matches
        const nearbyLocations = getNearbyLocations(interestedLocation);
        const nearbyMatches = allProperties.filter(property => {
          const propLocation = normalizeLocationName(property.location);
          return nearbyLocations.some(nearby => 
            normalizeLocationName(nearby) === propLocation
          );
        });
        
        setRelatedProperties(exactMatches);
        setNearbyProperties(nearbyMatches);
      } else {
        throw new Error(data.message || 'Failed to fetch properties');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const PropertyCard = ({ property, isNearby = false }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Property Image */}
      {property.gallery && property.gallery.length > 0 && (
        <div className="relative h-48 bg-gray-200">
          <img 
            src={property.gallery[0]} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {isNearby && (
            <span className="absolute top-2 left-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Nearby
            </span>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              📸 {property.gallery.length} photos
            </div>
            {property.videos && property.videos.length > 0 && (
              <div className="bg-purple-600 bg-opacity-90 text-white px-2 py-1 rounded text-xs">
                🎬 {property.videos.length} videos
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="p-4">
        {/* Property Title & Price */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {property.title}
          </h3>
          <div className="text-right ml-4">
            <div className="text-lg font-bold text-indigo-600">
              {formatPrice(property.price)}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center mb-2">
          <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm text-gray-600">{getLocationDisplayName(property.location)}</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-medium">{property.type}</span>
          </div>
          {property.bhk && property.bhk !== 'na' && (
            <div className="flex items-center">
              <span className="font-medium">{property.bhk}</span>
            </div>
          )}
          <div className="flex items-center">
            <span className="capitalize">{property.mode}</span>
          </div>
        </div>

        {/* CRM-specific details */}
        <div className="border-t pt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {property.squareFootage && (
              <div>
                <span className="text-gray-500">Area:</span>
                <span className="ml-1 font-medium">{property.squareFootage} sq ft</span>
              </div>
            )}
            {property.yearBuilt && (
              <div>
                <span className="text-gray-500">Built:</span>
                <span className="ml-1 font-medium">{property.yearBuilt}</span>
              </div>
            )}
            {property.parkingSpaces && (
              <div>
                <span className="text-gray-500">Parking:</span>
                <span className="ml-1 font-medium">{property.parkingSpaces} spaces</span>
              </div>
            )}
            {property.furnishingStatus && (
              <div>
                <span className="text-gray-500">Furnishing:</span>
                <span className="ml-1 font-medium capitalize">{property.furnishingStatus}</span>
              </div>
            )}
            {property.floorNumber && (
              <div>
                <span className="text-gray-500">Floor:</span>
                <span className="ml-1 font-medium">{property.floorNumber}/{property.totalFloors || 'N/A'}</span>
              </div>
            )}
            {property.propertyCondition && (
              <div>
                <span className="text-gray-500">Condition:</span>
                <span className="ml-1 font-medium capitalize">{property.propertyCondition}</span>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Contact:</span>
              <a 
                href={`tel:${property.contactNumber}`}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {property.contactNumber}
              </a>
            </div>
          </div>

          {/* Property Actions */}
          <div className="flex gap-2 pt-2">
            <Link
              href={`/property/${property._id}`}
              className="flex-1 text-center px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
            >
              View Full Details
            </Link>
          </div>
        </div>

        {/* Additional Details for CRM */}
        {(property.amenities?.length > 0 || property.nearbyAmenities?.length > 0) && (
          <div className="mt-3 pt-3 border-t">
            {property.amenities?.length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-gray-500 block mb-1">Amenities:</span>
                <div className="flex flex-wrap gap-1">
                  {property.amenities.slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      {amenity}
                    </span>
                  ))}
                  {property.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{property.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {property.nearbyAmenities?.length > 0 && (
              <div>
                <span className="text-xs text-gray-500 block mb-1">Nearby:</span>
                <div className="flex flex-wrap gap-1">
                  {property.nearbyAmenities.slice(0, 2).map((amenity, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {amenity}
                    </span>
                  ))}
                  {property.nearbyAmenities.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{property.nearbyAmenities.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Lead</h2>
            <p className="text-red-600">{error || 'Lead not found'}</p>
            <div className="mt-4 space-x-4">
              <button 
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              {error && (
                <button 
                  onClick={fetchLeadDetails}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              )}
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
              <Link
                href="/admin/crm/leads"
                className="text-indigo-600 hover:text-indigo-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lead Details</h1>
                <p className="text-gray-600 mt-1">ID: {lead._id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Lead Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-600 font-bold text-xl">
                    {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{lead.name}</h2>
                <p className="text-gray-600">Lead ID: {lead._id.slice(-8)}</p>
              </div>

              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a href={`tel:${lead.phone}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                      {lead.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                {lead.email && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a href={`mailto:${lead.email}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                        {lead.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Interested Location */}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Interested Location</p>
                    <p className="font-medium text-gray-900">
                      {getLocationDisplayName(lead.interestedLocation)}
                    </p>
                  </div>
                </div>

                {/* Date Added */}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Date Added</p>
                    <p className="font-medium text-gray-900">{formatDate(lead.createdAt)}</p>
                  </div>
                </div>

                {/* Source */}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Source</p>
                    <p className="font-medium text-gray-900 capitalize">{lead.source || 'Website'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Related Properties */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Properties</h3>
              
              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('exact')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'exact'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Exact Location ({relatedProperties.length})
                </button>
                <button
                  onClick={() => setActiveTab('nearby')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'nearby'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Nearby Locations ({nearbyProperties.length})
                </button>
              </div>

              {/* Property Lists */}
              {activeTab === 'exact' && (
                <div>
                  {relatedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {relatedProperties.map(property => (
                        <PropertyCard key={property._id} property={property} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 012-2h2a2 2 0 012 2v12M13 7a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h4>
                      <p className="text-gray-600">No properties found in {getLocationDisplayName(lead.interestedLocation)}.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'nearby' && (
                <div>
                  {nearbyProperties.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {nearbyProperties.map(property => (
                        <PropertyCard key={property._id} property={property} isNearby={true} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 012-2h2a2 2 0 012 2v12M13 7a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Nearby Properties Found</h4>
                      <p className="text-gray-600">No properties found in nearby locations.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}