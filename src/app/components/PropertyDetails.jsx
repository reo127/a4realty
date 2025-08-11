/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import Modal from './Modal';

const allProperties = [
    {
        id: 1,
        title: "Modern Downtown Apartment",
        location: "Downtown, Metropolis",
        price: "1,200,000",
        type: "flat",
        bhk: "2bhk",
        mode: "buy",
        img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1600&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1600&auto=format&fit=crop",
        ],
        description: "A stunning modern apartment in the heart of the city, offering breathtaking views and state-of-the-art amenities. Perfect for young professionals and couples."
    },
    {
        id: 2,
        title: "Spacious Family House",
        location: "Suburbia, Metropolis",
        price: "750,000",
        type: "house",
        bhk: "3bhk",
        mode: "buy",
        img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1600&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1600&auto=format&fit=crop",
        ],
        description: "A beautiful and spacious family home in a quiet suburban neighborhood. Features a large backyard, a modern kitchen, and is close to schools and parks."
    },
];

export default function PropertyDetails() {
    const { id } = useParams();
    const property = allProperties.find(p => p.id.toString() === id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (!property) {
        return <div>Property not found</div>;
    }

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
