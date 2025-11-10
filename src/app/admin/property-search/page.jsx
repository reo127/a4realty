'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Searchable Select Component
function SearchableSelect({ value, onChange, options, placeholder, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
  };

  const displayValue = value || placeholder;

  return (
    <div ref={wrapperRef} className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer bg-white flex justify-between items-center"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {displayValue}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            <div
              onClick={() => handleSelect('')}
              className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-gray-700"
            >
              {placeholder}
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 hover:bg-indigo-50 cursor-pointer ${
                    value === option ? 'bg-indigo-100 text-indigo-900 font-medium' : 'text-gray-900'
                  }`}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertySearch() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    builder: '',
    project: '',
    location: '',
    market: '',
    configuration: '',
    minPrice: '',
    maxPrice: '',
    possessionDate: '',
    launchDate: '',
    propertyType: '',
    amenities: ''
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    builders: [],
    projects: [],
    locations: [],
    markets: [],
    configurations: []
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    // Check if user is admin or agent
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role !== 'admin' && user.role !== 'agent') {
        router.push('/');
        return;
      }
    }
    loadFilterOptions();
    // Load all properties by default
    searchProperties(1);
  }, [router]);

  const loadFilterOptions = async () => {
    try {
      const [builders, projects, locations, markets, configurations] = await Promise.all([
        fetch('/api/property-sheet/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'builders' })
        }).then(r => r.json()),
        fetch('/api/property-sheet/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'projects' })
        }).then(r => r.json()),
        fetch('/api/property-sheet/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'locations' })
        }).then(r => r.json()),
        fetch('/api/property-sheet/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'markets' })
        }).then(r => r.json()),
        fetch('/api/property-sheet/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'configurations' })
        }).then(r => r.json())
      ]);

      setFilterOptions({
        builders: builders.data || [],
        projects: projects.data || [],
        locations: locations.data || [],
        markets: markets.data || [],
        configurations: configurations.data || []
      });
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const searchProperties = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      params.append('page', page);
      params.append('limit', pagination.limit);

      const response = await fetch(`/api/property-sheet/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProperties(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    searchProperties(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      builder: '',
      project: '',
      location: '',
      market: '',
      configuration: '',
      minPrice: '',
      maxPrice: '',
      possessionDate: '',
      launchDate: '',
      propertyType: '',
      amenities: ''
    });
    setProperties([]);
  };

  const viewDetails = (property) => {
    setSelectedProperty(property);
  };

  const closeDetails = () => {
    setSelectedProperty(null);
  };

  return (
    <div className="p-6 text-black min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Property Search</h1>
          <p className="text-gray-600 mt-2">Find properties quickly during customer calls</p>
        </div>

        {/* Search & Filters Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {/* Quick Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by builder, project, location, amenities..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Search
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-800">
              Advanced Filters
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Builder</label>
                <SearchableSelect
                  value={filters.builder}
                  onChange={(value) => handleFilterChange('builder', value)}
                  options={filterOptions.builders}
                  placeholder="All Builders"
                  label="Builder"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <SearchableSelect
                  value={filters.project}
                  onChange={(value) => handleFilterChange('project', value)}
                  options={filterOptions.projects}
                  placeholder="All Projects"
                  label="Project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <SearchableSelect
                  value={filters.location}
                  onChange={(value) => handleFilterChange('location', value)}
                  options={filterOptions.locations}
                  placeholder="All Locations"
                  label="Location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market</label>
                <SearchableSelect
                  value={filters.market}
                  onChange={(value) => handleFilterChange('market', value)}
                  options={filterOptions.markets}
                  placeholder="All Markets"
                  label="Market"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Configuration (BHK)</label>
                <SearchableSelect
                  value={filters.configuration}
                  onChange={(value) => handleFilterChange('configuration', value)}
                  options={filterOptions.configurations}
                  placeholder="All"
                  label="Configuration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (Lakhs)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="e.g., 50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (Lakhs)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="e.g., 200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <input
                  type="text"
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  placeholder="e.g., APARTMENT, VILLA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Possession Date</label>
                <input
                  type="text"
                  value={filters.possessionDate}
                  onChange={(e) => handleFilterChange('possessionDate', e.target.value)}
                  placeholder="e.g., 2027, December"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                <input
                  type="text"
                  value={filters.amenities}
                  onChange={(e) => handleFilterChange('amenities', e.target.value)}
                  placeholder="e.g., Swimming Pool, Gym"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Clear All
              </button>
            </div>
          </details>
        </div>

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching properties...</p>
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <p className="text-sm text-gray-600">
                Found {pagination.total} properties (Page {pagination.page} of {pagination.totalPages})
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {properties.map((property) => (
                <div key={property._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{property.projectName}</h3>
                      <p className="text-sm text-indigo-600 font-medium">{property.builderName}</p>
                      <p className="text-sm text-gray-600 mt-1">{property.location}</p>
                    </div>
                    <button
                      onClick={() => viewDetails(property)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      View Details
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-500">Configuration</p>
                      <p className="text-sm font-semibold">{property.configuration || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price Range</p>
                      <p className="text-sm font-semibold">{property.price || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Possession</p>
                      <p className="text-sm font-semibold">{property.possessionDate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Market</p>
                      <p className="text-sm font-semibold">{property.market || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => searchProperties(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => searchProperties(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results yet</h3>
            <p className="text-gray-500">Use the search and filters above to find properties</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-indigo-600 text-white p-6 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedProperty.projectName}</h2>
                    <p className="text-indigo-100">{selectedProperty.builderName}</p>
                  </div>
                  <button
                    onClick={closeDetails}
                    className="text-white hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{selectedProperty.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Market</p>
                      <p className="font-medium">{selectedProperty.market || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Configuration</p>
                      <p className="font-medium">{selectedProperty.configuration || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-medium">{selectedProperty.price || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Carpet Area</p>
                      <p className="font-medium">{selectedProperty.carpetArea || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Super Built Area</p>
                      <p className="font-medium">{selectedProperty.superbuiltArea || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Launch Date</p>
                      <p className="font-medium">{selectedProperty.launchDate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Possession Date</p>
                      <p className="font-medium">{selectedProperty.possessionDate || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                {selectedProperty.projectDetails && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Project Details</h3>
                    <p className="text-gray-700 whitespace-pre-line">{selectedProperty.projectDetails}</p>
                  </div>
                )}

                {/* USPs & Highlights */}
                {selectedProperty.uspsHighlights && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">USPs & Highlights</h3>
                    <p className="text-gray-700 whitespace-pre-line">{selectedProperty.uspsHighlights}</p>
                  </div>
                )}

                {/* Amenities */}
                {selectedProperty.amenities && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                    <p className="text-gray-700 whitespace-pre-line">{selectedProperty.amenities}</p>
                  </div>
                )}

                {/* Location Advantage */}
                {selectedProperty.locationAdvantage && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Location Advantage</h3>
                    <p className="text-gray-700 whitespace-pre-line">{selectedProperty.locationAdvantage}</p>
                  </div>
                )}

                {/* Offers */}
                {selectedProperty.offers && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-green-800">Special Offers</h3>
                    <p className="text-green-700">{selectedProperty.offers}</p>
                  </div>
                )}

                {/* Contact */}
                {selectedProperty.channelSalesContact && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-indigo-800">Channel Sales Contact</h3>
                    <p className="text-indigo-700 font-medium">{selectedProperty.channelSalesContact}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
