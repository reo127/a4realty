'use client';
/* app/page.tsx */
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Footer from "./Footer";
import LeadCaptureModal from "./LeadCaptureModal";
import Banner from "./Banner";
import MobileStickyCTA from "./MobileStickyCTA";
import { formatPrice } from '../../utils/formatPrice';
import { generatePropertyUrl } from '@/utils/slugify';

export default function Home() {
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
    const [properties, setProperties] = useState([]);
    const [visibleProperties, setVisibleProperties] = useState(30);
    const [loading, setLoading] = useState(true);
    const [banners, setBanners] = useState([]);
    const [showLeadSuccessModal, setShowLeadSuccessModal] = useState(false);
    const [activeTab, setActiveTab] = useState('buy');

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
            setShowLeadSuccessModal(true);

        } catch (error) {
            throw error;
        }
    };

    const handleCloseModal = () => {
        setShowLeadModal(false);
    };

    const handleCloseLeadSuccessModal = () => {
        setShowLeadSuccessModal(false);
    };

    const handleSeeMore = () => {
        setVisibleProperties(prev => prev + 30);
    };


    return (
        <main className="min-h-screen bg-white text-gray-900 pb-20 lg:pb-0">
            {/* Mobile Sticky CTA */}
            <MobileStickyCTA />

            {/* Banner Section */}
            <Banner banners={banners} />

            {/* Hero with segmented search */}
            <section className="relative bg-white">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D7242A]/5 rounded-full"></div>
                    <div className="absolute top-32 -left-16 w-64 h-64 bg-[#D7242A]/3 rounded-full"></div>
                </div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16">
                    <div className="max-w-4xl text-center mx-auto">
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-tight">
                            Your Trusted Partner in
                            <span className="text-[#D7242A]"> Verified Real Estate</span>
                        </h1>
                        <p className="mt-4 text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
                            Handpicked listings, zero-brokerage direct builder offers, and complete transparency.
                        </p>

                        {/* Trust Signals */}
                        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-semibold text-gray-500">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#D7242A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                100% Verified Listings
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#D7242A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Best Market Price
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#D7242A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                5,000+ Happy Families
                            </div>
                        </div>
                    </div>

                    {/* Search Card */}
                    <div className="mt-12 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden max-w-5xl mx-auto relative z-10">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 bg-gray-50/50">
                            {[
                                { key: "buy", label: "Buy", icon: "🏠" },
                                { key: "rent", label: "Rent", icon: "🔑" },
                                { key: "new", label: "New Projects", icon: "🏗️" },
                            ].map((t) => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setActiveTab(t.key)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all duration-300 ${activeTab === t.key
                                        ? "bg-white text-[#D7242A] border-b-2 border-[#D7242A]"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                                        }`}
                                >
                                    <span>{t.icon}</span>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Search row */}
                        <form
                            action="/search"
                            className="p-4 sm:p-6 flex flex-col md:flex-row gap-3"
                        >
                            <input type="hidden" name="tab" value={activeTab} />

                            {/* Location/Project */}
                            <div className="flex-[2] relative">
                                <label htmlFor="q" className="sr-only">Search</label>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D7242A]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input
                                    id="q"
                                    name="q"
                                    type="text"
                                    placeholder="Enter City, Locality or Project Name"
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none text-gray-900 font-medium placeholder-gray-400"
                                />
                            </div>

                            {/* Property Type */}
                            <div className="flex-1 relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <select
                                    id="type"
                                    name="type"
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none text-gray-900 font-medium appearance-none cursor-pointer"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Property Type</option>
                                    <option value="flat">Apartments</option>
                                    <option value="house">Villa / House</option>
                                    <option value="land">Plots / Land</option>
                                    <option value="office">Commercial</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>

                            {/* Budget */}
                            <div className="flex-1 relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <select
                                    id="max"
                                    name="max"
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none text-gray-900 font-medium appearance-none cursor-pointer"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Max Budget</option>
                                    <option value="5000000">₹50 Lacs</option>
                                    <option value="10000000">₹1 Crore</option>
                                    <option value="20000000">₹2 Crore</option>
                                    <option value="50000000">₹5 Crore+</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="h-14 px-10 rounded-2xl bg-[#D7242A] text-white font-bold text-lg hover:bg-[#D7242A]/90 shadow-xl shadow-red-600/20 transition-all active:scale-95"
                            >
                                Search
                            </button>
                        </form>

                        {/* Quick filters row */}
                        <div className="px-6 pb-6 flex items-center gap-3 overflow-x-auto no-scrollbar">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Quick Picks:</span>
                            {["Ready to Move", "Under Construction", "Verified Only", "No Brokerage"].map(
                                (chip) => (
                                    <Link
                                        key={chip}
                                        href={`/search?tab=${activeTab}&q=${encodeURIComponent(chip)}`}
                                        className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-100 bg-gray-50 hover:bg-[#D7242A] hover:text-white hover:border-[#D7242A] transition-all whitespace-nowrap shadow-sm"
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
                                { name: "Bangalore", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=300&h=300&fit=crop&crop=center" },
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
                            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {properties.slice(0, visibleProperties).map((property) => (
                                    <div
                                        key={property._id}
                                        className="group overflow-hidden rounded-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 bg-white"
                                    >
                                        <Link href={generatePropertyUrl(property)} className="relative block h-56 overflow-hidden">
                                            <img
                                                src={property.gallery?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                                alt={property.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute left-3 top-3 flex gap-2">
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded bg-white/95 text-gray-900 shadow-sm uppercase">
                                                    For {property.mode}
                                                </span>
                                                {property.status === 'Ready to Move' && (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded bg-[#D7242A] text-white shadow-sm uppercase">
                                                        Ready
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="p-5">
                                            <Link href={generatePropertyUrl(property)}>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#D7242A] transition-colors line-clamp-1">{property.title}</h3>
                                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    {property.location}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <p className="text-xl font-extrabold text-[#D7242A]">
                                                        {property.price ? formatPrice(property.price) : 'Price on Request'}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <span className="px-2 py-1 text-[11px] font-bold uppercase rounded bg-green-50 text-green-700 border border-green-100">
                                                            Verified
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                            
                                            <div className="mt-5 grid grid-cols-2 gap-3">
                                                <Link 
                                                    href={generatePropertyUrl(property)}
                                                    className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                                <a 
                                                    href={`https://wa.me/91XXXXXXXXXX?text=Hi, I am interested in ${property.title} (${property.location})`}
                                                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#25D366] text-white text-sm font-bold hover:bg-[#128C7E] transition-colors"
                                                >
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                    WhatsApp
                                                </a>
                                            </div>
                                        </div>
                                    </div>
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
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-6 py-12 sm:px-12 sm:py-16 shadow-2xl">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-[#D7242A]/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-[#D7242A]/10 rounded-full blur-3xl"></div>

                        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
                            <div className="max-w-xl text-center lg:text-left">
                                <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
                                    Looking for <span className="text-[#D7242A]">Expert Guidance?</span>
                                </h3>
                                <p className="mt-4 text-gray-300 text-lg">
                                    Our property experts will help you find the perfect home at the best price. Get a free consultation today.
                                </p>
                            </div>
                            <div className="w-full lg:w-auto">
                                <form
                                    action="/lead"
                                    className="flex flex-col sm:flex-row gap-3 p-2 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10"
                                >
                                    <label htmlFor="phone-band" className="sr-only">Phone</label>
                                    <input
                                        id="phone-band"
                                        name="phone"
                                        type="tel"
                                        placeholder="Enter phone number"
                                        className="h-14 w-full sm:w-72 px-6 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#D7242A] outline-none"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="h-14 px-8 rounded-xl bg-[#D7242A] text-white font-bold text-lg hover:bg-[#D7242A]/90 transition-all shadow-lg hover:shadow-red-900/20"
                                    >
                                        Get Call Back
                                    </button>
                                </form>
                                <p className="mt-3 text-center lg:text-left text-xs text-gray-500">
                                    * We value your privacy. No spam, only property updates.
                                </p>
                            </div>
                        </div>
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

            {/* Lead Submit Success Modal */}
            {showLeadSuccessModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" id="successmodalhomepage">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCloseLeadSuccessModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center mx-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                        <p className="text-gray-600 mb-6" id="successmodalhomepageparagraph">
                            We have received your inquiry successfully. Our team will contact you soon with property details and assistance.
                        </p>
                        <button
                            onClick={handleCloseLeadSuccessModal}
                            className="w-full px-6 py-3 bg-[#D7242A] text-white font-semibold rounded-lg hover:bg-[#D7242A]/90 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}