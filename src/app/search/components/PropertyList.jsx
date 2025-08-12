/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PropertyList() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        location: "",
        mode: "",
        price: "",
        type: "",
        bhk: "",
    });

    // Fetch all properties on component mount
    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/properties');
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
        try {
            setLoading(true);
            
            // Build query string from filters
            const queryParams = new URLSearchParams();
            
            if (filters.location) queryParams.append('location', filters.location);
            if (filters.mode) queryParams.append('mode', filters.mode);
            if (filters.type) queryParams.append('type', filters.type);
            if (filters.bhk) queryParams.append('bhk', filters.bhk);
            if (filters.price) queryParams.append('price', filters.price);
            
            const queryString = queryParams.toString();
            const url = `/api/properties${queryString ? `?${queryString}` : ''}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch properties');
            }
            
            setProperties(data.data);
        } catch (error) {
            console.error('Error applying filters:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && properties.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error && properties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="text-red-500 text-xl font-semibold mb-4">Error: {error}</div>
                <button 
                    onClick={fetchProperties}
                    className="px-6 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white text-gray-900">
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filter Bar */}
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <input
                            type="text"
                            name="location"
                            placeholder="Search by location..."
                            value={filters.location}
                            onChange={handleFilterChange}
                            className="p-2 border rounded-md"
                        />
                        <select
                            name="mode"
                            value={filters.mode}
                            onChange={handleFilterChange}
                            className="p-2 border rounded-md bg-white"
                        >
                            <option value="">Buy/Sell/Rent</option>
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                            <option value="rent">Rent</option>
                        </select>
                        <select
                            name="price"
                            value={filters.price}
                            onChange={handleFilterChange}
                            className="p-2 border rounded-md bg-white"
                        >
                            <option value="">Max Price</option>
                            <option value="100000">100,000</option>
                            <option value="500000">500,000</option>
                            <option value="1000000">1,000,000</option>
                            <option value="5000000">5,000,000</option>
                        </select>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="p-2 border rounded-md bg-white"
                        >
                            <option value="">Property Type</option>
                            <option value="flat">Flat</option>
                            <option value="house">House</option>
                            <option value="land">Land</option>
                            <option value="office">Office Space</option>
                        </select>
                        <select
                            name="bhk"
                            value={filters.bhk}
                            onChange={handleFilterChange}
                            className="p-2 border rounded-md bg-white"
                        >
                            <option value="">BHK</option>
                            <option value="1bhk">1 BHK</option>
                            <option value="2bhk">2 BHK</option>
                            <option value="3bhk">3 BHK</option>
                            <option value="4bhk">4 BHK</option>
                            <option value="5bhk">5+ BHK</option>
                        </select>
                    </div>
                    <div className="mt-4 text-right">
                        <button
                            onClick={applyFilters}
                            className="px-6 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* Property Count */}
                <div className="mb-4">
                    <p className="text-gray-600">{properties.length} properties found</p>
                </div>

                {/* Property Grid */}
                {properties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((p) => (
                            <Link href={`/property/${p._id}`} key={p._id}>
                                <div className="group overflow-hidden rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full">
                                    <div className="relative h-56">
                                        <img
                                            src={p.gallery[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                            alt={p.title}
                                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold">{p.title}</h3>
                                        <p className="text-sm text-gray-600">{p.location}</p>
                                        <p className="mt-2 text-xl font-bold">${p.price}</p>
                                        <div className="mt-3 flex items-center justify-start gap-2 text-sm flex-wrap">
                                            <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                                                {p.type}
                                            </span>
                                            {p.bhk && p.bhk !== 'na' && (
                                                <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                    {p.bhk}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                                For {p.mode}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
                        <p className="mt-2 text-sm text-gray-500">Try adjusting your filters or search criteria</p>
                    </div>
                )}
            </main>
        </div>
    );
}
