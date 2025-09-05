/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Modal from './Modal';
import LeadCaptureModal from './LeadCaptureModal';
import { formatPrice } from '../../utils/formatPrice';
import { getEmbedUrl } from '@/utils/videoUtils';

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
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [mediaType, setMediaType] = useState('images'); // 'images' or 'videos'
    const [isZoomed, setIsZoomed] = useState(false);
    const [isSubmittingLead, setIsSubmittingLead] = useState(false);
    const [sidebarForm, setSidebarForm] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (showMediaModal) {
                switch(e.key) {
                    case 'Escape':
                        handleCloseMediaModal();
                        break;
                    case 'ArrowLeft':
                        handleMediaNavigation('prev');
                        break;
                    case 'ArrowRight':
                        handleMediaNavigation('next');
                        break;
                }
            }
        };
        
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showMediaModal, mediaType, currentMediaIndex, isZoomed]);

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
        setShowPriceModal(true);
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

            setShowPriceModal(false);
            setShowPriceSuccessModal(true);

        } catch (error) {
            throw error;
        }
    };

    const [showBrochureModal, setShowBrochureModal] = useState(false);
    const [showPriceSuccessModal, setShowPriceSuccessModal] = useState(false);
    const [showBrochureSuccessModal, setShowBrochureSuccessModal] = useState(false);
    const [showSidebarSuccessModal, setShowSidebarSuccessModal] = useState(false);

    const handleBrochureClick = () => {
        setShowBrochureModal(true);
    };

    const handleBrochureLeadSubmit = async (leadData) => {
        try {
            const brochureInquiryData = {
                ...leadData,
                inquiryType: 'brochure_request',
                propertyId: property._id,
                propertyTitle: property.title
            };

            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(brochureInquiryData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit lead');
            }

            setShowBrochureModal(false);
            setShowBrochureSuccessModal(true);

        } catch (error) {
            throw error;
        }
    };


    const handleCloseBrochureModal = () => {
        setShowBrochureModal(false);
    };

    const handleClosePriceSuccessModal = () => {
        setShowPriceSuccessModal(false);
    };

    const handleCloseBrochureSuccessModal = () => {
        setShowBrochureSuccessModal(false);
    };

    const handleCloseSidebarSuccessModal = () => {
        setShowSidebarSuccessModal(false);
    };

    const handleSidebarFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingLead(true);
        
        try {
            if (!sidebarForm.name || !sidebarForm.phone) {
                throw new Error('Name and phone number are required');
            }

            if (sidebarForm.phone.length !== 10) {
                throw new Error('Please enter a valid 10-digit phone number');
            }

            const leadSubmissionData = {
                ...sidebarForm,
                inquiryType: 'general_inquiry',
                propertyId: property._id,
                propertyTitle: property.title,
                interestedLocation: property.location
            };

            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadSubmissionData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit lead');
            }

            // Lead submitted successfully - show success message
            setSidebarForm({ name: '', email: '', phone: '' });
            setShowSidebarSuccessModal(true);
            
        } catch (error) {
            console.error('Error submitting lead:', error);
            alert(error.message || 'Failed to submit. Please try again.');
        } finally {
            setIsSubmittingLead(false);
        }
    };

    const handleMediaNavigation = (direction) => {
        const currentMedia = mediaType === 'images' ? property.gallery : (property.videos || []);
        if (direction === 'next') {
            setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % currentMedia.length);
        } else {
            setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + currentMedia.length) % currentMedia.length);
        }
        setIsZoomed(false);
    };

    const handleThumbnailClick = (index) => {
        setCurrentMediaIndex(index);
        setIsZoomed(false);
    };

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };


    const handleCloseMediaModal = () => {
        setShowMediaModal(false);
        setIsZoomed(false);
    };

    const sections = [
        { label: "Overview", id: "overview" },
        { label: "Amenities", id: "amenities" },
        { label: "About Project", id: "about-project" },
        { label: "Ratings & Reviews", id: "ratings-reviews" },
        { label: "About Location", id: "about-location" },
        { label: "Price Trends", id: "price-trends" },
        { label: "Project Details", id: "project-details" },
        { label: "About Developer", id: "about-developer" },
    ];


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
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen ">
            <div className="relative">
                <img src={property.gallery[0]} alt={property.title} className="w-full h-[200px] sm:h-[250px] lg:h-[25.625rem] object-cover bg-no-repeat bg-center" />
                <div 
                    className='bg-white text-black flex items-center justify-center gap-2 w-[8rem] sm:w-[10rem] h-[2.5rem] sm:h-[3rem] rounded-[.5rem] absolute bottom-4 right-4 cursor-pointer hover:bg-gray-50 transition-colors shadow-md'
                    onClick={() => {
                        setShowMediaModal(true);
                        setCurrentMediaIndex(0);
                        setMediaType('images');
                    }}
                >
                    <svg className="w-[20px] sm:w-[27px] h-[20px] sm:h-[27px] text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" d="M4 18V8a1 1 0 0 1 1-1h1.5l1.707-1.707A1 1 0 0 1 8.914 5h6.172a1 1 0 0 1 .707.293L17.5 7H19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
                        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    <p className='text-xs sm:text-sm font-normal'>{property.gallery.length} photos</p>
                </div>
            </div>

            <div className='bg-white text-black shadow-lg overflow-x-auto'>
                <div className='flex items-center justify-between gap-2 sm:gap-4 text-black bg-white w-full xl:w-[80%] mx-auto h-[3.25rem] px-4 min-w-fit'>
                    {sections.map(({ label, id }) => (
                        <button 
                            key={id} 
                            onClick={(e) => {
                                e.preventDefault();
                                const element = document.getElementById(id);
                                if (element) {
                                    element.scrollIntoView({ 
                                        behavior: 'smooth',
                                        block: 'start',
                                        inline: 'nearest'
                                    });
                                }
                            }}
                            className="hover:text-blue-600 transition-colors duration-200 cursor-pointer whitespace-nowrap text-xs sm:text-sm font-medium py-2 px-1 sm:px-2"
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className='flex flex-col lg:flex-row px-4 sm:px-6 lg:px-0 xl:px-[7rem] mt-8 sm:mt-12 gap-8 lg:gap-0 '>
                <div className='text-black w-full lg:w-9/12 lg:pr-8'>
                    <section id="overview">
                        <h1 className='text-2xl sm:text-3xl lg:text-[32px] text-[#303030] font-bold leading-tight'>{property.title}</h1>
                        <div className='mt-3 sm:mt-4'>
                            {property.developer && <p className='text-sm text-[#606060] leading-[16px] mb-3'>By {property.developer}</p>}
                            <div className='flex items-center justify-start gap-2 mb-3'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin-check-inside-icon lucide-map-pin-check-inside flex-shrink-0"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><path d="m9 10 2 2 4-4" /></svg>
                                <span className='text-sm sm:text-base'>{property.location}</span>
                            </div>

                            {property.possessionDate && (
                                <div className='flex items-center justify-start gap-2'>
                                    <svg xmlns="http://www.w3.org/2000/svg" style={{color: "green"}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                                    <span className='text-sm sm:text-base'>Possession by {property.possessionDate}</span>
                                </div>
                            )}
                        </div>

                        <div className='mt-6'>
                            <div className='mb-4'>
                                <p className='text-lg sm:text-[18px] text-[#999999] font-semibold'>Price Available On Request</p>
                                <p className='text-sm text-[#606060]'>{property.bhk} Flat</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                                {/* Get Price Button */}
                                <button 
                                    onClick={handlePriceClick}
                                    className="flex cursor-pointer items-center justify-center gap-2 px-4 sm:px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition w-full sm:w-auto"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className='text-sm sm:text-base'>Get Price</span>
                                </button>

                                {/* Download Brochure Button */}
                                <button 
                                    onClick={handleBrochureClick}
                                    className="flex cursor-pointer items-center justify-center gap-2 px-4 sm:px-5 py-3 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-lg shadow-md transition w-full sm:w-auto"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className='text-sm sm:text-base'>Download Brochure</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <section id="amenities" className='mt-16 sm:mt-24 lg:mt-32'>
                        <div className='text-2xl sm:text-3xl lg:text-[32px] text-[#303030] font-bold mb-6'>Amenities</div>
                        {property.amenities && property.amenities.length > 0 ? (
                            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'>
                                {property.amenities.map((amenity, index) => (
                                    <div key={index} className='text-[#606060] rounded-md font-thin flex flex-col border items-center justify-center h-[70px] sm:h-[80px] p-2'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-party-popper-icon lucide-party-popper mb-1"><path d="M5.8 11.3 2 22l10.7-3.79" /><path d="M4 3h.01" /><path d="M22 8h.01" /><path d="M15 2h.01" /><path d="M22 20h.01" /><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" /><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17" /><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7" /><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" /></svg>
                                        <p className='text-xs sm:text-sm text-center leading-tight'>{amenity}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className='text-[#999999] italic'>No amenities information available</p>
                        )}
                    </section>


                    <section id="about-project" className='mt-16 sm:mt-24 lg:mt-32'>
                        <h1 className='text-2xl sm:text-3xl lg:text-[32px] text-[#303030] font-bold mb-6'>About {property.title}</h1>
                        {property.description && <p className='text-sm sm:text-base text-[#606060] leading-relaxed my-6 sm:my-8'>{property.description}</p>}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                            <div className='border border-[#606060] rounded-md p-4'>
                                <p className=' text-[#606060]'>Project Area</p>
                                <div className='flex items-center justify-start gap-2'>
                                    <h3 className='text-xl font-semibold'>{property.projectArea || '-'}</h3>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"><path d="M12 15v-3.014" /><path d="M16 15v-3.014" /><path d="M20 6H4" /><path d="M20 8V4" /><path d="M4 8V4" /><path d="M8 15v-3.014" /><rect x="3" y="12" width="18" height="7" rx="1" /></svg>
                                </div>
                            </div>
                            <div className='border border-[#606060] rounded-md p-4'>
                                <p className=' text-[#606060]'>Launch Date</p>
                                <div className='flex items-center justify-start gap-2'>
                                    <h3 className='text-xl font-semibold'>{property.launchDate || '-'}</h3>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"><path d="M12 15v-3.014" /><path d="M16 15v-3.014" /><path d="M20 6H4" /><path d="M20 8V4" /><path d="M4 8V4" /><path d="M8 15v-3.014" /><rect x="3" y="12" width="18" height="7" rx="1" /></svg>
                                </div>
                            </div>
                            <div className='border border-[#606060] rounded-md p-4'>
                                <p className=' text-[#606060]'>Total Units</p>
                                <div className='flex items-center justify-start gap-2'>
                                    <h3 className='text-xl font-semibold'>{property.totalUnits || '-'}</h3>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"><path d="M12 15v-3.014" /><path d="M16 15v-3.014" /><path d="M20 6H4" /><path d="M20 8V4" /><path d="M4 8V4" /><path d="M8 15v-3.014" /><rect x="3" y="12" width="18" height="7" rx="1" /></svg>
                                </div>
                            </div>
                            <div className='border border-[#606060] rounded-md p-4'>
                                <p className=' text-[#606060]'>Total Towers</p>
                                <div className='flex items-center justify-start gap-2'>
                                    <h3 className='text-xl font-semibold'>{property.totalTowers || '-'}</h3>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"><path d="M12 15v-3.014" /><path d="M16 15v-3.014" /><path d="M20 6H4" /><path d="M20 8V4" /><path d="M4 8V4" /><path d="M8 15v-3.014" /><rect x="3" y="12" width="18" height="7" rx="1" /></svg>
                                </div>
                            </div>
                            <div className='border border-[#606060] rounded-md p-4'>
                                <p className=' text-[#606060]'>BHK</p>
                                <div className='flex items-center justify-start gap-2'>
                                    <h3 className='text-xl font-semibold'>{property.bhk || '-'}</h3>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"><path d="M12 15v-3.014" /><path d="M16 15v-3.014" /><path d="M20 6H4" /><path d="M20 8V4" /><path d="M4 8V4" /><path d="M8 15v-3.014" /><rect x="3" y="12" width="18" height="7" rx="1" /></svg>
                                </div>
                            </div>
                        </div>

                        <h1 className='text-xl sm:text-2xl lg:text-[26px] text-[#303030] font-bold mt-8 sm:mt-12 lg:mt-14 mb-4'>Highlights</h1>
                        {property.highlights && property.highlights.length > 0 ? (
                            <div className='space-y-3'>
                                {property.highlights.map((highlight, index) => (
                                    <div key={index} className='flex items-center justify-start gap-3'>
                                        <svg xmlns="http://www.w3.org/2000/svg" style={{color: "green"}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                                        <span className='text-sm sm:text-base'>{highlight}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className='text-[#999999] italic text-sm'>No highlights information available</p>
                        )}

                        <h1 className='text-xl sm:text-2xl lg:text-[26px] text-[#303030] font-bold mt-8 sm:mt-12 lg:mt-14 mb-4'>Location Advantages</h1>
                        {property.locationAdvantages && property.locationAdvantages.length > 0 ? (
                            <div className='space-y-3'>
                                {property.locationAdvantages.map((advantage, index) => (
                                    <div key={index} className='flex items-center justify-start gap-3'>
                                        <svg xmlns="http://www.w3.org/2000/svg" style={{color: "green"}} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-icon lucide-circle-check flex-shrink-0"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                                        <span className='text-sm sm:text-base'>{advantage}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className='text-[#999999] italic text-sm'>No location advantages information available</p>
                        )}
                    </section>



                    <section id="ratings-reviews"></section>
                    <section id="about-location" className='mb-12 sm:mb-24 lg:mb-32'></section>
                </div>
                <div className="w-full xl:w-[40rem] lg:w-3/12 lg:pl-8 mb-12">
                    <div className="sticky top-[5rem]">
                        <form onSubmit={handleSidebarFormSubmit} className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl p-6 sm:p-8 space-y-4 sm:space-y-5">
                            <h2 className="text-lg sm:text-xl font-semibold text-blue-900 text-center leading-tight">
                                Looking for a property in <br />
                                <span className="text-blue-600 text-base sm:text-lg">{property.title}</span>
                            </h2>

                        <input
                            type="text"
                            placeholder="Your Name *"
                            value={sidebarForm.name}
                            onChange={(e) => setSidebarForm({...sidebarForm, name: e.target.value})}
                            required
                            className="text-black w-full px-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        />

                        <input
                            type="email"
                            placeholder="Your Email"
                            value={sidebarForm.email}
                            onChange={(e) => setSidebarForm({...sidebarForm, email: e.target.value})}
                            className="text-black w-full px-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        />

                        <input
                            type="tel"
                            placeholder="Phone Number *"
                            value={sidebarForm.phone}
                            onChange={(e) => {
                                // Only allow numbers and limit to 10 digits
                                const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setSidebarForm({...sidebarForm, phone: numericValue});
                            }}
                            onKeyPress={(e) => {
                                // Prevent non-numeric characters from being typed
                                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                                    e.preventDefault();
                                }
                            }}
                            maxLength={10}
                            required
                            className="text-black w-full px-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        />

                        <button
                            type="submit"
                            disabled={isSubmittingLead}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition"
                        >
                            {isSubmittingLead ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                    </div>
                </div>
            </div>

            {/* Modern Media Viewer Modal */}
            {showMediaModal && (
                <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md z-50 flex items-center justify-center">
                    <div className="relative w-full h-full max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
                            <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-semibold">{property.title}</h3>
                                    <div className="flex bg-white/20 rounded-lg p-1 gap-1">
                                        <button 
                                            onClick={() => {
                                                setMediaType('images');
                                                setCurrentMediaIndex(0);
                                            }}
                                            className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition ${
                                                mediaType === 'images' ? 'bg-white text-black' : 'text-white hover:bg-white/20'
                                            }`}
                                        >
                                            Images ({property.gallery?.length || 0})
                                        </button>
                                        {property.videos && property.videos.length > 0 && (
                                            <button 
                                                onClick={() => {
                                                    setMediaType('videos');
                                                    setCurrentMediaIndex(0);
                                                }}
                                                className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition ${
                                                    mediaType === 'videos' ? 'bg-white text-black' : 'text-white hover:bg-white/20'
                                                }`}
                                            >
                                                Videos ({property.videos.length})
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {mediaType === 'images' && (
                                        <button
                                            onClick={toggleZoom}
                                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                                            title={isZoomed ? "Zoom Out" : "Zoom In"}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {isZoomed ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-3" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                )}
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCloseMediaModal}
                                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                                        title="Close"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Media Display */}
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                            {(() => {
                                const currentMedia = mediaType === 'images' ? property.gallery : (property.videos || []);
                                const currentItem = currentMedia[currentMediaIndex];
                                
                                if (!currentItem) return null;
                                
                                if (mediaType === 'images') {
                                    return (
                                        <div className={`relative max-w-full max-h-full transition-transform duration-300 select-none ${
                                            isZoomed ? 'scale-150 cursor-move' : 'cursor-zoom-in'
                                        }`} onClick={toggleZoom}>
                                            <img 
                                                src={currentItem} 
                                                alt={`Property image ${currentMediaIndex + 1}`}
                                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                                                draggable={false}
                                            />
                                        </div>
                                    );
                                } else {
                                    const embedUrl = getEmbedUrl(currentItem);
                                    return (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            {embedUrl ? (
                                                <div className="relative w-full max-w-6xl" style={{ aspectRatio: '16/9' }}>
                                                    <iframe
                                                        src={`${embedUrl}?enablejsapi=1&origin=${window.location.origin}&rel=0&showinfo=1&controls=1&modestbranding=1&playsinline=1`}
                                                        className="absolute inset-0 w-full h-full rounded-lg shadow-2xl"
                                                        style={{ border: 'none' }}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                                                        allowFullScreen
                                                        title={`Property video ${currentMediaIndex + 1}`}
                                                        loading="lazy"
                                                        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="relative max-w-full max-h-full">
                                                    <video 
                                                        src={currentItem}
                                                        controls
                                                        className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                                                        autoPlay={false}
                                                        playsInline
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                            })()}
                            
                            {/* Navigation Arrows */}
                            {(() => {
                                const currentMedia = mediaType === 'images' ? property.gallery : (property.videos || []);
                                return currentMedia.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => handleMediaNavigation('prev')}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition z-10"
                                            title="Previous"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleMediaNavigation('next')}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition z-10"
                                            title="Next"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Bottom Thumbnails */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <div className="flex items-center justify-center gap-2 max-w-full overflow-x-auto scrollbar-hide">
                                    {(() => {
                                        const currentMedia = mediaType === 'images' ? property.gallery : (property.videos || []);
                                        return currentMedia.map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleThumbnailClick(index)}
                                                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                                                    index === currentMediaIndex ? 'border-white scale-110' : 'border-transparent hover:border-white/50'
                                                }`}
                                            >
                                                {mediaType === 'images' ? (
                                                    <img 
                                                        src={item} 
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z"/>
                                                        </svg>
                                                    </div>
                                                )}
                                                {index === currentMediaIndex && (
                                                    <div className="absolute inset-0 bg-white/20"></div>
                                                )}
                                            </button>
                                        ));
                                    })()}
                                </div>
                                
                                {/* Counter */}
                                <div className="text-center text-white/80 text-sm mt-2">
                                    {currentMediaIndex + 1} / {(() => {
                                        const currentMedia = mediaType === 'images' ? property.gallery : (property.videos || []);
                                        return currentMedia.length;
                                    })()}
                                </div>
                            </div>

                        {/* Keyboard shortcuts info */}
                        <div className="absolute top-20 right-4 bg-black/60 text-white text-xs p-2 rounded hidden lg:block">
                            <div>← → Navigate</div>
                            <div>ESC Close</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lead Capture Modal for Price Inquiry */}
            {showPriceModal && (
                <LeadCaptureModal
                    isOpen={showPriceModal}
                    onClose={handleClosePriceModal}
                    onSubmit={handlePriceLeadSubmit}
                    title="Get Property Price"
                    description="Thank you for your interest! We'll call you soon with the price details."
                    propertyTitle={property.title}
                />
            )}

            {/* Lead Capture Modal for Brochure Download */}
            {showBrochureModal && (
                <LeadCaptureModal
                    isOpen={showBrochureModal}
                    onClose={handleCloseBrochureModal}
                    onSubmit={handleBrochureLeadSubmit}
                    title="Download Brochure"
                    description="Thank you for your interest! We'll contact you soon with the property brochure."
                    propertyTitle={property.title}
                />
            )}

            {/* General Lead Capture Modal */}
            {showLeadModal && (
                <LeadCaptureModal
                    isOpen={showLeadModal}
                    onClose={handleCloseLeadModal}
                    onSubmit={handleLeadSubmit}
                    title="Contact Property"
                    description="Please provide your contact details and we'll get back to you shortly."
                    propertyTitle={property.title}
                />
            )}

            {/* Price Success Modal */}
            {showPriceSuccessModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClosePriceSuccessModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center mx-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                        <p className="text-gray-600 mb-6">
                            We have received your price inquiry. Our team will contact you soon with detailed pricing information.
                        </p>
                        <button
                            onClick={handleClosePriceSuccessModal}
                            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Brochure Success Modal */}
            {showBrochureSuccessModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCloseBrochureSuccessModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center mx-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Request Received!</h3>
                        <p className="text-gray-600 mb-6">
                            Thank you for your interest! Our team will contact you soon with the property brochure and additional details.
                        </p>
                        <button
                            onClick={handleCloseBrochureSuccessModal}
                            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Sidebar Form Success Modal */}
            {showSidebarSuccessModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCloseSidebarSuccessModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center mx-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                        <p className="text-gray-600 mb-6">
                            We have received your inquiry successfully. Our team will contact you soon with property details and assistance.
                        </p>
                        <button
                            onClick={handleCloseSidebarSuccessModal}
                            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
