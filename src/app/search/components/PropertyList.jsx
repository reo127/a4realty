/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from '../../../utils/formatPrice';

export default function PropertyList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState({
        location: "",
        mode: "",
        price: "",
        type: "",
        bhk: "",
    });

    // Initialize filters from URL parameters and fetch properties
    useEffect(() => {
        // Read URL parameters and set initial filters
        const initialFilters = {
            location: searchParams.get('q') || searchParams.get('location') || "",
            mode: mapMode(searchParams.get('tab')) || searchParams.get('mode') || "",
            price: searchParams.get('max') || searchParams.get('price') || "",
            type: searchParams.get('type') || "",
            bhk: searchParams.get('bhk') || "",
        };
        
        setFilters(initialFilters);
        
        // Fetch properties with initial filters
        fetchPropertiesWithFilters(initialFilters);
    }, [searchParams]);

    // Map homepage tab to mode
    const mapMode = (tab) => {
        const modeMap = {
            'buy': 'buy',
            'rent': 'rent', 
            'sell': 'sell',
            'new': 'buy' // New projects are typically for buying
        };
        return modeMap[tab] || tab;
    };

    // Map homepage property types to API property types
    const mapPropertyType = (homeType) => {
        const typeMap = {
            'Apartments': 'flat',
            'Villa': 'house',
            'Plot': 'land',
            'Office': 'office',
            'Retail': 'office'
        };
        return typeMap[homeType] || homeType;
    };

    const fetchProperties = async () => {
        await fetchPropertiesWithFilters(filters);
    };

    const fetchPropertiesWithFilters = async (currentFilters = filters) => {
        try {
            setLoading(true);
            
            // Build query string from filters
            const queryParams = new URLSearchParams();
            
            if (currentFilters.location) queryParams.append('location', currentFilters.location);
            if (currentFilters.mode && currentFilters.mode !== 'buy') queryParams.append('mode', currentFilters.mode);
            if (currentFilters.type) queryParams.append('type', currentFilters.type);
            if (currentFilters.bhk) queryParams.append('bhk', currentFilters.bhk);
            if (currentFilters.price) queryParams.append('price', currentFilters.price);
            
            const queryString = queryParams.toString();
            const url = `/api/properties${queryString ? `?${queryString}` : ''}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch properties');
            }
            
            setProperties(data.data);
        } catch (error) {
            console.error('Error fetching properties:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const applyFilters = async () => {
        // Update URL with current filters
        const queryParams = new URLSearchParams();
        
        if (filters.location) queryParams.append('q', filters.location);
        if (filters.mode) queryParams.append('mode', filters.mode);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.bhk) queryParams.append('bhk', filters.bhk);
        if (filters.price) queryParams.append('price', filters.price);
        
        const newUrl = `/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        
        // Update URL without page refresh
        router.push(newUrl, { scroll: false });
        
        // Fetch properties with current filters
        await fetchPropertiesWithFilters(filters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            location: "",
            mode: "",
            price: "",
            type: "",
            bhk: "",
        };
        
        setFilters(clearedFilters);
        
        // Clear URL parameters
        router.push('/search', { scroll: false });
        
        // Fetch all properties without filters
        fetchPropertiesWithFilters(clearedFilters);
    };

    if (loading && properties.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-20 h-20">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Finding your perfect properties...</p>
                </div>
            </div>
        );
    }

    if (error && properties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h3>
                    <p className="text-red-700 mb-6">{error}</p>
                    <button 
                        onClick={fetchProperties}
                        className="px-6 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Enhanced Search and Filter Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <h2 className="text-2xl font-bold text-white mb-2 md:mb-0">Search Properties</h2>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Search Bar */}
                    <div className="p-6 border-b border-gray-100 text-black">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="location"
                                placeholder="Search by location, area, or property name..."
                                value={filters.location}
                                onChange={handleFilterChange}
                                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="p-6 bg-gray-50 text-black">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                                    <select
                                        name="mode"
                                        value={filters.mode}
                                        onChange={handleFilterChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                    >
                                        <option value="">Buy/Sell/Rent</option>
                                        <option value="buy">Buy</option>
                                        <option value="sell">Sell</option>
                                        <option value="rent">Rent</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                                    <select
                                        name="price"
                                        value={filters.price}
                                        onChange={handleFilterChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                    >
                                        <option value="">Any Price</option>
                                        <option value="100000">₹1 Lakh</option>
                                        <option value="500000">₹5 Lakh</option>
                                        <option value="1000000">₹10 Lakh</option>
                                        <option value="5000000">₹50 Lakh</option>
                                        <option value="10000000">₹1 Crore</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        name="type"
                                        value={filters.type}
                                        onChange={handleFilterChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                    >
                                        <option value="">All Types</option>
                                        <option value="flat">Apartment</option>
                                        <option value="house">House</option>
                                        <option value="land">Land</option>
                                        <option value="office">Office Space</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
                                    <select
                                        name="bhk"
                                        value={filters.bhk}
                                        onChange={handleFilterChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                    >
                                        <option value="">Any BHK</option>
                                        <option value="1bhk">1 BHK</option>
                                        <option value="2bhk">2 BHK</option>
                                        <option value="3bhk">3 BHK</option>
                                        <option value="4bhk">4 BHK</option>
                                        <option value="5bhk">5+ BHK</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={applyFilters}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Searching...' : 'Apply Filters'}
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="mb-4 lg:mb-0">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Found
                        </h3>
                        <p className="text-gray-600 mt-1">Discover your perfect property match</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {/* Sort Options */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="popular">Most Popular</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Property Grid/List */}
                {properties.length > 0 ? (
                    <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                        : "space-y-6"
                    }>
                        {properties.map((property) => (
                            <Link href={`/property/${property._id}`} key={property._id}>
                                <div className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                                    viewMode === 'list' ? 'flex' : ''
                                }`}>
                                    <div className={`relative ${viewMode === 'list' ? 'w-80 flex-shrink-0' : 'h-64'}`}>
                                        <img
                                            src={property.gallery[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                            alt={property.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-semibold rounded-full shadow-lg">
                                                For {property.mode}
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                                            {property.gallery && property.gallery.length > 1 && (
                                                <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-md">
                                                    📸 {property.gallery.length} photos
                                                </span>
                                            )}
                                            {property.videos && property.videos.length > 0 && (
                                                <span className="px-2 py-1 bg-purple-600/80 text-white text-xs rounded-md">
                                                    🎬 {property.videos.length} videos
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 flex-1">
                                        <div className="mb-3">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {property.title}
                                            </h3>
                                            <p className="text-gray-600 mt-1 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {property.location}
                                            </p>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                                💰 Price on Request
                                            </p>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                                {property.type}
                                            </span>
                                            {property.bhk && property.bhk !== 'na' && (
                                                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                                    {property.bhk}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Nearby Locations */}
                                        {property.nearbyLocations && property.nearbyLocations.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-2 font-medium">Nearby Areas:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {property.nearbyLocations.slice(0, 3).map((location, index) => (
                                                        <span 
                                                            key={index}
                                                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md"
                                                        >
                                                            {location}
                                                        </span>
                                                    ))}
                                                    {property.nearbyLocations.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                                                            +{property.nearbyLocations.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {new Date(property.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-blue-600 font-medium group-hover:text-blue-700">
                                                View Details →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties Found</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            We couldn't find any properties matching your search criteria. Try adjusting your filters or search terms.
                        </p>
                        <button 
                            onClick={clearFilters}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                            Clear Filters & See All Properties
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
