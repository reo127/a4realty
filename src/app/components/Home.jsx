'use client';
/* app/page.tsx */
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Logo from '../../../public/transparent-logo.svg'
import Footer from "./Footer";
import LeadCaptureModal from "./LeadCaptureModal";
import { formatPrice } from '../../utils/formatPrice';

export default function Home() {
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
    const [properties, setProperties] = useState([]);
    const [visibleProperties, setVisibleProperties] = useState(3);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user has already submitted lead information
        const leadSubmitted = localStorage.getItem('leadSubmitted');
        if (leadSubmitted) {
            setHasSubmittedLead(true);
        } else {
            // Show modal after 3 seconds delay
            const timer = setTimeout(() => {
                setShowLeadModal(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        // Fetch properties in a separate useEffect
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/properties');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.data && Array.isArray(data.data)) {
                setProperties(data.data);
            } else {
                setProperties([]);
            }
        } catch (error) {
            console.error('Error fetching properties:', error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLeadSubmit = async (leadData) => {
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit lead');
            }

            // Store lead info in localStorage
            localStorage.setItem('leadSubmitted', 'true');
            localStorage.setItem('leadData', JSON.stringify(leadData));
            setHasSubmittedLead(true);
            setShowLeadModal(false);

        } catch (error) {
            throw error;
        }
    };

    const handleCloseModal = () => {
        setShowLeadModal(false);
    };

    const handleSeeMore = () => {
        setVisibleProperties(prev => prev + 3);
    };

    return (
        <main className="min-h-screen bg-white text-gray-900">

        
            {/* Hero with segmented search */}
            <section className="relative">
                {/* Background hero image/video area */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1600992045264-136a22de917e?q=80&w=2000&auto=format&fit=crop"
                        alt="City skyline"
                        className="object-cover h-[90%] w-[100vw]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                            Discover new projects and verified listings
                        </h1>
                        <p className="mt-3 text-white/90 text-base sm:text-lg">
                            Explore builder floors, apartments, and villas across top micro-markets.
                        </p>
                    </div>

                    {/* Search Card */}
                    <div className="mt-6 bg-white rounded-xl shadow-xl border border-gray-100">
                        {/* Tabs */}
                        <div className="flex">
                            {/* {[
                                { key: "buy", label: "Buy" },
                                { key: "rent", label: "Rent" },
                                { key: "new", label: "New Projects" },
                            ].map((t, i) => (
                                <button
                                    key={t.key}
                                    data-tab={t.key}
                                    className={`w-1/3 py-3 text-sm font-medium border-b-2 ${i === 0
                                        ? "border-red-600 text-red-700"
                                        : "border-transparent text-gray-600 hover:text-gray-900"
                                        }`}
                                // For demo: first tab active by default. Hook into state if making interactive.
                                >
                                    {t.label}
                                </button>
                            ))} */}
                        </div>

                        {/* Search row */}
                        <form
                            action="/search"
                            className="p-4 sm:p-5 flex flex-col md:flex-row gap-3"
                        >
                            {/* Hidden active tab field (default buy); toggle with state when implementing */}
                            <input type="hidden" name="tab" value="buy" />

                            {/* Location/Project */}
                            <div className="flex-1">
                                <label htmlFor="q" className="sr-only">Search by city, locality or project</label>
                                <div className="relative">
                                    <input
                                        id="q"
                                        name="q"
                                        type="text"
                                        placeholder="City, locality, project, landmark"
                                        className="w-full h-12 px-4 pr-10 rounded-md border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        ⌕
                                    </span>
                                </div>
                            </div>

                            {/* Property Type */}
                            <div className="md:w-48">
                                <label htmlFor="type" className="sr-only">Property Type</label>
                                <select
                                    id="type"
                                    name="type"
                                    className="w-full h-12 px-3 rounded-md border border-gray-200 bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Property type</option>
                                    <option value="flat">Apartments</option>
                                    <option value="house">Villa</option>
                                    <option value="land">Plot</option>
                                    <option value="office">Office</option>
                                    <option value="office">Retail</option>
                                </select>
                            </div>

                            {/* Budget */}
                            <div className="md:w-64 flex gap-2">
                                <label htmlFor="min" className="sr-only">Min budget</label>
                                <select
                                    id="min"
                                    name="min"
                                    className="w-1/2 h-12 px-3 rounded-md border border-gray-200 bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Min</option>
                                    <option value="1000000">₹10L</option>
                                    <option value="2500000">₹25L</option>
                                    <option value="5000000">₹50L</option>
                                    <option value="10000000">₹1Cr</option>
                                </select>

                                <label htmlFor="max" className="sr-only">Max budget</label>
                                <select
                                    id="max"
                                    name="max"
                                    className="w-1/2 h-12 px-3 rounded-md border border-gray-200 bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Max</option>
                                    <option value="2500000">₹25L</option>
                                    <option value="5000000">₹50L</option>
                                    <option value="10000000">₹1Cr</option>
                                    <option value="20000000">₹2Cr</option>
                                    <option value="50000000">₹5Cr</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="h-12 px-6 rounded-md bg-red-600 text-white font-medium hover:bg-red-700"
                            >
                                Search
                            </button>
                        </form>

                        {/* Quick filters row */}
                        <div className="px-4 sm:px-5 pb-4 flex flex-wrap gap-2 text-sm">
                            {["Near Metro", "Ready to Move", "Under Construction", "With Floor Plan", "Verified", "Owner"].map(
                                (chip) => (
                                    <Link
                                        key={chip}
                                        href={`/search?tab=buy&q=${encodeURIComponent(chip)}`}
                                        className="px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300"
                                    >
                                        {chip}
                                    </Link>
                                )
                            )}
                        </div>
                    </div>

                    {/* Popular cities */}
                    <div className="mt-6">
                        <div className="text-white/90 text-sm mb-2">Popular cities</div>
                        <div className="flex flex-wrap gap-2">
                            {["Mumbai", "Delhi NCR", "Bengaluru", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad"].map(
                                (city) => (
                                    <Link
                                        key={city}
                                        href={`/search?tab=buy&q=${encodeURIComponent(city)}`}
                                        className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-gray-900 text-sm"
                                    >
                                        {city}
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Properties */}
            <section className="py-10 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-baseline justify-between">
                        <h2 className="text-xl font-semibold">Featured Properties</h2>
                        <Link href="/search" className="text-red-600 text-sm hover:underline">
                            View all
                        </Link>
                    </div>

                    {loading && properties.length === 0 ? (
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="overflow-hidden rounded-xl border border-gray-200 animate-pulse">
                                    <div className="h-48 bg-gray-300"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                                        <div className="flex gap-2">
                                            <div className="h-6 bg-gray-300 rounded w-16"></div>
                                            <div className="h-6 bg-gray-300 rounded w-16"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {properties.slice(0, visibleProperties).map((property) => (
                                    <Link
                                        key={property._id}
                                        href={`/property/${property._id}`}
                                        className="group overflow-hidden rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="relative h-48">
                                            <img
                                                src={property.gallery?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                                alt={property.title}
                                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                                            />
                                            <div className="absolute left-3 top-3">
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-white/90">
                                                    For {property.mode}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-base font-semibold">{property.title}</h3>
                                            <p className="text-sm text-gray-600">{property.location}</p>
                                            <p className="mt-2 text-sm font-medium text-red-600">💰 Price on Request</p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="inline-flex items-center px-2 py-1 text-[11px] rounded bg-green-50 text-green-700">
                                                    Verified
                                                </span>
                                                <span className="inline-flex items-center px-2 py-1 text-[11px] rounded bg-red-50 text-red-700">
                                                    {property.type}
                                                </span>
                                                {property.bhk && property.bhk !== 'na' && (
                                                    <span className="inline-flex items-center px-2 py-1 text-[11px] rounded bg-blue-50 text-blue-700">
                                                        {property.bhk}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            
                            {/* See More Button */}
                            {properties.length > visibleProperties && (
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={handleSeeMore}
                                        className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        See More Properties ({properties.length - visibleProperties} more)
                                    </button>
                                </div>
                            )}
                            
                            {properties.length === 0 && (
                                <div className="mt-6 text-center py-12 bg-gray-50 rounded-xl">
                                    <p className="text-gray-600">No properties found. Properties will appear here once they are added.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Neighborhood chips */}
            <section className="py-8 bg-gray-50 border-y border-gray-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-lg font-semibold">Explore by locality</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {[
                            "Baner, Pune",
                            "Whitefield, Bengaluru",
                            "Andheri, Mumbai",
                            "Gachibowli, Hyderabad",
                            "Noida Sector 150",
                            "Velachery, Chennai",
                        ].map((loc) => (
                            <Link
                                key={loc}
                                href={`/search?tab=buy&q=${encodeURIComponent(loc)}`}
                                className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-gray-300 text-sm"
                            >
                                {loc}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lead-gen band */}
            <section className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-red-600 to-red-500 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-semibold">Get priority access to builder offers</h3>
                            <p className="text-white/90 mt-1 text-sm">
                                Book site visits, get floor plans, and receive exclusive launch pricing.
                            </p>
                        </div>
                        <form
                            action="/lead"
                            className="flex w-full md:w-auto gap-2"
                        >
                            <label htmlFor="phone" className="sr-only">Phone</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="Enter phone number"
                                className="h-12 w-full md:w-72 px-4 rounded-md border border-white/30 bg-white/10 placeholder-white/70 text-white focus:bg-white focus:text-gray-900 focus:border-white outline-none"
                            />
                            <button
                                type="submit"
                                className="h-12 px-5 rounded-md bg-white text-red-700 font-medium hover:bg-white/90"
                            >
                                Get Callback
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
           <Footer/>

            {/* Lead Capture Modal */}
            <LeadCaptureModal
                isOpen={showLeadModal}
                onClose={handleCloseModal}
                onSubmit={handleLeadSubmit}
                title="Welcome! Get Exclusive Property Access"
            />
        </main>
    );
}
