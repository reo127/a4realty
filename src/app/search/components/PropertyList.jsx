/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from '../../../utils/formatPrice';
import { generatePropertyUrl } from '@/utils/slugify';

const SUGGESTED_LOCATIONS = ["Mumbai", "Pune", "Bangalore", "Delhi", "Hyderabad", "Chennai", "Navi Mumbai", "Thane"];

export default function PropertyList() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState({
        location: "",
        mode: "",
        price: "",
        type: "",
        bhk: "",
    });
    const debounceTimer = useRef(null);
    const isFirstLoad = useRef(true);

    // Initialize filters from URL parameters and fetch properties
    useEffect(() => {
        const initialFilters = {
            location: searchParams.get('q') || searchParams.get('location') || "",
            mode: mapMode(searchParams.get('tab')) || searchParams.get('mode') || "",
            price: searchParams.get('max') || searchParams.get('price') || "",
            type: searchParams.get('type') || "",
            bhk: searchParams.get('bhk') || "",
        };
        setFilters(initialFilters);
        fetchPropertiesWithFilters(initialFilters);
        isFirstLoad.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Debounced auto-search when location changes
    useEffect(() => {
        if (isFirstLoad.current) return;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchPropertiesWithFilters(filters);
            syncUrl(filters);
        }, 500);
        return () => clearTimeout(debounceTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.location]);

    const mapMode = (tab) => {
        const modeMap = { buy: 'buy', rent: 'rent', sell: 'sell', new: 'buy' };
        return modeMap[tab] || tab;
    };

    const syncUrl = useCallback((f) => {
        const queryParams = new URLSearchParams();
        if (f.location) queryParams.append('q', f.location);
        if (f.mode) queryParams.append('mode', f.mode);
        if (f.type) queryParams.append('type', f.type);
        if (f.bhk) queryParams.append('bhk', f.bhk);
        if (f.price) queryParams.append('price', f.price);
        router.push(`/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, { scroll: false });
    }, [router]);

    const fetchPropertiesWithFilters = async (currentFilters = filters) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (currentFilters.location) queryParams.append('location', currentFilters.location);
            if (currentFilters.mode && currentFilters.mode !== 'buy') queryParams.append('mode', currentFilters.mode);
            if (currentFilters.type) queryParams.append('type', currentFilters.type);
            if (currentFilters.bhk) queryParams.append('bhk', currentFilters.bhk);
            if (currentFilters.price) queryParams.append('price', currentFilters.price);
            const url = `/api/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch properties');
            setProperties(data.data);
        } catch (err) {
            console.error('Error fetching properties:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handlePillFilter = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: prev[name] === value ? '' : value }));
    };

    const applyFilters = async () => {
        syncUrl(filters);
        await fetchPropertiesWithFilters(filters);
    };

    const clearFilters = () => {
        const cleared = { location: "", mode: "", price: "", type: "", bhk: "" };
        setFilters(cleared);
        router.push('/search', { scroll: false });
        fetchPropertiesWithFilters(cleared);
    };

    const sortedProperties = [...properties].sort((a, b) => {
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
        return 0;
    });

    const typeOptions = [
        { value: 'flat', label: 'Apartment' },
        { value: 'house', label: 'Villa' },
        { value: 'land', label: 'Plot' },
        { value: 'office', label: 'Commercial' },
    ];

    const bhkOptions = ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK'];

    if (loading && properties.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-[#D7242A]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#D7242A] rounded-full animate-spin border-t-transparent"></div>
                    </div>
                    <p className="text-gray-500 tracking-widest text-sm uppercase" style={{ fontFamily: 'var(--font-josefin)' }}>
                        Finding your perfect properties...
                    </p>
                </div>
            </div>
        );
    }

    if (error && properties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center max-w-md shadow-xl">
                    <div className="w-16 h-16 bg-[#D7242A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[#D7242A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-cinzel)' }}>Something went wrong</h3>
                    <p className="text-gray-500 mb-6 text-sm">{error}</p>
                    <button
                        onClick={() => fetchPropertiesWithFilters(filters)}
                        className="px-6 py-3 rounded-xl bg-[#D7242A] text-white font-semibold hover:bg-[#D7242A]/90 transition-colors"
                        style={{ fontFamily: 'var(--font-josefin)' }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'var(--font-josefin, inherit)' }} className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Page Header */}
                <div className="text-center mb-10">
                    <h1
                        className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-wide"
                        style={{ fontFamily: 'var(--font-cinzel)' }}
                    >
                        Find Your Perfect Property
                    </h1>
                    <p className="text-gray-500 text-sm tracking-widest uppercase">
                        Verified listings across India
                    </p>
                </div>

                {/* Search & Filter Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
                    {/* Filter Header */}
                    <div className="bg-[#D7242A] px-6 py-4 flex items-center justify-between">
                        <span className="text-white font-semibold tracking-widest text-sm uppercase" style={{ fontFamily: 'var(--font-josefin)' }}>
                            Search &amp; Filter
                        </span>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm hover:bg-white/30 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                            </svg>
                            {showFilters ? 'Hide' : 'Filters'}
                        </button>
                    </div>

                    {/* Location Search */}
                    <div className="px-6 py-5 border-b border-gray-100">
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
                                className="w-full pl-12 pr-28 py-4 text-base border-2 border-gray-100 rounded-xl focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none bg-gray-50 text-gray-900"
                                style={{ fontFamily: 'var(--font-josefin)' }}
                            />
                            {loading && (
                                <div className="absolute inset-y-0 right-4 flex items-center">
                                    <svg className="animate-spin h-5 w-5 text-[#D7242A]" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="px-6 py-5 bg-gray-50 space-y-5">
                            {/* Transaction Type + Budget Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Transaction Type</label>
                                    <div className="flex gap-2">
                                        {[{v:'',l:'Any'},{v:'buy',l:'Buy'},{v:'rent',l:'Rent'}].map(({v,l}) => (
                                            <button
                                                key={v}
                                                onClick={() => handlePillFilter('mode', v)}
                                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                                                    filters.mode === v
                                                        ? 'bg-[#D7242A] text-white border-[#D7242A] shadow-lg shadow-red-500/20'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#D7242A]/40'
                                                }`}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Max Budget</label>
                                    <div className="relative">
                                        <select
                                            name="price"
                                            value={filters.price}
                                            onChange={handleFilterChange}
                                            className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 font-semibold text-sm focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none cursor-pointer"
                                            style={{ fontFamily: 'var(--font-josefin)' }}
                                        >
                                            <option value="">No Limit</option>
                                            <option value="5000000">₹50 Lacs</option>
                                            <option value="10000000">₹1 Crore</option>
                                            <option value="20000000">₹2 Crore</option>
                                            <option value="50000000">₹5 Crore+</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Property Type Pills */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Property Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {typeOptions.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => handlePillFilter('type', value)}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                                                filters.type === value
                                                    ? 'bg-gray-900 text-white border-gray-900'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* BHK Pills */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Configuration</label>
                                <div className="flex flex-wrap gap-2">
                                    {bhkOptions.map(bhk => (
                                        <button
                                            key={bhk}
                                            onClick={() => handlePillFilter('bhk', bhk.toLowerCase())}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                                                filters.bhk === bhk.toLowerCase()
                                                    ? 'bg-gray-900 text-white border-gray-900'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            {bhk}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={applyFilters}
                                    disabled={loading}
                                    className="flex-[2] py-3.5 bg-[#D7242A] text-white font-bold rounded-xl hover:bg-[#D7242A]/90 shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm tracking-wide"
                                    style={{ fontFamily: 'var(--font-josefin)' }}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            Search Properties
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 py-3.5 bg-white text-gray-600 font-semibold rounded-xl hover:bg-gray-100 border border-gray-200 transition-all text-sm"
                                    style={{ fontFamily: 'var(--font-josefin)' }}
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="font-bold text-gray-900 text-base">
                            {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Found
                        </span>
                        {filters.location && (
                            <span className="text-gray-400 text-sm">in &ldquo;{filters.location}&rdquo;</span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-[#D7242A] outline-none cursor-pointer"
                                style={{ fontFamily: 'var(--font-josefin)' }}
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        <div className="hidden sm:flex bg-white border border-gray-200 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#D7242A] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#D7242A] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Property Grid / List */}
                {sortedProperties.length > 0 ? (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {sortedProperties.map((property) => (
                            <div
                                key={property._id}
                                className={`group bg-white overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}`}
                            >
                                {/* Image */}
                                <Link
                                    href={generatePropertyUrl(property)}
                                    className={`relative block overflow-hidden flex-shrink-0 ${viewMode === 'list' ? 'w-full md:w-72 h-56 md:h-auto' : 'h-56'}`}
                                >
                                    <img
                                        src={property.gallery?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        alt={property.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white/95 text-gray-900 uppercase tracking-wider shadow-sm">
                                            For {property.mode}
                                        </span>
                                        {property.status === 'Ready to Move' && (
                                            <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#D7242A] text-white uppercase tracking-wider shadow-sm">
                                                Ready
                                            </span>
                                        )}
                                    </div>

                                    {/* Price on image (bottom) */}
                                    <div className="absolute bottom-3 left-3">
                                        <span className="text-white font-black text-lg drop-shadow-lg" style={{ fontFamily: 'var(--font-josefin)' }}>
                                            {property.price ? formatPrice(property.price) : 'Price on Request'}
                                        </span>
                                    </div>
                                </Link>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <Link href={generatePropertyUrl(property)}>
                                            <h3
                                                className="text-base font-bold text-gray-900 group-hover:text-[#D7242A] transition-colors line-clamp-1 leading-snug"
                                                style={{ fontFamily: 'var(--font-cinzel)' }}
                                            >
                                                {property.title}
                                            </h3>
                                        </Link>
                                        <button className="ml-2 text-gray-300 hover:text-[#D7242A] transition-colors flex-shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                                        <svg className="w-3.5 h-3.5 text-[#D7242A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="truncate">{property.location}</span>
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-green-50 text-green-700 border border-green-100 tracking-wider">
                                            Verified
                                        </span>
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-100 tracking-wider">
                                            {property.type}
                                        </span>
                                        {property.bhk && property.bhk !== 'na' && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-orange-50 text-orange-700 border border-orange-100 tracking-wider">
                                                {property.bhk}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-auto flex gap-2">
                                        <a
                                            href={`https://wa.me/91XXXXXXXXXX?text=Hi, I am interested in ${property.title} (${property.location})`}
                                            className="p-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#128C7E] transition-colors shadow-md shadow-green-500/20"
                                        >
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                        </a>
                                        <Link
                                            href={generatePropertyUrl(property)}
                                            className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold text-center hover:bg-gray-800 transition-colors tracking-wide"
                                            style={{ fontFamily: 'var(--font-josefin)' }}
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3
                            className="text-xl font-bold text-gray-900 mb-2"
                            style={{ fontFamily: 'var(--font-cinzel)' }}
                        >
                            No Properties Found
                        </h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                            We couldn&apos;t find properties matching your criteria. Try a different location or adjust your filters.
                        </p>

                        {/* Suggested locations */}
                        <div className="mb-8">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Try searching in</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {SUGGESTED_LOCATIONS.map(loc => (
                                    <button
                                        key={loc}
                                        onClick={() => {
                                            const newFilters = { ...filters, location: loc };
                                            setFilters(newFilters);
                                            fetchPropertiesWithFilters(newFilters);
                                            syncUrl(newFilters);
                                        }}
                                        className="px-4 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium hover:border-[#D7242A] hover:text-[#D7242A] transition-colors"
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={clearFilters}
                            className="px-8 py-3 bg-[#D7242A] text-white font-semibold rounded-xl hover:bg-[#D7242A]/90 transition-colors text-sm tracking-wide"
                            style={{ fontFamily: 'var(--font-josefin)' }}
                        >
                            Clear Filters & See All
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
