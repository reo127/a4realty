/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function PropertyDetails() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="text-red-500 text-xl font-semibold mb-4">Error: {error}</div>
                <Link href="/" className="text-indigo-600 hover:text-indigo-800">
                    Return to Home
                </Link>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="text-xl font-semibold mb-4">Property not found</div>
                <Link href="/" className="text-indigo-600 hover:text-indigo-800">
                    Return to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white text-gray-900">
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Image Gallery */}
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
                        <div className="grid grid-cols-2 gap-4">
                            {property.gallery.map((image, index) => (
                                <div key={index} className={`col-span-${index === 0 ? '2' : '1'} cursor-pointer`} onClick={() => openModal(index)}>
                                    <img src={image} alt={`View ${index + 1} of ${property.title}`} className="rounded-lg object-cover w-full h-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Property Details and Contact */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 p-6 rounded-lg bg-gray-50 border border-gray-200">
                            <p className="text-3xl font-bold text-indigo-600">${property.price}</p>
                            <p className="text-lg text-gray-700 mt-2">{property.location}</p>
                            <div className="mt-4 border-t pt-4">
                                <p className="text-sm text-gray-600"><span className="font-semibold">Type:</span> {property.type}</p>
                                <p className="text-sm text-gray-600"><span className="font-semibold">BHK:</span> {property.bhk}</p>
                                <p className="text-sm text-gray-600"><span className="font-semibold">For:</span> {property.mode}</p>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <h3 className="font-semibold">Description</h3>
                                <p className="text-sm text-gray-600 mt-1">{property.description}</p>
                            </div>
                            <button className="mt-6 w-full px-6 py-3 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700">
                                Contact Agent
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="relative">
                    <img src={property.gallery[selectedImageIndex]} alt={`View ${selectedImageIndex + 1} of ${property.title}`} className="rounded-lg object-contain w-full h-[80vh]" />
                    <button onClick={showPrevImage} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg">&#10094;</button>
                    <button onClick={showNextImage} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg">&#10095;</button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {property.gallery.map((image, index) => (
                            <img key={index} src={image} alt={`Thumbnail ${index + 1}`} className={`w-16 h-16 object-cover rounded-md cursor-pointer ${index === selectedImageIndex ? 'border-2 border-white' : ''}`} onClick={() => setSelectedImageIndex(index)} />
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
