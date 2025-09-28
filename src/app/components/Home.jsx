'use client';
/* app/page.tsx */
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Footer from "./Footer";
import LeadCaptureModal from "./LeadCaptureModal";
import Banner from "./Banner";
import { formatPrice } from '../../utils/formatPrice';

export default function Home() {
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
    const [properties, setProperties] = useState([]);
    const [visibleProperties, setVisibleProperties] = useState(30);
    const [loading, setLoading] = useState(true);
    const [banners, setBanners] = useState([]);

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
        // Fetch properties and banners in a separate useEffect
        fetchProperties();
        fetchBanners();
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

    const fetchBanners = async () => {
        try {
            // Sample image banners - replace with actual API call later
            const sampleBanners = [
                {
                    id: 1,
                    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=400&fit=crop&crop=center",
                    title: "Luxury Apartments Available",
                    subtitle: "Starting from ₹85L - Limited Time Offer",
                    alt: "Luxury apartment complex",
                    link: "/search?q=luxury+apartments"
                },
                {
                    id: 2,
                    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=400&fit=crop&crop=center",
                    title: "Premium Villas - Early Bird Offer",
                    subtitle: "Save up to 15% on booking",
                    alt: "Modern villa exterior",
                    link: "/search?type=house"
                },
                {
                    id: 3,
                    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=400&fit=crop&crop=center",
                    title: "Ready to Move Properties",
                    subtitle: "Immediate possession available",
                    alt: "Ready to move apartment",
                    link: "/search?q=ready+to+move"
                }
            ];

            setBanners(sampleBanners);

            // TODO: Replace with actual API call
            // const response = await fetch('/api/banners');
            // if (response.ok) {
            //     const data = await response.json();
            //     setBanners(data.banners || []);
            // }
        } catch (error) {
            console.error('Error fetching banners:', error);
            setBanners([]);
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
        setVisibleProperties(prev => prev + 30);
    };


    return (
        <main className="min-h-screen bg-white text-gray-900">
            {/* Banner Section */}
            <Banner banners={banners} />

            {/* Hero with segmented search */}
            <section className="relative bg-white">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D7242A]/5 rounded-full"></div>
                    <div className="absolute top-32 -left-16 w-64 h-64 bg-[#D7242A]/3 rounded-full"></div>
                </div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24">
                    <div className="max-w-4xl text-center mx-auto">
                        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 leading-tight">
                            Discover new projects and
                            <span className="text-[#D7242A]"> verified listings</span>
                        </h1>
                        <p className="mt-6 text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto">
                            Explore builder floors, apartments, and villas across top micro-markets with complete transparency and verification.
                        </p>
                    </div>

                    {/* Search Card */}
                    <div className="mt-10 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
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
                                        ? "border-[#D7242A] text-[#D7242A]"
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
                            className="p-6 sm:p-8 flex flex-col md:flex-row gap-4"
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
                                        className="w-full h-14 px-4 pr-10 rounded-lg border-2 border-gray-200 focus:border-[#D7242A] focus:ring-2 focus:ring-[#D7242A]/20 outline-none text-gray-900 placeholder-gray-500"
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
                                    className="w-full h-14 px-3 rounded-lg border-2 border-gray-200 bg-white focus:border-[#D7242A] focus:ring-2 focus:ring-[#D7242A]/20 outline-none text-gray-900"
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
                                    className="w-1/2 h-14 px-3 rounded-lg border-2 border-gray-200 bg-white focus:border-[#D7242A] focus:ring-2 focus:ring-[#D7242A]/20 outline-none text-gray-900"
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
                                    className="w-1/2 h-14 px-3 rounded-lg border-2 border-gray-200 bg-white focus:border-[#D7242A] focus:ring-2 focus:ring-[#D7242A]/20 outline-none text-gray-900"
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
                                className="h-14 px-8 rounded-lg bg-[#D7242A] text-white font-semibold hover:bg-[#D7242A]/90 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                Search
                            </button>
                        </form>

                        {/* Quick filters row */}
                        <div className="px-6 sm:px-8 pb-6 flex flex-wrap gap-3 text-sm">
                            {["Near Metro", "Ready to Move", "Under Construction", "With Floor Plan", "Verified", "Owner"].map(
                                (chip) => (
                                    <Link
                                        key={chip}
                                        href={`/search?tab=buy&q=${encodeURIComponent(chip)}`}
                                        className="px-4 py-2 rounded-full border-2 border-gray-200 hover:border-[#D7242A] hover:text-[#D7242A] transition-all duration-200 bg-white hover:bg-red-50"
                                    >
                                        {chip}
                                    </Link>
                                )
                            )}
                        </div>
                    </div>

                    {/* Popular cities */}
                    <div className="mt-8 text-center">
                        <div className="text-gray-600 text-sm mb-6 font-medium">Popular cities</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 max-w-6xl mx-auto">
                            {[
                                { name: "Mumbai", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/40/ce/c3/mumbai-marine-drive-along.jpg?w=2000&h=-1&s=1" },
                                { name: "Delhi NCR", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=300&h=300&fit=crop&crop=center" },
                                { name: "Bengaluru", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=300&h=300&fit=crop&crop=center" },
                                { name: "Pune", image: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=300&h=300&fit=crop&crop=center" },
                                { name: "Hyderabad", image: "https://lp-cms-production.imgix.net/2019-06/GettyImages-171676147_full.jpg?fit=crop&ar=1%3A1&w=1200&auto=format&q=75" },
                                { name: "Chennai", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=300&h=300&fit=crop&crop=center" },
                                { name: "Kolkata", image: "https://media.assettype.com/outlooktraveller%2F2024-04%2F4b6c5c58-610a-4294-82f2-7ed6b16fc1c0%2Fkolkata7.jpg" },
                                { name: "Ahmedabad", image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=300&h=300&fit=crop&crop=center" }
                            ].map((city) => (
                                <Link
                                    key={city.name}
                                    href={`/search?tab=buy&q=${encodeURIComponent(city.name)}`}
                                    className="group flex flex-col items-center space-y-2 hover:scale-105 transition-all duration-200"
                                >
                                    <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-200 ring-2 ring-gray-100 group-hover:ring-[#D7242A]/20">
                                        <img
                                            src={city.image}
                                            alt={city.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#D7242A] transition-colors duration-200">
                                        {city.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Properties */}
            <section className="py-10 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-baseline justify-between">
                        <h2 className="text-xl font-semibold">Featured Properties</h2>
                        <Link href="/search" className="text-[#D7242A] text-sm hover:underline">
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
                                            <p className="mt-2 text-sm font-medium text-[#D7242A]">💰 {property.price ? formatPrice(property.price) : 'Price on Request'}</p>
                                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-[17px] border-1 border-black px-[13px] py-[1px] inline-flex items-center   rounded bg-green-50 text-green-700">
                                                    Verified
                                                </span>

                                                <span className="inline-flex items-center px-[13px] py-[1px] text-[17px] font-bold uppercase  border-1 border-black rounded  bg-[#D7242A]/10 text-[#D7242A]">
                                                    {property.type}
                                                </span>

                                                {property.bhk && property.bhk !== 'na' && (
                                                    <span className="inline-flex text-[17px] border-1 border-black px-[13px] py-[1px] uppercase font-bold items-center   rounded bg-[#D7242A]/10 text-[#D7242A]">
                                                        {property.bhk}
                                                    </span>
                                                )}

                                                {
                                                    property.dimension && property.dimension !== "" ? (
                                                        <span className={`inline-flex items-center px-[13px] border-1 border-black py-[1px] text-[17px] font-bold uppercase rounded bg-[#D7242A]/10 text-[#D7242A]`}>
                                                            {property.dimension} SQFT
                                                        </span>
                                                    ) : ""
                                                }
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
                                        className="px-6 py-3 bg-[#D7242A] text-white font-medium rounded-lg hover:bg-[#D7242A]/90 transition-colors"
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
                    <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#D7242A] to-[#D7242A]/90 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                                className="h-12 px-5 rounded-md bg-white text-[#D7242A] font-medium hover:bg-white/90"
                            >
                                Get Callback
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />

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