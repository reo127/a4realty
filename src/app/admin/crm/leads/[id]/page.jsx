'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
  CalendarCheck,
  Edit3,
  ExternalLink,
  Layers,
  Sparkles,
  Share2,
  CheckCircle2,
  UserCheck,
  Building2,
  Compass,
  Search,
  X,
  RotateCcw,
  Check,
  FileText,
  SlidersHorizontal,
  AlertCircle,
  Filter
} from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import AssignmentHistory from '@/components/AssignmentHistory';
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
    } finally {
      setLoading(false);
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
      <div className={`fixed inset-y-0 left-0 z-50 w-88 max-w-[85vw] bg-white shadow-2xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="bg-[#0B0F19] text-white p-5 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D7242A] flex items-center justify-center text-white shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Active Page Queue</h3>
                  <p className="text-[11px] text-slate-400">
                    {allLeads.length} leads loaded • {totalLeadsCount} total
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Leads List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-slate-100">
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
                  className={`pt-2 first:pt-0 p-3 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-rose-50/70 border border-[#D7242A]/30 text-slate-900 shadow-2xs'
                      : isVisited
                      ? 'bg-slate-50/60 hover:bg-slate-100/80 border border-transparent text-slate-700'
                      : 'hover:bg-slate-50 border border-transparent text-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs ${
                      isActive ? 'bg-[#D7242A] text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {leadItem.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className={`text-xs font-bold truncate ${
                          isActive ? 'text-[#D7242A]' : 'text-slate-900'
                        }`}>
                          {leadItem.name}
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#D7242A] animate-pulse"></span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{getLocationDisplayName(leadItem.interestedLocation)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>{leadItem.phone}</span>
                        <span>{formatDate(leadItem.createdAt).split(',')[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Lead {getCurrentLeadActualPosition()} of {totalLeadsCount}</span>
              <div className="flex space-x-1.5">
                <button
                  onClick={() => {
                    const prev = getPreviousLead();
                    if (prev) {
                      navigateToLead(prev._id);
                      setSidebarOpen(false);
                    }
                  }}
                  disabled={!getPreviousLead()}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
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
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sticky Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 md:top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              {/* Back to CRM */}
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
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center flex-shrink-0"
                title="Back to Leads CRM"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              {/* Leads Navigation Drawer Toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl bg-[#D7242A]/10 text-[#D7242A] hover:bg-[#D7242A]/15 transition-colors flex items-center gap-1.5 text-xs font-bold flex-shrink-0"
                title="Browse All Page Leads"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Lead Queue</span>
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                    {lead.name}
                  </h1>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    #{lead._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Client Dossier • Position {getCurrentLeadActualPosition()} of {totalLeadsCount} active leads
                </p>
              </div>
            </div>
            
            {/* Quick Next/Prev Navigation */}
            <div className="flex items-center space-x-2">
              {allLeads.length > 0 ? (
                <>
                  <button
                    onClick={() => {
                      const prev = getPreviousLead();
                      if (prev) navigateToLead(prev._id);
                    }}
                    disabled={!getPreviousLead()}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
                    title={getPreviousLead() ? `Previous: ${getPreviousLead().name}` : 'No previous lead'}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <button
                    onClick={() => {
                      const next = getNextLead();
                      if (next) navigateToLead(next._id);
                    }}
                    disabled={!getNextLead()}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-[#D7242A] hover:bg-[#b5191f] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shadow-[#D7242A]/20"
                    title={getNextLead() ? `Next: ${getNextLead().name}` : 'No more leads'}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Lead Position Indicator */}
                  <div className="ml-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold tabular-nums border border-slate-200">
                    {getCurrentLeadActualPosition()} / {totalLeadsCount}
                  </div>
                </>
              ) : (
                <div className="px-3 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-medium">
                  Loading queue...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Client Dossier */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sticky top-24 space-y-6">
              {/* Client Profile Header */}
              <div className="text-center pb-6 border-b border-slate-100">
                <div className="relative inline-block mb-3">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D7242A]/15 via-[#D7242A]/5 to-slate-100 border-2 border-[#D7242A]/25 flex items-center justify-center mx-auto shadow-inner">
                    <span className="text-[#D7242A] font-black text-2xl tracking-tight">
                      {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px]">
                    ✓
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{lead.name}</h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  LEAD REF #{lead._id.slice(-8).toUpperCase()}
                </p>

                <div className="mt-2.5">
                  {lead.assignedTo ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Assigned to {lead.assignedTo.name}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80 animate-pulse">
                      <span>Unassigned Prospect</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Direct Communication Bar */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${lead.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Now</span>
                </a>
                <a
                  href={`https://wa.me/91${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${lead.name}, I am reaching out from A4 Realty regarding your property interest in ${getLocationDisplayName(lead.interestedLocation)}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Client Profile Details */}
              <div className="space-y-2.5 text-xs">
                {/* Phone */}
                <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5 text-slate-500">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>Mobile Phone</span>
                  </div>
                  <a href={`tel:${lead.phone}`} className="font-bold text-slate-900 hover:text-[#D7242A] font-mono tabular-nums">
                    {lead.phone}
                  </a>
                </div>

                {/* Email */}
                {lead.email && (
                  <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>Email</span>
                    </div>
                    <a href={`mailto:${lead.email}`} className="font-semibold text-slate-800 hover:text-[#D7242A] truncate max-w-[180px]">
                      {lead.email}
                    </a>
                  </div>
                )}

                {/* Target Location */}
                <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5 text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Location</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {getLocationDisplayName(lead.interestedLocation)}
                  </span>
                </div>

                {/* Date Added */}
                <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5 text-slate-500">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Inquiry Date</span>
                  </div>
                  <span className="font-medium text-slate-700 tabular-nums">
                    {formatDate(lead.createdAt).split(',')[0]}
                  </span>
                </div>

                {/* Acquisition Source */}
                <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5 text-slate-500">
                    <Sparkles className="w-4 h-4 text-slate-400" />
                    <span>Source</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                    {lead.source || 'Website'}
                  </span>
                </div>

                {/* Current Stage Status Box */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Current Stage
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(lead.status || 'new')}`}>
                        {formatStatusText(lead.status || 'new')}
                      </span>
                      {lead.substatus && (
                        <span className="text-[11px] text-slate-600 font-medium">
                          {formatSubstatusText(lead.substatus)}
                        </span>
                      )}
                      {lead.siteVisitDate && (
                        <span className="text-[11px] font-bold text-violet-700 bg-violet-100/70 px-2 py-0.5 rounded-md">
                          Visit: {new Date(lead.siteVisitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {lead.followUpDate && (
                        <span className="text-[11px] font-bold text-cyan-700 bg-cyan-100/70 px-2 py-0.5 rounded-md">
                          Follow-up: {new Date(lead.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
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
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
                    title="Update Stage or Add Note"
                  >
                    <Edit3 className="w-4 h-4 text-[#D7242A]" />
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => {
                  setUpdateStatus('');
                  setUpdateSubstatus('');
                  setUpdateNote('');
                  setSiteVisitDate('');
                  setUpdateError('');
                  setShowUpdateModal(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#D7242A] to-[#B01A20] hover:from-[#e0292f] hover:to-[#99151A] text-white text-xs font-bold shadow-md shadow-[#D7242A]/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Update Status &amp; Add Note</span>
              </button>

              {/* Activity Section (Follow-ups, Site Visits, Notes) */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Activity &amp; Engagement
                  </h4>
                  <span className="text-[10px] text-slate-400">Chronological</span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {/* Current Follow-up */}
                  {lead.followUpDate && (
                    <div className="border-l-2 border-cyan-500 pl-3 py-2 bg-cyan-50/60 rounded-r-xl">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-800 mb-0.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Next Scheduled Follow-up</span>
                      </div>
                      <div className="text-xs text-cyan-900 font-medium">
                        {new Date(lead.followUpDate).toLocaleDateString('en-IN', {
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
                    <div className="border-l-2 border-slate-300 pl-3 py-2 bg-slate-50 rounded-r-xl">
                      <div className="text-xs font-bold text-slate-700 mb-2">Follow-up History ({lead.followUpHistory.length})</div>
                      <div className="space-y-2">
                        {lead.followUpHistory.slice().reverse().map((followUp, index) => (
                          <div key={index} className="text-xs p-2.5 bg-white border border-slate-200/80 rounded-lg shadow-2xs">
                            <div className="font-semibold text-slate-800">
                              {new Date(followUp.scheduledDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            {followUp.notes && (
                              <div className="text-slate-600 mt-1">{followUp.notes}</div>
                            )}
                            <div className="text-[10px] text-slate-400 mt-1 font-medium">
                              {followUp.completed ? '✓ Completed' : 'Scheduled'} • {formatDate(followUp.addedAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Site Visit */}
                  {lead.siteVisitDate && (
                    <div className="border-l-2 border-violet-500 pl-3 py-2 bg-violet-50/60 rounded-r-xl">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-violet-800 mb-0.5">
                        <CalendarCheck className="w-3.5 h-3.5 text-violet-600" />
                        <span>Next Site Tour</span>
                      </div>
                      <div className="text-xs text-violet-900 font-medium">
                        {new Date(lead.siteVisitDate).toLocaleDateString('en-IN', {
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
                    <div className="border-l-2 border-slate-300 pl-3 py-2 bg-slate-50 rounded-r-xl">
                      <div className="text-xs font-bold text-slate-700 mb-2">Site Tour History ({lead.visitHistory.length})</div>
                      <div className="space-y-2">
                        {lead.visitHistory.slice().reverse().map((visit, index) => (
                          <div key={index} className="text-xs p-2.5 bg-white border border-slate-200/80 rounded-lg shadow-2xs">
                            <div className="font-semibold text-slate-800">
                              {new Date(visit.scheduledDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            {visit.reason && (
                              <div className="text-slate-600 mt-1">{visit.reason}</div>
                            )}
                            {visit.rescheduleReason && (
                              <div className="text-amber-600 mt-1">Rescheduled: {visit.rescheduleReason}</div>
                            )}
                            <div className="text-[10px] text-slate-400 mt-1 font-medium">
                              {visit.type === 'completed' ? '✓ Completed' : visit.type === 'rescheduled' ? '↻ Rescheduled' : visit.type === 'cancelled' ? '✗ Cancelled' : 'Scheduled'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {lead.notes && lead.notes.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Conversation Notes ({lead.notes.length})
                      </div>
                      {lead.notes.slice().reverse().map((note, index) => (
                        <div key={index} className="border-l-2 border-[#D7242A]/40 pl-3 py-2 bg-slate-50 rounded-r-xl">
                          <p className="text-xs text-slate-800 font-medium leading-relaxed">{note.content}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {formatDate(note.addedAt)} • {note.addedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : !lead.followUpDate && !lead.siteVisitDate ? (
                    <div className="text-center py-6 text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-1.5 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">No activity logged yet</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Log notes or schedule tours above</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Assignment History */}
              {lead.assignmentHistory && lead.assignmentHistory.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <AssignmentHistory history={lead.assignmentHistory} />
                </div>
              )}
              
              {/* Navigation Helper */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Queue Navigation</span>
                  <span className="text-xs font-semibold text-slate-500">
                    Lead {getCurrentLeadActualPosition()} of {totalLeadsCount}
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-xs text-xs font-semibold group cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  <span>Browse Page Lead Queue ({allLeads.length})</span>
                </button>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => {
                      const prev = getPreviousLead();
                      if (prev) navigateToLead(prev._id);
                    }}
                    disabled={!getPreviousLead()}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={() => {
                      const next = getNextLead();
                      if (next) navigateToLead(next._id);
                    }}
                    disabled={!getNextLead()}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {(getPreviousLead() || getNextLead()) && (
                  <div className="mt-2.5 space-y-1 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    {getPreviousLead() && (
                      <div className="truncate flex items-center gap-1">
                        <span className="text-slate-400">Prev:</span>
                        <span className="font-medium text-slate-700 truncate">{getPreviousLead().name}</span>
                      </div>
                    )}
                    {getNextLead() && (
                      <div className="truncate flex items-center gap-1">
                        <span className="text-slate-400">Next:</span>
                        <span className="font-medium text-slate-700 truncate">{getNextLead().name}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Portfolio Matchmaker */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Direct Location Match</div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{relatedProperties.length}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Matched in {getLocationDisplayName(lead.interestedLocation)}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#D7242A]">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Adjacent Micro-Markets</div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{nearbyProperties.length}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    In neighboring zones & corridors
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Compass className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D7242A] uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Portfolio Matchmaker
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Matched Inventory for {lead.name}
                  </h3>
                </div>
                <div className="text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70 inline-flex items-center gap-2">
                  <span>Type: <strong className="text-slate-800 capitalize">{lead.preferredPropertyType || 'Any'}</strong></span>
                  <span>•</span>
                  <span>BHK: <strong className="text-slate-800">{lead.preferredBhk ? lead.preferredBhk.toUpperCase() : 'Any'}</strong></span>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-6 gap-1">
                <button
                  onClick={() => setActiveTab('exact')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'exact'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${activeTab === 'exact' ? 'text-[#D7242A]' : 'text-slate-400'}`} />
                  <span>Exact Location</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'exact' ? 'bg-[#D7242A]/10 text-[#D7242A]' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {relatedProperties.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('nearby')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'nearby'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Compass className={`w-3.5 h-3.5 ${activeTab === 'nearby' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>Nearby Locations</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'nearby' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {nearbyProperties.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'search'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search className={`w-3.5 h-3.5 ${activeTab === 'search' ? 'text-[#D7242A]' : 'text-slate-400'}`} />
                  <span>Custom Search</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'search' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {searchResults.length}
                  </span>
                </button>
              </div>

              {/* Property Lists */}
              {activeTab === 'exact' && (
                <div>
                  {relatedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                      {relatedProperties.map(property => (
                        <CRMPropertyCard key={property._id} property={property} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-14 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">No Direct Matches</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        No properties currently listed in {getLocationDisplayName(lead.interestedLocation)}.
                      </p>
                      <button
                        onClick={() => setActiveTab('nearby')}
                        className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#D7242A] hover:underline cursor-pointer"
                      >
                        <span>Check neighboring corridors ({nearbyProperties.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'nearby' && (
                <div>
                  {nearbyProperties.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                      {nearbyProperties.map(property => (
                        <CRMPropertyCard key={property._id} property={property} isNearby={true} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-14 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                        <Compass className="w-6 h-6 text-slate-400" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">No Nearby Properties</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        No listings found in adjacent micro-markets matching this lead's criteria.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'search' && (
                <div>
                  {/* Search Filters */}
                  <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 mb-6 shadow-2xs">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#D7242A]" />
                        Inventory Filter Console
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">Fine-tune recommendations</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 mb-4 text-slate-800">
                      {/* Location */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Location</label>
                        <input
                          type="text"
                          value={searchFilters.location}
                          onChange={(e) => handleSearchInputChange('location', e.target.value)}
                          placeholder="e.g. Whitefield, Indiranagar"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D7242A]/20 focus:border-[#D7242A] text-xs font-medium text-slate-900 placeholder:text-slate-400"
                        />
                      </div>

                      {/* Property Type */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Property Type</label>
                        <select
                          value={searchFilters.type}
                          onChange={(e) => handleSearchInputChange('type', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D7242A]/20 focus:border-[#D7242A] text-xs font-medium text-slate-900"
                        >
                          <option value="">Any Type</option>
                          <option value="flat">Flat / Apartment</option>
                          <option value="house">Independent House / Villa</option>
                          <option value="land">Plot / Land</option>
                          <option value="office">Commercial / Office</option>
                        </select>
                      </div>

                      {/* Mode */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mode</label>
                        <select
                          value={searchFilters.mode}
                          onChange={(e) => handleSearchInputChange('mode', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D7242A]/20 focus:border-[#D7242A] text-xs font-medium text-slate-900"
                        >
                          <option value="">Any Mode</option>
                          <option value="buy">For Sale / Buy</option>
                          <option value="rent">For Rent</option>
                          <option value="sell">Sell</option>
                        </select>
                      </div>

                      {/* BHK */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Configuration (BHK)</label>
                        <select
                          value={searchFilters.bhk}
                          onChange={(e) => handleSearchInputChange('bhk', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D7242A]/20 focus:border-[#D7242A] text-xs font-medium text-slate-900"
                        >
                          <option value="">Any Configuration</option>
                          <option value="1bhk">1 BHK</option>
                          <option value="2bhk">2 BHK</option>
                          <option value="3bhk">3 BHK</option>
                          <option value="4bhk">4 BHK</option>
                          <option value="5bhk">5+ BHK</option>
                        </select>
                      </div>

                      {/* Price Range */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Min Price (₹)</label>
                        <input
                          type="number"
                          value={searchFilters.minPrice}
                          onChange={(e) => handleSearchInputChange('minPrice', e.target.value)}
                          placeholder="Min budget"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D7242A]/20 focus:border-[#D7242A] text-xs font-medium text-slate-900 placeholder:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Max Price (₹)</label>
                        <input
                          type="number"
                          value={searchFilters.maxPrice}
                          onChange={(e) => handleSearchInputChange('maxPrice', e.target.value)}
                          placeholder="Max budget"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D7242A]/20 focus:border-[#D7242A] text-xs font-medium text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Search Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={searchProperties}
                        disabled={searchLoading}
                        className="px-5 py-2.5 bg-[#D7242A] text-white rounded-xl hover:bg-[#b51c22] transition-colors disabled:opacity-50 flex items-center gap-2 text-xs font-bold shadow-xs cursor-pointer"
                      >
                        {searchLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Searching Inventory...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-3.5 h-3.5" />
                            <span>Search Properties</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={clearSearch}
                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>

                  {/* Search Results */}
                  <div>
                    {searchResults.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-slate-900">
                            Search Results ({searchResults.length} properties)
                          </h4>
                          <div className="text-xs text-slate-500 font-medium">
                            Alternative inventory options
                          </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                          {searchResults.map(property => (
                            <CRMPropertyCard key={property._id} property={property} isNearby={false} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-14 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                        {searchLoading ? (
                          <div className="py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D7242A] border-t-transparent mx-auto mb-3"></div>
                            <p className="text-xs font-semibold text-slate-600">Querying real estate inventory...</p>
                          </div>
                        ) : (
                          <div>
                            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                              <Search className="w-6 h-6 text-slate-400" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">Search Available Portfolio</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-2">
                              Use the filter console above to match properties by location, type, or budget.
                            </p>
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#0B0F19] text-white p-5 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#D7242A] flex items-center justify-center text-white shadow-xs">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold tracking-tight">Update Lead Pipeline</h2>
                    <p className="text-xs text-slate-400">
                      Modifying dossier for <span className="text-slate-200 font-semibold">{lead.name}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                    setUpdateError('');
                    setUpdateStatus('');
                    setUpdateNote('');
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {updateError && (
              <div className="mx-6 mt-4 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateLead} className="p-6 space-y-4 text-slate-900">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Pipeline Stage / Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D7242A]/20 focus:border-[#D7242A] text-xs font-medium text-slate-900 shadow-2xs"
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
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(updateStatus)}`}>
                      {formatStatusText(updateStatus)}
                    </span>
                  </div>
                )}
              </div>

              {/* Substatus Field */}
              {updateStatus && availableSubstatuses.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Substatus <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <select
                    value={updateSubstatus}
                    onChange={(e) => setUpdateSubstatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D7242A]/20 focus:border-[#D7242A] text-xs font-medium text-slate-900 shadow-2xs"
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
                      <span className="text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md font-medium">
                        {formatSubstatusText(updateSubstatus)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Site Visit Scheduled Fields */}
              {updateStatus === 'site_visit_scheduled' && (
                <div className="space-y-3 p-3.5 bg-violet-50/60 rounded-xl border border-violet-100">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-violet-900 mb-1">
                      Site Visit Date & Time <span className="text-[#D7242A]">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={siteVisitDate}
                      onChange={(e) => setSiteVisitDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-400 text-xs font-medium text-slate-900 shadow-2xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-violet-900 mb-1">
                      Visit Reason / Tour Agenda <span className="text-[#D7242A]">*</span>
                    </label>
                    <textarea
                      value={visitReason}
                      onChange={(e) => setVisitReason(e.target.value)}
                      rows="2"
                      placeholder="e.g., Client requested inspection of 3BHK corner unit, amenities..."
                      className="w-full p-2.5 bg-white border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-400 text-xs font-medium text-slate-900 shadow-2xs"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Follow-up Scheduled Fields */}
              {updateStatus === 'follow_up_scheduled' && (
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Follow-up Date & Time <span className="text-[#D7242A]">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 text-xs font-medium text-slate-900 shadow-2xs"
                    required
                  />
                  <p className="text-[11px] text-amber-700 mt-1.5 font-medium">
                    Add conversation objectives in the notes box below
                  </p>
                </div>
              )}

              {/* Visit Rescheduled Fields */}
              {updateStatus === 'visit_rescheduled' && (
                <div className="space-y-3 p-3.5 bg-rose-50/60 rounded-xl border border-rose-100">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-900 mb-1">
                      New Visit Date & Time <span className="text-[#D7242A]">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={siteVisitDate}
                      onChange={(e) => setSiteVisitDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-[#D7242A]/20 text-xs font-medium text-slate-900 shadow-2xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-900 mb-1">
                      Reschedule Rationale <span className="text-[#D7242A]">*</span>
                    </label>
                    <textarea
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      rows="2"
                      placeholder="e.g., Client requested weekend slot due to travel..."
                      className="w-full p-2.5 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-[#D7242A]/20 text-xs font-medium text-slate-900 shadow-2xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={visitReason}
                      onChange={(e) => setVisitReason(e.target.value)}
                      rows="2"
                      placeholder="Any logistical or property details for the updated schedule..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D7242A]/20 text-xs font-medium text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Append CRM Log Note
                </label>
                <textarea
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  rows="3"
                  placeholder="Record summary of call, client preference shifts, next touchpoints..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D7242A]/20 focus:border-[#D7242A] text-xs font-medium text-slate-900 shadow-2xs resize-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
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
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || (!updateStatus && !updateNote.trim()) ||
                    (updateStatus === 'site_visit_scheduled' && (!siteVisitDate || !visitReason)) ||
                    (updateStatus === 'follow_up_scheduled' && !followUpDate) ||
                    (updateStatus === 'visit_rescheduled' && (!siteVisitDate || !rescheduleReason))}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#D7242A] hover:bg-[#b51c22] rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Updating Dossier...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Commit Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}