'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Banner({ banners = [] }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-slide functionality
    useEffect(() => {
        if (banners.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 4000);

        return () => clearInterval(timer);
    }, [banners.length]);

    // Don't render if no banners
    if (!banners || banners.length === 0) {
        return null;
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <div className="relative overflow-hidden">
            {/* Banner Slides */}
            <div className="relative h-32 sm:h-40 md:h-48">
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                            index === currentSlide ? 'translate-x-0' : 
                            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                        }`}
                    >
                        {banner.link ? (
                            <Link href={banner.link} className="block h-full w-full relative">
                                <BannerContent banner={banner} />
                            </Link>
                        ) : (
                            <div className="h-full w-full relative">
                                <BannerContent banner={banner} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Controls - only show if more than 1 banner */}
            {banners.length > 1 && (
                <>
                    {/* Previous/Next Buttons */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors z-10"
                        aria-label="Previous banner"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors z-10"
                        aria-label="Next banner"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${
                                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                                }`}
                                aria-label={`Go to banner ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function BannerContent({ banner }) {
    return (
        <div className="relative h-full w-full">
            {/* Background Image */}
            <img
                src={banner.image}
                alt={banner.alt || banner.title || 'Banner'}
                className="w-full h-full object-cover"
            />
            
            {/* Overlay for better text visibility */}
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Optional Text Overlay */}
            {(banner.title || banner.subtitle) && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        {banner.title && (
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 drop-shadow-lg">
                                {banner.title}
                            </h3>
                        )}
                        {banner.subtitle && (
                            <p className="text-sm sm:text-base md:text-lg drop-shadow-lg">
                                {banner.subtitle}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}