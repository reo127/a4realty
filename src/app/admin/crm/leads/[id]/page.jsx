'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';
import { getLocationDisplayName, getNearbyLocations, normalizeLocationName } from '@/utils/locations';
import { formatPrice } from '@/utils/formatPrice';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [allLeads, setAllLeads] = useState([]);
  const [totalLeadsCount, setTotalLeadsCount] = useState(0);
  const [relatedProperties, setRelatedProperties] = useState([]);
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('exact');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [urlParams, setUrlParams] = useState({});
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    type: '',
    mode: '',
    bhk: '',
    minPrice: '',
    maxPrice: ''
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateSubstatus, setUpdateSubstatus] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [siteVisitDate, setSiteVisitDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [statusOptions, setStatusOptions] = useState({});
  const [availableSubstatuses, setAvailableSubstatuses] = useState([]);
  const [visitedLeads, setVisitedLeads] = useState(new Set());

  useEffect(() => {
    // Parse URL parameters from the current URL
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const parsedParams = {
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
        page: searchParams.get('page') || '1',
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || '',
        dateFrom: searchParams.get('dateFrom') || '',
        dateTo: searchParams.get('dateTo') || ''
      };
      setUrlParams(parsedParams);

      // Load visited leads from session storage
      const savedVisited = sessionStorage.getItem('visitedLeads');
      if (savedVisited) {
        try {
          setVisitedLeads(new Set(JSON.parse(savedVisited)));
        } catch (e) {
          console.error('Error loading visited leads:', e);
        }
      }

      // Mark current lead as visited
      const currentLeadId = params.id;
      if (currentLeadId) {
        const newVisited = savedVisited ? new Set(JSON.parse(savedVisited)) : new Set();
        newVisited.add(currentLeadId);
        setVisitedLeads(newVisited);
        sessionStorage.setItem('visitedLeads', JSON.stringify([...newVisited]));
      }
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id && Object.keys(urlParams).length > 0) {
      fetchLeadDetails();
      fetchAllLeadsForNavigation();
    }
  }, [params.id, urlParams]);

  useEffect(() => {
    if (lead?.interestedLocation) {
      fetchRelatedProperties();
    }
  }, [lead]);

  useEffect(() => {
    fetchStatusOptions();
  }, []);

  useEffect(() => {
    if (updateStatus && statusOptions[updateStatus]) {
      setAvailableSubstatuses(statusOptions[updateStatus] || []);
      // Clear substatus if it's not valid for the new status
      if (updateSubstatus && !statusOptions[updateStatus].includes(updateSubstatus)) {
        setUpdateSubstatus('');
      }
    } else {
      setAvailableSubstatuses([]);
      setUpdateSubstatus('');
    }
  }, [updateStatus, statusOptions]);

  const fetchLeadDetails = async () => {
    try {
      // Fetch the specific lead by ID
      const response = await fetch(`/api/leads/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setLead(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch lead details');
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      setError(error.message);
    }
  };

  const fetchAllLeadsForNavigation = async () => {
    try {
      // Use the same sorting/filtering/pagination params from the leads list page
      const queryParams = new URLSearchParams({
        limit: '30', // Match the leads list page limit for consistency
        page: urlParams.page || '1', // Respect the current page
        sortBy: urlParams.sortBy || 'createdAt',
        sortOrder: urlParams.sortOrder || 'desc',
        ...(urlParams.search && { search: urlParams.search }),
        ...(urlParams.status && { status: urlParams.status }),
        ...(urlParams.dateFrom && { dateFrom: urlParams.dateFrom }),
        ...(urlParams.dateTo && { dateTo: urlParams.dateTo })
      });

      const response = await fetch(`/api/leads?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setAllLeads(data.data);
        setTotalLeadsCount(data.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching leads for navigation:', error);
      // Non-critical error, don't block the page
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusOptions = async () => {
    try {
      const response = await fetch('/api/leads', { method: 'OPTIONS' });
      const data = await response.json();

      if (data.success) {
        setStatusOptions(data.data.statusSubstatusMap || {});
      }
    } catch (error) {
      console.error('Error fetching status options:', error);
    }
  };

  const fetchRelatedProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      const data = await response.json();
      
      if (data.success) {
        const allProperties = data.data;
        const interestedLocation = normalizeLocationName(lead.interestedLocation);
        
        // Exact location matches
        const exactMatches = allProperties.filter(property => 
          normalizeLocationName(property.location) === interestedLocation
        );
        
        // Nearby location matches - using both predefined nearby areas and property nearbyLocations field
        const nearbyLocations = getNearbyLocations(interestedLocation);
        const nearbyMatches = allProperties.filter(property => {
          const propLocation = normalizeLocationName(property.location);
          
          // Check if property location is in predefined nearby locations
          const isNearbyByLocation = nearbyLocations.some(nearby => 
            normalizeLocationName(nearby) === propLocation
          );
          
          // Check if property has the lead's interested location in its nearbyLocations field
          const isNearbyByProperty = property.nearbyLocations && property.nearbyLocations.some(nearby =>
            normalizeLocationName(nearby) === interestedLocation
          );
          
          return isNearbyByLocation || isNearbyByProperty;
        });
        
        setRelatedProperties(exactMatches);
        setNearbyProperties(nearbyMatches);
      } else {
        throw new Error(data.message || 'Failed to fetch properties');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProperties = async () => {
    try {
      setSearchLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (searchFilters.location) queryParams.append('location', searchFilters.location);
      if (searchFilters.type) queryParams.append('type', searchFilters.type);
      if (searchFilters.mode) queryParams.append('mode', searchFilters.mode);
      if (searchFilters.bhk) queryParams.append('bhk', searchFilters.bhk);
      
      const response = await fetch(`/api/properties?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        let results = data.data;
        
        // Filter by price range if specified
        if (searchFilters.minPrice || searchFilters.maxPrice) {
          results = results.filter(property => {
            const price = parseFloat(property.price.replace(/[^0-9.-]+/g, ""));
            const minPrice = searchFilters.minPrice ? parseFloat(searchFilters.minPrice) : 0;
            const maxPrice = searchFilters.maxPrice ? parseFloat(searchFilters.maxPrice) : Infinity;
            return price >= minPrice && price <= maxPrice;
          });
        }
        
        setSearchResults(results);
      } else {
        throw new Error(data.message || 'Failed to search properties');
      }
    } catch (error) {
      console.error('Error searching properties:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInputChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearSearch = () => {
    setSearchFilters({
      location: '',
      type: '',
      mode: '',
      bhk: '',
      minPrice: '',
      maxPrice: ''
    });
    setSearchResults([]);
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();

    if (!updateStatus && !updateNote.trim()) {
      setUpdateError('Please provide either a status update or a note');
      return;
    }

    setIsUpdating(true);
    setUpdateError('');

    try {
      let action;
      if (updateStatus && updateNote.trim()) {
        if (updateSubstatus) {
          action = 'updateStatusSubstatusAndNote';
        } else {
          action = 'updateStatusAndNote';
        }
      } else if (updateStatus) {
        if (updateSubstatus) {
          action = 'updateStatusAndSubstatus';
        } else {
          action = 'updateStatus';
        }
      } else {
        action = 'addNote';
      }

      const requestBody = {
        leadId: lead._id,
        action,
        status: updateStatus || undefined,
        substatus: updateSubstatus || undefined,
        note: updateNote.trim() || undefined,
        siteVisitDate: (updateStatus === 'site_visit_scheduled' && siteVisitDate) ? siteVisitDate : undefined,
        followUpDate: (updateStatus === 'follow_up_scheduled' && followUpDate) ? followUpDate : undefined,
        visitReason: ((updateStatus === 'site_visit_scheduled' || updateStatus === 'visit_rescheduled') && visitReason) ? visitReason : undefined,
        rescheduleReason: (updateStatus === 'visit_rescheduled' && rescheduleReason) ? rescheduleReason : undefined
      };

      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update lead');
      }

      // Update the local lead state
      setLead(data.data);

      // Update the lead in allLeads array too
      setAllLeads(prevLeads =>
        prevLeads.map(l => l._id === lead._id ? data.data : l)
      );

      // Reset form and close modal
      setUpdateStatus('');
      setUpdateSubstatus('');
      setUpdateNote('');
      setSiteVisitDate('');
      setShowUpdateModal(false);
    } catch (error) {
      console.error('Error updating lead:', error);
      setUpdateError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'not_connected': 'bg-yellow-100 text-yellow-800',
      'interested': 'bg-green-100 text-green-800',
      'site_visit_scheduled': 'bg-purple-100 text-purple-800',
      'follow_up_scheduled': 'bg-cyan-100 text-cyan-800',
      'visit_rescheduled': 'bg-orange-100 text-orange-800',
      'site_visit_done': 'bg-emerald-100 text-emerald-800',
      'not_interested': 'bg-red-100 text-red-800',
      'call_disconnected': 'bg-orange-100 text-orange-800',
      'location_mismatch': 'bg-purple-100 text-purple-800',
      'budget_mismatch': 'bg-pink-100 text-pink-800',
      'possession_mismatch': 'bg-indigo-100 text-indigo-800',
      'do_not_disturb': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatusText = (status) => {
    const statusDisplayNames = {
      'new': 'New',
      'not_connected': 'Not Connected',
      'interested': 'Interested',
      'site_visit_scheduled': 'Site Visit Scheduled',
      'follow_up_scheduled': 'Follow-up Scheduled',
      'visit_rescheduled': 'Visit Rescheduled',
      'site_visit_done': 'Site Visit Done',
      'not_interested': 'Not Interested',
      'call_disconnected': 'Call Disconnected',
      'location_mismatch': 'Location Mismatch',
      'budget_mismatch': 'Budget Mismatch',
      'possession_mismatch': 'Possession Mismatch',
      'do_not_disturb': 'Do Not Disturb'
    };
    return statusDisplayNames[status] || 'New';
  };

  const formatSubstatusText = (substatus) => {
    if (!substatus) return null;

    const substatusDisplayNames = {
      // Not Connected
      'ringing': 'Ringing',
      'switched_off': 'Switched Off',
      'call_busy': 'Call Busy',
      'call_disconnected': 'Call Disconnected',
      'invalid_number': 'Invalid Number',

      // Interested
      'site_visit_scheduled_with_date': 'Site Visit Scheduled (With Date)',
      'site_visit_scheduled_no_date': 'Site Visit Scheduled (No Date)',
      'follow_up': 'Follow Up',

      // Not Interested
      'not_actively_searching': 'Not Actively Searching',
      'require_more_than_6_months': 'Require More Than 6 Months',
      'not_the_right_party': 'Not The Right Party',

      // Call Disconnected
      'hang_up_while_talking': 'Hang Up While Talking',
      'call_drop': 'Call Drop',

      // Location Mismatch
      'looking_for_other_location': 'Looking For Other Location',
      'looking_for_other_city': 'Looking For Other City',

      // Budget Mismatch
      'budget_is_low': 'Budget Is Low',
      'budget_is_high': 'Budget Is High',

      // Possession Mismatch
      'looking_for_ready_to_move': 'Looking For Ready To Move',
      'looking_for_under_construction': 'Looking For Under Construction',

      // Do Not Disturb
      'already_in_touch_with_builder': 'Already In Touch With Builder',
      'deal_closed': 'Deal Closed',
      'plan_drop': 'Plan Drop',
      'plan_postponed': 'Plan Postponed',
      'already_purchased': 'Already Purchased',
      'dnc': 'DNC',

      // Site Visit Done
      'interested_in_revisit': 'Interested In Re-visit',
      'plan_cancelled': 'Plan Cancelled'
    };

    return substatusDisplayNames[substatus] || substatus;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CRMPropertyCard = ({ property, isNearby = false }) => (
    <PropertyCard 
      property={property} 
      viewMode="grid"
      customBadges={[
        ...(isNearby ? [{ text: 'Nearby', color: 'blue' }] : []),
        ...(property.gallery?.length > 0 ? [{ text: `📸 ${property.gallery.length}`, color: 'black' }] : []),
        ...(property.videos?.length > 0 ? [{ text: `🎬 ${property.videos.length}`, color: 'purple' }] : [])
      ]}
      showContact={true}
      showActions={true}
      actionButtons={[
        {
          text: 'View Details',
          href: `/admin/crm/property/${property._id}`,
          color: 'red',
          fullWidth: true
        },
        {
          text: '📞',
          href: `tel:${property.contactNumber}`,
          color: 'green',
          icon: true,
          title: 'Call property owner'
        }
      ]}
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#D7242A]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#D7242A]/5 border border-[#D7242A]/20 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-[#D7242A] mb-2">Error Loading Lead</h2>
            <p className="text-[#D7242A]/80">{error || 'Lead not found'}</p>
            <div className="mt-4 space-x-4">
              <button 
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              {error && (
                <button 
                  onClick={fetchLeadDetails}
                  className="px-4 py-2 bg-[#D7242A] text-white rounded-lg hover:bg-[#D7242A]/90 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentLeadIndex = () => {
    return allLeads.findIndex(l => l._id === params.id);
  };

  const getCurrentLeadActualPosition = () => {
    const currentPage = parseInt(urlParams.page || '1');
    const indexInCurrentPage = getCurrentLeadIndex();
    if (indexInCurrentPage === -1) return 0;
    return ((currentPage - 1) * 30) + indexInCurrentPage + 1;
  };

  const navigateToLead = (leadId) => {
    // Preserve URL params when navigating to next/previous lead
    const queryParams = new URLSearchParams({
      sortBy: urlParams.sortBy || 'createdAt',
      sortOrder: urlParams.sortOrder || 'desc',
      page: urlParams.page || '1',
      ...(urlParams.search && { search: urlParams.search }),
      ...(urlParams.status && { status: urlParams.status }),
      ...(urlParams.dateFrom && { dateFrom: urlParams.dateFrom }),
      ...(urlParams.dateTo && { dateTo: urlParams.dateTo })
    });
    router.push(`/admin/crm/leads/${leadId}?${queryParams.toString()}`);
  };

  const getNextLead = () => {
    const currentIndex = getCurrentLeadIndex();
    if (currentIndex < allLeads.length - 1) {
      return allLeads[currentIndex + 1];
    }
    return null;
  };

  const getPreviousLead = () => {
    const currentIndex = getCurrentLeadIndex();
    if (currentIndex > 0) {
      return allLeads[currentIndex - 1];
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Leads Navigation Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="bg-[#D7242A] text-white px-4 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Current Page Leads ({allLeads.length})</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-white/80 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-white/90 text-sm mt-1">Showing leads from current page • {totalLeadsCount} total</p>
          </div>

          {/* Leads List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {allLeads.map((leadItem) => {
                const isActive = leadItem._id === params.id;
                const isVisited = visitedLeads.has(leadItem._id);
                return (
                  <div
                    key={leadItem._id}
                    onClick={() => {
                      navigateToLead(leadItem._id);
                      setSidebarOpen(false);
                    }}
                    className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#D7242A]/10 border-l-4 border-[#D7242A] text-[#D7242A]'
                        : isVisited
                        ? 'bg-green-50 hover:bg-green-100 border-l-4 border-green-400'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-[#D7242A]/20' : 'bg-gray-200'
                      }`}>
                        <span className={`text-xs font-medium ${
                          isActive ? 'text-[#D7242A]' : 'text-gray-600'
                        }`}>
                          {leadItem.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          isActive ? 'text-[#D7242A]' : 'text-gray-900'
                        }`}>
                          {leadItem.name}
                        </div>
                        <div className={`text-xs truncate ${
                          isActive ? 'text-[#D7242A]' : 'text-gray-500'
                        }`}>
                          {leadItem.phone} • {getLocationDisplayName(leadItem.interestedLocation)}
                        </div>
                        <div className={`text-xs ${
                          isActive ? 'text-[#D7242A]/80' : 'text-gray-400'
                        }`}>
                          {formatDate(leadItem.createdAt).split(',')[0]}
                        </div>
                      </div>
                      {isActive && (
                        <div className="flex-shrink-0">
                          <svg className="w-4 h-4 text-[#D7242A]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Lead {getCurrentLeadActualPosition()} of {totalLeadsCount}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const prev = getPreviousLead();
                    if (prev) {
                      navigateToLead(prev._id);
                      setSidebarOpen(false);
                    }
                  }}
                  disabled={!getPreviousLead()}
                  className="p-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const next = getNextLead();
                    if (next) {
                      navigateToLead(next._id);
                      setSidebarOpen(false);
                    }
                  }}
                  disabled={!getNextLead()}
                  className="p-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 min-w-0">
              {/* Leads Navigation Toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-[#D7242A] hover:text-[#D7242A]/80 p-1 rounded-md hover:bg-[#D7242A]/5 transition-colors flex-shrink-0"
                title="Browse All Leads"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link
                href={`/admin/crm/leads?${new URLSearchParams({
                  sortBy: urlParams.sortBy || 'createdAt',
                  sortOrder: urlParams.sortOrder || 'desc',
                  page: urlParams.page || '1',
                  ...(urlParams.search && { search: urlParams.search }),
                  ...(urlParams.status && urlParams.status !== 'all' && { status: urlParams.status }),
                  ...(urlParams.dateFrom && { dateFrom: urlParams.dateFrom }),
                  ...(urlParams.dateTo && { dateTo: urlParams.dateTo })
                }).toString()}`}
                className="text-[#D7242A] hover:text-[#D7242A]/80 flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Lead Details</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
                  ID: {lead._id.slice(-8)} • {getCurrentLeadActualPosition()} of {totalLeadsCount} leads
                </p>
              </div>
            </div>
            
            {/* Quick Navigation */}
            <div className="flex items-center space-x-2">
              {allLeads.length > 0 ? (
                <>
                  <button
                    onClick={() => {
                      const prev = getPreviousLead();
                      if (prev) navigateToLead(prev._id);
                    }}
                    disabled={!getPreviousLead()}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm border border-gray-200"
                    title={getPreviousLead() ? `Previous: ${getPreviousLead().name}` : 'No previous lead'}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  <button
                    onClick={() => {
                      const next = getNextLead();
                      if (next) navigateToLead(next._id);
                    }}
                    disabled={!getNextLead()}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#D7242A] rounded-md hover:bg-[#D7242A]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    title={getNextLead() ? `Next: ${getNextLead().name}` : 'No more leads'}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <svg className="w-4 h-4 sm:ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Lead Position Indicator */}
                  <div className="ml-2 px-2 sm:px-3 py-2 bg-[#D7242A]/5 text-[#D7242A] rounded-md text-xs sm:text-sm font-medium border border-[#D7242A]/20 whitespace-nowrap">
                    {getCurrentLeadActualPosition()} / {totalLeadsCount}
                  </div>
                </>
              ) : (
                <div className="px-3 py-2 bg-gray-100 text-gray-500 rounded-md text-sm">
                  Loading leads...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Lead Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="h-20 w-20 rounded-full bg-[#D7242A]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#D7242A] font-bold text-xl">
                    {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{lead.name}</h2>
                <p className="text-gray-600">Lead ID: {lead._id.slice(-8)}</p>
                <p className="text-sm mt-1">
                  {lead.assignedTo ? (
                    <span className="text-green-600 font-medium">Assigned to: {lead.assignedTo.name}</span>
                  ) : (
                    <span className="text-orange-600 font-medium">Not Assigned</span>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a href={`tel:${lead.phone}`} className="font-medium text-[#D7242A] hover:text-[#D7242A]/80">
                      {lead.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                {lead.email && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a href={`mailto:${lead.email}`} className="font-medium text-[#D7242A] hover:text-[#D7242A]/80">
                        {lead.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Interested Location */}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Interested Location</p>
                    <p className="font-medium text-gray-900">
                      {getLocationDisplayName(lead.interestedLocation)}
                    </p>
                  </div>
                </div>

                {/* Date Added */}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Date Added</p>
                    <p className="font-medium text-gray-900">{formatDate(lead.createdAt)}</p>
                  </div>
                </div>

                {/* Source */}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Source</p>
                    <p className="font-medium text-gray-900 capitalize">{lead.source || 'Website'}</p>
                  </div>
                </div>

                {/* Lead Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex flex-col gap-1 ">
                        <span className={` inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status || 'new')}`}>
                          {formatStatusText(lead.status || 'new')}
                        </span>
                        {lead.substatus && (
                          <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">
                            {formatSubstatusText(lead.substatus)}
                          </span>
                        )}
                        {lead.siteVisitDate && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            Site Visit: {new Date(lead.siteVisitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {lead.followUpDate && (
                          <span className="text-xs text-cyan-600 bg-cyan-100 px-2 py-0.5 rounded-full">
                            Follow-up: {new Date(lead.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUpdateStatus('');
                      setUpdateSubstatus('');
                      setUpdateNote('');
                      setSiteVisitDate('');
                      setUpdateError('');
                      setShowUpdateModal(true);
                    }}
                    className="text-[#D7242A] hover:text-[#D7242A]/80 p-1 rounded-md hover:bg-[#D7242A]/5 transition-colors"
                    title="Update Status"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Activity Section (Follow-ups, Site Visits, Notes) */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Lead Activity
                </h4>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {/* Current Follow-up */}
                  {lead.followUpDate && (
                    <div className="border-l-2 border-cyan-400 pl-3 py-2 bg-cyan-50/50 rounded-r">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 text-cyan-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="text-sm font-semibold text-cyan-800">Next Follow-up</div>
                      </div>
                      <div className="text-sm text-cyan-700">
                        📅 {new Date(lead.followUpDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}

                  {/* Follow-up History */}
                  {lead.followUpHistory && lead.followUpHistory.length > 0 && (
                    <div className="border-l-2 border-gray-300 pl-3 py-2 bg-gray-50/50 rounded-r">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Follow-up History ({lead.followUpHistory.length})</div>
                      <div className="space-y-2">
                        {lead.followUpHistory.slice().reverse().map((followUp, index) => (
                          <div key={index} className="text-xs p-2 bg-white border border-gray-200 rounded">
                            <div className="font-medium text-gray-700">
                              📅 {new Date(followUp.scheduledDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            {followUp.notes && (
                              <div className="text-gray-600 mt-1">{followUp.notes}</div>
                            )}
                            <div className="text-gray-400 mt-1">
                              {followUp.completed ? '✓ Completed' : 'Scheduled'} • {formatDate(followUp.addedAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Site Visit */}
                  {lead.siteVisitDate && (
                    <div className="border-l-2 border-blue-400 pl-3 py-2 bg-blue-50/50 rounded-r">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <div className="text-sm font-semibold text-blue-800">Next Site Visit</div>
                      </div>
                      <div className="text-sm text-blue-700">
                        🏠 {new Date(lead.siteVisitDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}

                  {/* Visit History */}
                  {lead.visitHistory && lead.visitHistory.length > 0 && (
                    <div className="border-l-2 border-gray-300 pl-3 py-2 bg-gray-50/50 rounded-r">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Site Visit History ({lead.visitHistory.length})</div>
                      <div className="space-y-2">
                        {lead.visitHistory.slice().reverse().map((visit, index) => (
                          <div key={index} className="text-xs p-2 bg-white border border-gray-200 rounded">
                            <div className="font-medium text-gray-700">
                              🏠 {new Date(visit.scheduledDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            {visit.reason && (
                              <div className="text-gray-600 mt-1">{visit.reason}</div>
                            )}
                            {visit.rescheduleReason && (
                              <div className="text-orange-600 mt-1">Reschedule reason: {visit.rescheduleReason}</div>
                            )}
                            <div className="text-gray-400 mt-1">
                              {visit.type === 'completed' ? '✓ Completed' : visit.type === 'rescheduled' ? '↻ Rescheduled' : visit.type === 'cancelled' ? '✗ Cancelled' : 'Scheduled'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {lead.notes && lead.notes.length > 0 ? (
                    <>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide pt-2">
                        Notes ({lead.notes.length})
                      </div>
                      {lead.notes.slice().reverse().map((note, index) => (
                        <div key={index} className="border-l-2 border-indigo-200 pl-3 py-2 bg-indigo-50/50 rounded-r">
                          <div className="text-sm text-gray-700 mb-1">{note.content}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(note.addedAt)} • {note.addedBy}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : !lead.followUpDate && !lead.siteVisitDate ? (
                    <div className="text-center py-4 text-gray-500">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">No activity yet</p>
                      <p className="text-xs text-gray-400 mt-1">Add notes, schedule follow-ups or site visits</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* CRM Action Buttons */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setShowUpdateModal(true)}
                    className="flex items-center justify-center px-4 py-2 bg-[#D7242A] text-white rounded-lg hover:bg-[#D7242A]/90 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Status & Add Note
                  </button>
                  <a 
                    href={`tel:${lead.phone}`}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call Now
                  </a>
                  {lead.email && (
                    <a 
                      href={`mailto:${lead.email}?subject=Property Inquiry - ${getLocationDisplayName(lead.interestedLocation)}&body=Hello ${lead.name},%0A%0AI hope this email finds you well. I'm reaching out regarding your interest in properties in ${getLocationDisplayName(lead.interestedLocation)}.%0A%0ABest regards`}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Email
                    </a>
                  )}
                </div>
              </div>
              
              {/* Navigation Helper */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Navigation</h4>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-[#D7242A]/5 text-[#D7242A] rounded-lg hover:bg-[#D7242A]/10 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Browse Page Leads ({allLeads.length})
                </button>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => {
                      const prev = getPreviousLead();
                      if (prev) navigateToLead(prev._id);
                    }}
                    disabled={!getPreviousLead()}
                    className="flex items-center justify-center px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      const next = getNextLead();
                      if (next) navigateToLead(next._id);
                    }}
                    disabled={!getNextLead()}
                    className="flex items-center justify-center px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {getPreviousLead() && (
                  <div className="text-xs text-gray-500 mt-2">
                    ← Previous: {getPreviousLead().name}
                  </div>
                )}
                {getNextLead() && (
                  <div className="text-xs text-gray-500 mt-1">
                    Next: {getNextLead().name} →
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Related Properties */}
          <div className="lg:col-span-2">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-[#D7242A]">{relatedProperties.length}</div>
                <div className="text-sm text-gray-600">Exact Location Matches</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-[#D7242A]">{nearbyProperties.length}</div>
                <div className="text-sm text-gray-600">Nearby Area Matches</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Property Suggestions for {lead.name}
              </h3>
              
              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('exact')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'exact'
                      ? 'bg-white text-[#D7242A] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Exact Location ({relatedProperties.length})
                </button>
                <button
                  onClick={() => setActiveTab('nearby')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'nearby'
                      ? 'bg-white text-[#D7242A] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Nearby Locations ({nearbyProperties.length})
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'search'
                      ? 'bg-white text-orange-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Properties ({searchResults.length})
                </button>
              </div>

              {/* Property Lists */}
              {activeTab === 'exact' && (
                <div>
                  {relatedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {relatedProperties.map(property => (
                    <CRMPropertyCard key={property._id} property={property} />
                  ))}
                </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 012-2h2a2 2 0 012 2v12M13 7a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h4>
                      <p className="text-gray-600">No properties found in {getLocationDisplayName(lead.interestedLocation)}.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'nearby' && (
                <div>
                  {nearbyProperties.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {nearbyProperties.map(property => (
                        <CRMPropertyCard key={property._id} property={property} isNearby={true} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 012-2h2a2 2 0 012 2v12M13 7a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Nearby Properties Found</h4>
                      <p className="text-gray-600">No properties found in nearby locations.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'search' && (
                <div>
                  {/* Search Filters */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      Property Search Filters
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4 text-black">
                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={searchFilters.location}
                          onChange={(e) => handleSearchInputChange('location', e.target.value)}
                          placeholder="Enter any location"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                        />
                      </div>

                      {/* Property Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                        <select
                          value={searchFilters.type}
                          onChange={(e) => handleSearchInputChange('type', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                        >
                          <option value="">Any Type</option>
                          <option value="flat">Flat</option>
                          <option value="house">House</option>
                          <option value="land">Land</option>
                          <option value="office">Office</option>
                        </select>
                      </div>

                      {/* Mode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                        <select
                          value={searchFilters.mode}
                          onChange={(e) => handleSearchInputChange('mode', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                        >
                          <option value="">Any Mode</option>
                          <option value="buy">Buy</option>
                          <option value="rent">Rent</option>
                          <option value="sell">Sell</option>
                        </select>
                      </div>

                      {/* BHK */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BHK</label>
                        <select
                          value={searchFilters.bhk}
                          onChange={(e) => handleSearchInputChange('bhk', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                        >
                          <option value="">Any BHK</option>
                          <option value="1bhk">1 BHK</option>
                          <option value="2bhk">2 BHK</option>
                          <option value="3bhk">3 BHK</option>
                          <option value="4bhk">4 BHK</option>
                          <option value="5bhk">5+ BHK</option>
                        </select>
                      </div>

                      {/* Price Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                        <input
                          type="number"
                          value={searchFilters.minPrice}
                          onChange={(e) => handleSearchInputChange('minPrice', e.target.value)}
                          placeholder="Minimum price"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                        <input
                          type="number"
                          value={searchFilters.maxPrice}
                          onChange={(e) => handleSearchInputChange('maxPrice', e.target.value)}
                          placeholder="Maximum price"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Search Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={searchProperties}
                        disabled={searchLoading}
                        className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {searchLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Searching...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span>Search Properties</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={clearSearch}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Search Results */}
                  <div>
                    {searchResults.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Search Results ({searchResults.length} properties)
                          </h4>
                          <div className="text-sm text-gray-600">
                            Expand your lead's options with these alternatives
                          </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                          {searchResults.map(property => (
                            <CRMPropertyCard key={property._id} property={property} isNearby={false} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        {searchLoading ? (
                          <div>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D7242A] mx-auto mb-4"></div>
                            <p className="text-gray-600">Searching properties...</p>
                          </div>
                        ) : (
                          <div>
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Search for Properties</h4>
                            <p className="text-gray-600 mb-4">Use the filters above to find alternative properties for your lead</p>
                            <p className="text-sm text-orange-600">💡 Try searching by different locations, property types, or price ranges</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Update Status & Add Note Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="bg-[#D7242A] text-white py-4 px-6 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Lead
                  </h2>
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      setUpdateError('');
                      setUpdateStatus('');
                      setUpdateNote('');
                    }}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {updateError && (
                <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {updateError}
                  </div>
                </div>
              )}

              <form onSubmit={handleUpdateLead} className="p-6 space-y-4 text-black">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Update Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#D7242A] focus:border-[#D7242A] shadow-sm"
                  >
                    <option value="">-- Select Status --</option>
                    {Object.keys(statusOptions).map((status) => (
                      <option key={status} value={status}>
                        {formatStatusText(status)}
                      </option>
                    ))}
                  </select>
                  {updateStatus && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(updateStatus)}`}>
                        {formatStatusText(updateStatus)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Substatus Field */}
                {updateStatus && availableSubstatuses.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Substatus <span className="text-gray-500">(Optional)</span>
                    </label>
                    <select
                      value={updateSubstatus}
                      onChange={(e) => setUpdateSubstatus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#D7242A] focus:border-[#D7242A] shadow-sm"
                    >
                      <option value="">-- Select Substatus --</option>
                      {availableSubstatuses.map((substatus) => (
                        <option key={substatus} value={substatus}>
                          {formatSubstatusText(substatus)}
                        </option>
                      ))}
                    </select>
                    {updateSubstatus && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">
                          {formatSubstatusText(updateSubstatus)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Site Visit Scheduled Fields */}
                {updateStatus === 'site_visit_scheduled' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Site Visit Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={siteVisitDate}
                        onChange={(e) => setSiteVisitDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#D7242A] focus:border-[#D7242A] shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visit Reason/Notes <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={visitReason}
                        onChange={(e) => setVisitReason(e.target.value)}
                        rows="2"
                        placeholder="e.g., Customer wants to see 2BHK properties, interested in amenities..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#D7242A] focus:border-[#D7242A] shadow-sm"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Follow-up Scheduled Fields */}
                {updateStatus === 'follow_up_scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Follow-up Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#D7242A] focus:border-[#D7242A] shadow-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can add notes below using the "Add Note" field
                    </p>
                  </div>
                )}

                {/* Visit Rescheduled Fields */}
                {updateStatus === 'visit_rescheduled' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Visit Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={siteVisitDate}
                        onChange={(e) => setSiteVisitDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#D7242A] focus:border-[#D7242A] shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Why was the visit rescheduled? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rescheduleReason}
                        onChange={(e) => setRescheduleReason(e.target.value)}
                        rows="2"
                        placeholder="e.g., Customer was busy, bad weather, personal emergency..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#D7242A] focus:border-[#D7242A] shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        value={visitReason}
                        onChange={(e) => setVisitReason(e.target.value)}
                        rows="2"
                        placeholder="Any additional information about the rescheduled visit..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#D7242A] focus:border-[#D7242A] shadow-sm"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Note
                  </label>
                  <textarea
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                    rows="4"
                    placeholder="Add a note about this lead (optional)"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#D7242A] focus:border-[#D7242A] shadow-sm resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpdateModal(false);
                      setUpdateError('');
                      setUpdateStatus('');
                      setUpdateSubstatus('');
                      setUpdateNote('');
                      setSiteVisitDate('');
                      setFollowUpDate('');
                      setVisitReason('');
                      setRescheduleReason('');
                      setFollowUpNotes('');
                    }}
                    disabled={isUpdating}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating || (!updateStatus && !updateNote.trim()) ||
                      (updateStatus === 'site_visit_scheduled' && (!siteVisitDate || !visitReason)) ||
                      (updateStatus === 'follow_up_scheduled' && !followUpDate) ||
                      (updateStatus === 'visit_rescheduled' && (!siteVisitDate || !rescheduleReason))}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#D7242A] rounded-md hover:bg-[#D7242A]/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Update Lead</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}