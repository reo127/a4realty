/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Modal from './Modal';
import LeadCaptureModal from './LeadCaptureModal';
import { formatPrice } from '../../utils/formatPrice';
import { getEmbedUrl, getVideoPlayerProps } from '@/utils/videoUtils';

export default function PropertyDetails() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [activeMediaTab, setActiveMediaTab] = useState('images'); // 'images' or 'videos'

    useEffect(() => {
        // Check if user has already submitted lead information
        const leadSubmitted = localStorage.getItem('leadSubmitted');
        if (leadSubmitted) {
            setHasSubmittedLead(true);
        }
        
        const fetchProperty = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/properties/${id}`);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch property');
                }
                
                setProperty(data.data);
            } catch (error) {
                console.error('Error fetching property:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            fetchProperty();
        }
    }, [id]);

    const openModal = (index) => {
        setSelectedImageIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const showNextImage = () => {
        setSelectedImageIndex((prevIndex) => (prevIndex + 1) % property.gallery.length);
    };

    const showPrevImage = () => {
        setSelectedImageIndex((prevIndex) => (prevIndex - 1 + property.gallery.length) % property.gallery.length);
    };

    const handleContactClick = (e) => {
        e.preventDefault();
        if (!hasSubmittedLead) {
            setShowLeadModal(true);
        } else {
            // If lead is submitted, allow the call
            window.location.href = `tel:${property.contactNumber}`;
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

            // Now allow the call
            window.location.href = `tel:${property.contactNumber}`;

        } catch (error) {
            throw error;
        }
    };

    const handleCloseLeadModal = () => {
        setShowLeadModal(false);
    };

    const handleClosePriceModal = () => {
        setShowPriceModal(false);
    };

    const handlePriceClick = () => {
        if (!hasSubmittedLead) {
            setShowPriceModal(true);
        }
    };

    const handlePriceLeadSubmit = async (leadData) => {
        try {
            // Add a note that this is a price inquiry request
            const priceInquiryData = {
                ...leadData,
                inquiryType: 'price_request',
                propertyId: property._id,
                propertyTitle: property.title
            };

            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(priceInquiryData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit lead');
            }

            localStorage.setItem('leadSubmitted', 'true');
            localStorage.setItem('leadData', JSON.stringify(leadData));
            setHasSubmittedLead(true);
            setShowPriceModal(false);

        } catch (error) {
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c2.791 0 5.3-.94 7.172-2.828M15.172 6.828a11 11 0 01-6.344 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Property not found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find the property you're looking for.</p>
                    <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Image Gallery */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                                        <p className="text-lg text-gray-600 mt-1 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {property.location}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {hasSubmittedLead ? (
                                            <div className="text-center">
                                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <p className="text-green-800 font-semibold text-lg">✅ Request Submitted</p>
                                                    <p className="text-green-700 text-sm mt-1">Our team will call you with pricing details</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={handlePriceClick}
                                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                            >
                                                📞 Request Price Call
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Nearby Locations */}
                                {property.nearbyLocations && property.nearbyLocations.length > 0 && (
                                    <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <h3 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Nearby Areas
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {property.nearbyLocations.map((location, index) => (
                                                <span 
                                                    key={index}
                                                    className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full border border-purple-200"
                                                >
                                                    {location}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Premium Media Gallery */}
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
                                    {activeMediaTab === 'images' && (
                                        <div className="space-y-4">
                                            {/* Main Image */}
                                            <div className="relative group cursor-pointer overflow-hidden rounded-2xl" onClick={() => openModal(0)}>
                                                <img 
                                                    src={property.gallery[0]} 
                                                    alt={`Main view of ${property.title}`} 
                                                    className="w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-500" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="absolute bottom-4 left-4 text-white">
                                                        <p className="text-sm font-medium">Click to view full gallery</p>
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-900">
                                                    {selectedImageIndex + 1} / {property.gallery.length}
                                                </div>
                                            </div>
                                            
                                            {/* Thumbnail Grid */}
                                            <div className="grid grid-cols-5 gap-2">
                                                {property.gallery.map((image, index) => (
                                                    <div 
                                                        key={index} 
                                                        className={`relative group cursor-pointer overflow-hidden rounded-xl transition-all duration-300 ${
                                                            index === selectedImageIndex 
                                                                ? 'ring-2 ring-indigo-600 ring-offset-2' 
                                                                : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedImageIndex(index);
                                                            openModal(index);
                                                        }}
                                                    >
                                                        <img 
                                                            src={image} 
                                                            alt={`View ${index + 1} of ${property.title}`} 
                                                            className="w-full h-20 object-cover transform group-hover:scale-110 transition-transform duration-300" 
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Videos Tab */}
                                    {activeMediaTab === 'videos' && property.videos && property.videos.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {property.videos.map((videoUrl, index) => {
                                                    const embedUrl = getEmbedUrl(videoUrl);
                                                    const playerProps = getVideoPlayerProps(videoUrl);
                                                    
                                                    return (
                                                        <div key={index} className="space-y-3">
                                                            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                                                                {embedUrl ? (
                                                                    playerProps?.src?.endsWith('.mp4') || playerProps?.src?.endsWith('.webm') ? (
                                                                        <video
                                                                            className="w-full h-full object-cover"
                                                                            controls
                                                                            preload="metadata"
                                                                        >
                                                                            <source src={playerProps.src} type="video/mp4" />
                                                                            Your browser does not support the video tag.
                                                                        </video>
                                                                    ) : (
                                                                        <iframe
                                                                            src={embedUrl}
                                                                            className="w-full h-full"
                                                                            frameBorder="0"
                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                            allowFullScreen
                                                                        />
                                                                    )
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                                        <div className="text-center">
                                                                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                            </svg>
                                                                            <p className="text-sm text-gray-500">Video not available</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600">Video {index + 1}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Property Features */}
                        <div className="bg-white rounded-2xl shadow-xl mt-6 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Details</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl">
                                    <div className="text-3xl font-bold text-indigo-600 mb-1">{property.bhk}</div>
                                    <div className="text-sm text-gray-700 font-medium">BHK</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                                    <div className="text-3xl font-bold text-purple-600 mb-1">{property.type}</div>
                                    <div className="text-sm text-gray-700 font-medium">Type</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                                    <div className="text-3xl font-bold text-green-600 mb-1 capitalize">{property.mode}</div>
                                    <div className="text-sm text-gray-700 font-medium">For</div>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl">
                                    <div className="text-3xl font-bold text-pink-600 mb-1">
                                        {property.gallery.length}
                                        {property.videos && property.videos.length > 0 && (
                                            <span className="text-lg">+{property.videos.length}📹</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-700 font-medium">
                                        Media {property.videos && property.videos.length > 0 ? 'Files' : 'Photos'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-xl mt-6 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About this property</h2>
                            <p className="text-gray-700 leading-relaxed text-lg">{property.description}</p>
                        </div>
                    </div>

                    {/* Property Details and Contact */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="bg-white rounded-2xl shadow-xl p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Agent</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-lg">Property Agent</p>
                                            <p className="text-sm text-gray-600">Verified Professional</p>
                                            <div className="flex items-center mt-1">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-600 ml-1">(4.8)</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t pt-6">
                                        <button className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                            Schedule Viewing
                                        </button>
                                        <button 
                                            onClick={handleContactClick}
                                            className="w-full mt-3 px-6 py-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {hasSubmittedLead ? `Call: ${property.contactNumber}` : 'Get Contact Details'}
                                        </button>
                                    </div>
                                    
                                    <div className="border-t pt-6">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Listed on</span>
                                            <span className="text-gray-900 font-medium">{new Date(property.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mt-2">
                                            <span className="text-gray-600">Views</span>
                                            <span className="text-gray-900 font-medium">1,234</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Enhanced Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="relative">
                    <img 
                        src={property.gallery[selectedImageIndex]} 
                        alt={`View ${selectedImageIndex + 1} of ${property.title}`} 
                        className="rounded-2xl object-contain w-full h-[85vh]" 
                    />
                    
                    {/* Navigation Buttons */}
                    <button 
                        onClick={showPrevImage} 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-2xl hover:bg-white transition-all hover:scale-110"
                    >
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    <button 
                        onClick={showNextImage} 
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-2xl hover:bg-white transition-all hover:scale-110"
                    >
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    
                    {/* Close Button */}
                    <button 
                        onClick={closeModal} 
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-2xl hover:bg-white transition-all"
                    >
                        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-900">
                        {selectedImageIndex + 1} / {property.gallery.length}
                    </div>
                    
                    {/* Thumbnail Navigation */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-2xl overflow-x-auto px-4">
                        {property.gallery.map((image, index) => (
                            <div 
                                key={index} 
                                className={`relative flex-shrink-0 cursor-pointer transition-all duration-300 ${
                                    index === selectedImageIndex 
                                        ? 'ring-4 ring-white scale-110' 
                                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                                }`}
                                onClick={() => setSelectedImageIndex(index)}
                            >
                                <img 
                                    src={image} 
                                    alt={`Thumbnail ${index + 1}`} 
                                    className="w-20 h-16 object-cover rounded-lg" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* Lead Capture Modal for Contact */}
            <LeadCaptureModal
                isOpen={showLeadModal}
                onClose={handleCloseLeadModal}
                onSubmit={handleLeadSubmit}
                title="Get Contact Details"
                description="Get priority access to property details and contact information"
            />

            {/* Lead Capture Modal for Price */}
            <LeadCaptureModal
                isOpen={showPriceModal}
                onClose={handleClosePriceModal}
                onSubmit={handlePriceLeadSubmit}
                title="Request Price Information"
                description="Our team will call you within 24 hours with detailed pricing information"
            />
        </div>
    );
}
