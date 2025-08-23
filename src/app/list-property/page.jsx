'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ListProperty() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    type: '',
    bhk: '',
    mode: '',
    description: '',
    contactNumber: '',
    gallery: []
  });
  
  const [previewImages, setPreviewImages] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Check if user is admin
      if (userData.role !== 'admin') {
        router.push('/');
        return;
      }
    } else {
      router.push('/login');
    }
    
    setLoading(false);
  }, [router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'contactNumber') {
      // Only allow numbers and limit to 10 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    setUploadingImages(true);
    setError('');
    
    // Create preview URLs
    const newPreviewImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isUrl: false
    }));
    
    setPreviewImages([...previewImages, ...newPreviewImages]);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in');
      }
      
      const uploadedUrls = [];
      
      // Upload each image to Cloudinary
      for (const item of newPreviewImages) {
        const formData = new FormData();
        formData.append('file', item.file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to upload image');
        }
        
        uploadedUrls.push(data.url);
      }
      
      // Update form data with new image URLs
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...uploadedUrls]
      }));
      
    } catch (error) {
      setError(error.message);
    } finally {
      setUploadingImages(false);
    }
  };
  
  const removeImage = (index) => {
    // Remove from preview
    const newPreviewImages = [...previewImages];
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
    
    // Remove from form data
    const newGallery = [...formData.gallery];
    newGallery.splice(index, 1);
    setFormData({ ...formData, gallery: newGallery });
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) {
      setError('Please enter a valid image URL');
      return;
    }

    // Add URL to preview images
    const newPreviewImage = {
      preview: imageUrl,
      isUrl: true
    };
    
    setPreviewImages([...previewImages, newPreviewImage]);
    
    // Add URL to form data gallery
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, imageUrl]
    }));
    
    // Clear input
    setImageUrl('');
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in');
      }
      
      // Validate form data
      if (formData.gallery.length === 0) {
        throw new Error('Please upload at least one image');
      }
      
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create property');
      }
      
      setSuccess('Property listed successfully!');
      
      // Reset form
      setFormData({
        title: '',
        location: '',
        price: '',
        type: '',
        bhk: '',
        mode: '',
        description: '',
        contactNumber: '',
        gallery: []
      });
      setPreviewImages([]);
      setImageUrl('');
      
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-blue-800 text-center">List Your Property</h1>
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-700 text-white py-4 px-6">
            <h2 className="text-xl font-semibold">Property Details</h2>
            <p className="text-blue-100 text-sm mt-1">Fill in the information below to list your property</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6 text-black">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="e.g. Modern 2BHK Apartment"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location*
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="e.g. Koramangala, Bangalore"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price*
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="e.g. 50 lakhs, 1cr - 1.5cr, 5000000"
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type*
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                  <option value="">Select Type</option>
                  <option value="flat">Flat</option>
                  <option value="house">House</option>
                  <option value="land">Land</option>
                  <option value="office">Office Space</option>
                </select>
              </div>
              
              {(formData.type === 'flat' || formData.type === 'house') && (
                <div>
                  <label htmlFor="bhk" className="block text-sm font-medium text-gray-700 mb-1">
                    BHK*
                  </label>
                  <select
                    id="bhk"
                    name="bhk"
                    value={formData.bhk}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  >
                    <option value="">Select BHK</option>
                    <option value="1bhk">1 BHK</option>
                    <option value="2bhk">2 BHK</option>
                    <option value="3bhk">3 BHK</option>
                    <option value="4bhk">4 BHK</option>
                    <option value="5bhk">5+ BHK</option>
                  </select>
                </div>
              )}
              
              <div>
                <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">
                  Mode*
                </label>
                <select
                  id="mode"
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                  <option value="">Select Mode</option>
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                placeholder="Describe your property in detail..."
              />
            </div>
            
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number*
              </label>
              <input
                type="text"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                placeholder="e.g. 9876543210"
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Images*
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-white">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload images</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        multiple 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImages}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              
              {uploadingImages && (
                <div className="mt-2 text-sm text-gray-500 flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading images...
                </div>
              )}
              
              {/* URL Input Section */}
              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Or Add Image URLs</h3>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL here (e.g., https://example.com/image.jpg)"
                    className="flex-1 p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  You can add multiple images by pasting URLs one at a time
                </p>
              </div>

              {previewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previewImages.map((image, index) => (
                    <div key={index} className="relative group rounded-md overflow-hidden shadow-sm">
                      <img 
                        src={image.preview} 
                        alt={`Preview ${index}`} 
                        className="h-24 w-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        }}
                      />
                      <div className="absolute top-1 left-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          image.isUrl ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {image.isUrl ? 'URL' : 'File'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={submitting || uploadingImages}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : 'List Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}