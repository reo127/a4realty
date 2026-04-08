/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from '../../../utils/formatPrice';
import { generatePropertyUrl } from '@/utils/slugify';

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
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#D7242A]/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#D7242A] rounded-full animate-spin border-t-transparent"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Finding your perfect properties...</p>
                </div>
            </div>
        );
    }

    if (error && properties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="bg-[#D7242A]/5 border border-[#D7242A]/20 rounded-xl p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-[#D7242A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[#D7242A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#D7242A] mb-2">Something went wrong</h3>
                    <p className="text-[#D7242A]/80 mb-6">{error}</p>
                    <button 
                        onClick={fetchProperties}
                        className="px-6 py-3 rounded-lg bg-[#D7242A] text-white font-medium hover:bg-[#D7242A]/90 transition-colors"
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
                    <div className="bg-gradient-to-r from-[#D7242A] to-[#D7242A]/90 px-6 py-4">
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
                                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="p-6 bg-gray-50 border-t border-gray-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Transaction Type</label>
                                    <div className="relative">
                                        <select
                                            name="mode"
                                            value={filters.mode}
                                            onChange={handleFilterChange}
                                            className="w-full appearance-none pl-4 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 font-semibold focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none cursor-pointer shadow-sm"
                                        >
                                            <option value="">Any Type</option>
                                            <option value="buy">For Buy</option>
                                            <option value="rent">For Rent</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Max Budget</label>
                                    <div className="relative">
                                        <select
                                            name="price"
                                            value={filters.price}
                                            onChange={handleFilterChange}
                                            className="w-full appearance-none pl-4 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 font-semibold focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none cursor-pointer shadow-sm"
                                        >
                                            <option value="">No Limit</option>
                                            <option value="5000000">₹50 Lacs</option>
                                            <option value="10000000">₹1 Crore</option>
                                            <option value="20000000">₹2 Crore</option>
                                            <option value="50000000">₹5 Crore+</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Property Category</label>
                                    <div className="relative">
                                        <select
                                            name="type"
                                            value={filters.type}
                                            onChange={handleFilterChange}
                                            className="w-full appearance-none pl-4 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 font-semibold focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none cursor-pointer shadow-sm"
                                        >
                                            <option value="">All Categories</option>
                                            <option value="flat">Apartments</option>
                                            <option value="house">Villa / House</option>
                                            <option value="land">Plots / Land</option>
                                            <option value="office">Commercial</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Configuration</label>
                                    <div className="relative">
                                        <select
                                            name="bhk"
                                            value={filters.bhk}
                                            onChange={handleFilterChange}
                                            className="w-full appearance-none pl-4 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 font-semibold focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none cursor-pointer shadow-sm"
                                        >
                                            <option value="">Any BHK</option>
                                            <option value="1bhk">1 BHK</option>
                                            <option value="2bhk">2 BHK</option>
                                            <option value="3bhk">3 BHK</option>
                                            <option value="4bhk">4 BHK</option>
                                            <option value="5bhk">5+ BHK</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={applyFilters}
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-[#D7242A] text-white font-extrabold rounded-2xl hover:bg-[#D7242A]/90 shadow-xl shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            Search Matching Properties
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="mb-4 lg:mb-0">
                        <div className="flex items-center gap-2">
                            <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
                            <h3 className="text-xl font-extrabold text-gray-900">
                                {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Available
                            </h3>
                        </div>
                        <p className="text-gray-500 mt-1 text-sm font-medium">Showing verified listings in {filters.location || "all locations"}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Sort Options */}
                        <div className="relative flex-1 sm:flex-none">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:bg-white focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="popular">Most Popular</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="hidden sm:flex bg-gray-50 border border-gray-200 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' 
                                    ? 'bg-white text-[#D7242A] shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' 
                                    ? 'bg-white text-[#D7242A] shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600'}`}
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
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {properties.map((property) => (
                            <div
                                key={property._id}
                                className={`group bg-white overflow-hidden rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-500 ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}`}
                            >
                                <Link 
                                    href={generatePropertyUrl(property)} 
                                    className={`relative block overflow-hidden ${viewMode === 'list' ? 'w-full md:w-80 h-64 md:h-auto' : 'h-60'}`}
                                >
                                    <img
                                        src={property.gallery?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        alt={property.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute left-4 top-4 flex gap-2">
                                        <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold rounded bg-white/95 text-gray-900 shadow-sm uppercase tracking-wider">
                                            For {property.mode}
                                        </span>
                                        {property.status === 'Ready to Move' && (
                                            <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold rounded bg-[#D7242A] text-white shadow-sm uppercase tracking-wider">
                                                Ready
                                            </span>
                                        )}
                                    </div>
                                </Link>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <Link href={generatePropertyUrl(property)}>
                                                <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-[#D7242A] transition-colors line-clamp-1">{property.title}</h3>
                                            </Link>
                                            <button className="text-gray-400 hover:text-[#D7242A] transition-colors">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                            </button>
                                        </div>
                                        
                                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4">
                                            <svg className="w-4 h-4 text-[#D7242A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {property.location}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="px-2 py-1 text-[11px] font-bold uppercase rounded bg-green-50 text-green-700 border border-green-100">
                                                Verified
                                            </span>
                                            <span className="px-2 py-1 text-[11px] font-bold uppercase rounded bg-blue-50 text-blue-700 border border-blue-100">
                                                {property.type}
                                            </span>
                                            {property.bhk && property.bhk !== 'na' && (
                                                <span className="px-2 py-1 text-[11px] font-bold uppercase rounded bg-orange-50 text-orange-700 border border-orange-100">
                                                    {property.bhk}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <p className="text-2xl font-black text-[#D7242A]">
                                            {property.price ? formatPrice(property.price) : 'Price on Request'}
                                        </p>
                                        <div className="flex gap-2">
                                            <a 
                                                href={`https://wa.me/91XXXXXXXXXX?text=Hi, I am interested in ${property.title} (${property.location})`}
                                                className="p-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-500/20"
                                            >
                                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            </a>
                                            <Link 
                                                href={generatePropertyUrl(property)}
                                                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                                            >
                                                Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                            className="px-8 py-3 bg-gradient-to-r from-[#D7242A] to-[#D7242A]/90 text-white font-semibold rounded-lg hover:from-[#D7242A]/90 hover:to-[#D7242A]/80 transition-all"
                        >
                            Clear Filters & See All Properties
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
