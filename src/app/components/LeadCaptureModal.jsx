'use client';

import { useState } from 'react';
import { getAllLocations } from '@/utils/locations';

export default function LeadCaptureModal({ isOpen, onClose, onSubmit, title = "Get Exclusive Property Access", description = "Join 5,000+ happy families who found their dream home with us.", propertyLocation = '' }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interestedLocation: propertyLocation
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!formData.name.trim() || !formData.phone.trim() || (!propertyLocation && !formData.interestedLocation.trim())) {
        throw new Error(propertyLocation ? 'Name and phone are required' : 'Name, phone, and interested location are required');
      }

      if (formData.phone.replace(/\s/g, '').length !== 10) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      await onSubmit(formData);
      setFormData({ name: '', phone: '', email: '', interestedLocation: '' });
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Background overlay with blur */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
          
          {/* Left Side: Visual & Benefits (Hidden on Mobile) */}
          <div className="hidden md:flex md:w-2/5 bg-[#D7242A] relative overflow-hidden flex-col justify-between p-8 text-white">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-32 h-32 bg-white/5 rounded-full"></div>
            
            <div className="relative">
              <div className="w-12 h-1 w-12 bg-white rounded-full mb-6"></div>
              <h3 className="text-3xl font-extrabold leading-tight">
                Unlock <br />
                <span className="text-white/80">Premium</span> <br />
                Listings
              </h3>
              <p className="mt-4 text-white/90 text-sm">
                Get first-hand access to new launches and exclusive builder offers before they hit the market.
              </p>
            </div>

            <div className="relative space-y-4 mt-8">
              {[
                "Zero Brokerage on New Projects",
                "Verified Direct Builder Floor Plans",
                "Priority Site Visit Scheduling",
                "Exclusive Launch Discounts"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {benefit}
                </div>
              ))}
            </div>

            <div className="relative mt-auto pt-8 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#D7242A] bg-gray-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-white/80">Trusted by 5,000+ families</span>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="flex-1 p-6 sm:p-10 relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-extrabold text-gray-900">{title}</h3>
              <p className="text-gray-500 mt-2 text-sm">{description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-[#D7242A] text-[#D7242A] p-3 rounded text-sm animate-shake">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 px-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none text-gray-900 placeholder-gray-400"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 px-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none text-gray-900 placeholder-gray-400"
                      placeholder="98765 43210"
                    />
                  </div>
                </div>
              </div>

              {/* Hide location when already known from property page */}
              {!propertyLocation && (
                <div>
                  <label htmlFor="interestedLocation" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 px-1">
                    Preferred Location
                  </label>
                  <select
                    id="interestedLocation"
                    name="interestedLocation"
                    value={formData.interestedLocation}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none text-gray-900 bg-white"
                  >
                    <option value="">Select where you want to buy</option>
                    {getAllLocations().map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Hide email on property pages to reduce friction */}
              {!propertyLocation && (
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 px-1">
                    Email Address <span className="text-gray-400 font-normal italic">(For floor plans)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D7242A] focus:ring-4 focus:ring-[#D7242A]/10 transition-all outline-none text-gray-900 placeholder-gray-400"
                    placeholder="john@example.com"
                  />
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#D7242A] text-white font-extrabold rounded-xl hover:bg-[#D7242A]/90 focus:ring-4 focus:ring-[#D7242A]/20 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Request...
                    </>
                  ) : (
                    <>
                      Get Free Consultation
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-green-600 text-xs font-bold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  100% Privacy Guaranteed
                </div>
                <button 
                  type="button" 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-xs font-medium underline underline-offset-4"
                >
                  Close & browse properties
                </button>
              </div>
            </form>
          </div>
      </div>
    </div>
  );
}
