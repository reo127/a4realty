'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Search,
  X,
  Plus,
  FileText,
  CalendarCheck,
  History,
  RotateCcw,
  SlidersHorizontal
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [statusOptions, setStatusOptions] = useState({});
  const [availableSubstatuses, setAvailableSubstatuses] = useState([]);
  const [visitedLeads, setVisitedLeads] = useState(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const parsedParams = {
        sortBy: searchParams.get('sortBy') || 'assignedAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
        page: searchParams.get('page') || '1',
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || '',
        dateFrom: searchParams.get('dateFrom') || '',
        dateTo: searchParams.get('dateTo') || ''
      };
      setUrlParams(parsedParams);

      const savedVisited = sessionStorage.getItem('visitedLeads');
      if (savedVisited) {
        try {
          setVisitedLeads(new Set(JSON.parse(savedVisited)));
        } catch (e) {
          console.error('Error loading visited leads:', e);
        }
      }

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
      const response = await fetch(`/api/leads/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setLead(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch lead details');
      }
    } catch (err) {
      console.error('Error fetching lead:', err);
      setError(err.message);
    }
  };

  const fetchAllLeadsForNavigation = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;

      const userData = JSON.parse(storedUser);
      if (!userData._id) return;

      const queryParams = new URLSearchParams({
        limit: '30',
        page: urlParams.page || '1',
        sortBy: urlParams.sortBy || 'assignedAt',
        sortOrder: urlParams.sortOrder || 'desc',
        assignedTo: userData._id,
        ...(urlParams.search && { search: urlParams.search }),
        ...(urlParams.status && { status: urlParams.status }),
        ...(urlParams.dateFrom && { dateFrom: urlParams.dateFrom }),
        ...(urlParams.dateTo && { dateTo: urlParams.dateTo })
      });

      const response = await fetch(`/api/leads?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setAllLeads(data.data || []);
        setTotalLeadsCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error('Error fetching leads for navigation:', err);
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
    } catch (err) {
      console.error('Error fetching status options:', err);
    }
  };

  const fetchRelatedProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      const data = await response.json();

      if (data.success) {
        const allProperties = data.data;
        const interestedLocation = normalizeLocationName(lead.interestedLocation);

        const exactMatches = allProperties.filter(property =>
          normalizeLocationName(property.location) === interestedLocation
        );

        const nearbyLocations = getNearbyLocations(interestedLocation);
        const nearbyMatches = allProperties.filter(property => {
          const propLocation = normalizeLocationName(property.location);
          const isNearbyByLocation = nearbyLocations.some(nearby =>
            normalizeLocationName(nearby) === propLocation
          );
          const isNearbyByProperty = property.nearbyLocations && property.nearbyLocations.some(nearby =>
            normalizeLocationName(nearby) === interestedLocation
          );
          return isNearbyByLocation || isNearbyByProperty;
        });

        setRelatedProperties(exactMatches);
        setNearbyProperties(nearbyMatches);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  const searchProperties = async () => {
    try {
      setSearchLoading(true);
      const queryParams = new URLSearchParams();
      if (searchFilters.location) queryParams.append('location', searchFilters.location);
      if (searchFilters.type) queryParams.append('type', searchFilters.type);
      if (searchFilters.mode) queryParams.append('mode', searchFilters.mode);
      if (searchFilters.bhk) queryParams.append('bhk', searchFilters.bhk);

      const response = await fetch(`/api/properties?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        let results = data.data;
        if (searchFilters.minPrice || searchFilters.maxPrice) {
          results = results.filter(property => {
            const price = parseFloat(property.price?.replace(/[^0-9.-]+/g, '') || 0);
            const minPrice = searchFilters.minPrice ? parseFloat(searchFilters.minPrice) : 0;
            const maxPrice = searchFilters.maxPrice ? parseFloat(searchFilters.maxPrice) : Infinity;
            return price >= minPrice && price <= maxPrice;
          });
        }
        setSearchResults(results);
      }
    } catch (err) {
      console.error('Error searching properties:', err);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update lead');
      }

      setLead(data.data);
      setAllLeads(prevLeads =>
        prevLeads.map(l => l._id === lead._id ? data.data : l)
      );

      setUpdateStatus('');
      setUpdateSubstatus('');
      setUpdateNote('');
      setSiteVisitDate('');
      setFollowUpDate('');
      setShowUpdateModal(false);
    } catch (err) {
      console.error('Error updating lead:', err);
      setUpdateError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeConfig = (status) => {
    switch (status) {
      case 'interested':
      case 'site_visit_done':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'site_visit_scheduled':
      case 'visit_rescheduled':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'follow_up_scheduled':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200/80';
      case 'not_connected':
      case 'call_disconnected':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'not_interested':
      case 'do_not_disturb':
      case 'location_mismatch':
      case 'budget_mismatch':
      case 'possession_mismatch':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'new':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
    }
  };

  const formatStatusText = (status) => {
    const statusMap = {
      'new': 'New Lead',
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
    return statusMap[status] || status || 'New Lead';
  };

  const formatSubstatusText = (substatus) => {
    if (!substatus) return null;
    const substatusDisplayNames = {
      'ringing': 'Ringing',
      'switched_off': 'Switched Off',
      'call_busy': 'Call Busy',
      'call_disconnected': 'Call Disconnected',
      'invalid_number': 'Invalid Number',
      'site_visit_scheduled_with_date': 'Visit (With Date)',
      'site_visit_scheduled_no_date': 'Visit (No Date)',
      'follow_up': 'Follow Up',
      'not_actively_searching': 'Not Actively Searching',
      'require_more_than_6_months': '> 6 Months',
      'not_the_right_party': 'Wrong Party',
      'hang_up_while_talking': 'Hang Up',
      'call_drop': 'Call Drop',
      'looking_for_other_location': 'Other Location',
      'looking_for_other_city': 'Other City',
      'budget_is_low': 'Budget Low',
      'budget_is_high': 'Budget High',
      'looking_for_ready_to_move': 'Ready to Move',
      'looking_for_under_construction': 'Under Construction',
      'already_in_touch_with_builder': 'In Touch With Builder',
      'deal_closed': 'Deal Closed',
      'plan_drop': 'Plan Dropped',
      'plan_postponed': 'Plan Postponed',
      'already_purchased': 'Purchased',
      'dnc': 'DNC',
      'interested_in_revisit': 'Interested in Revisit',
      'plan_cancelled': 'Plan Cancelled'
    };
    return substatusDisplayNames[substatus] || substatus;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '').slice(-10);
  };

  const getCurrentLeadIndex = () => {
    return allLeads.findIndex(l => l._id === params.id);
  };

  const getCurrentLeadActualPosition = () => {
    const page = parseInt(urlParams.page || '1');
    const indexInCurrentPage = getCurrentLeadIndex();
    if (indexInCurrentPage === -1) return 0;
    return ((page - 1) * 30) + indexInCurrentPage + 1;
  };

  const navigateToLead = (leadId) => {
    const queryParams = new URLSearchParams({
      sortBy: urlParams.sortBy || 'assignedAt',
      sortOrder: urlParams.sortOrder || 'desc',
      page: urlParams.page || '1',
      ...(urlParams.search && { search: urlParams.search }),
      ...(urlParams.status && { status: urlParams.status }),
      ...(urlParams.dateFrom && { dateFrom: urlParams.dateFrom }),
      ...(urlParams.dateTo && { dateTo: urlParams.dateTo })
    });
    router.push(`/agent/my-leads/${leadId}?${queryParams.toString()}`);
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

  const CRMPropertyCard = ({ property, isNearby = false }) => (
    <PropertyCard
      property={property}
      viewMode="grid"
      customBadges={[
        ...(isNearby ? [{ text: 'Nearby Location', color: 'blue' }] : []),
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
          title: 'Call Property Owner'
        }
      ]}
    />
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl border-2 border-t-[#D7242A] border-r-transparent border-b-[#D7242A] border-l-transparent animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-700">Accessing prospect dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Lead Record Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'The requested prospect record could not be found.'}</p>
        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={fetchLeadDetails}
            className="px-4 py-2 bg-[#D7242A] text-white rounded-xl text-xs font-bold hover:bg-[#b81d22] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Slide-over Leads Directory Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 sm:w-88 bg-white shadow-2xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="bg-[#0B0F19] text-white p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#D7242A]"></span>
                <h3 className="text-sm font-bold text-white tracking-tight">Active Queue ({allLeads.length})</h3>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Current Page Leads • {totalLeadsCount} Total Assigned
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-50">
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
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#D7242A]/10 border-l-4 border-[#D7242A] text-[#D7242A]'
                      : isVisited
                      ? 'bg-slate-50/60 hover:bg-slate-100 border-l-4 border-emerald-500'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isActive ? 'bg-[#D7242A] text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {leadItem.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold truncate ${isActive ? 'text-[#D7242A]' : 'text-slate-900'}`}>
                        {leadItem.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {leadItem.phone} • {getLocationDisplayName(leadItem.interestedLocation)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Lead {getCurrentLeadActualPosition()} of {totalLeadsCount}</span>
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  const prev = getPreviousLead();
                  if (prev) {
                    navigateToLead(prev._id);
                    setSidebarOpen(false);
                  }
                }}
                disabled={!getPreviousLead()}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
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
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0B0F19]/50 backdrop-blur-xs z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sticky Executive Dossier Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 sm:top-18 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Browse Assigned Leads Drawer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <Link
              href={`/agent/my-leads?${new URLSearchParams({
                sortBy: urlParams.sortBy || 'assignedAt',
                sortOrder: urlParams.sortOrder || 'desc',
                page: urlParams.page || '1',
                ...(urlParams.search && { search: urlParams.search }),
                ...(urlParams.status && urlParams.status !== 'all' && { status: urlParams.status }),
                ...(urlParams.dateFrom && { dateFrom: urlParams.dateFrom }),
                ...(urlParams.dateTo && { dateTo: urlParams.dateTo })
              }).toString()}`}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition-colors"
              title="Return to Leads Pipeline"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 truncate font-serif">
                  {lead.name}
                </h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeConfig(lead.status)}`}>
                  {formatStatusText(lead.status)}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Lead Ref: #{lead._id.slice(-6).toUpperCase()} • Record {getCurrentLeadActualPosition()} of {totalLeadsCount}
              </p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const prev = getPreviousLead();
                if (prev) navigateToLead(prev._id);
              }}
              disabled={!getPreviousLead()}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              onClick={() => {
                const next = getNextLead();
                if (next) navigateToLead(next._id);
              }}
              disabled={!getNextLead()}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-[#D7242A] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Dossier Profile & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prospect Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-[#0B0F19] text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                  {lead.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <h2 className="text-lg font-bold text-slate-900">{lead.name}</h2>
                <p className="text-xs text-slate-600">ID: {lead._id}</p>
              </div>

              {/* Quick Communication Toolbar */}
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`tel:${lead.phone}`}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors"
                >
                  <Phone className="w-4 h-4 mb-1 text-emerald-600" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/91${cleanPhone(lead.phone)}?text=Hello%20${encodeURIComponent(lead.name)},%20this%20is%20regarding%20your%20property%20inquiry%20with%20A4%20Realty.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mb-1 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}?subject=Property Inquiry - A4 Realty`}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition-colors"
                  >
                    <Mail className="w-4 h-4 mb-1 text-blue-600" />
                    <span>Email</span>
                  </a>
                ) : (
                  <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-300 text-xs font-semibold">
                    <Mail className="w-4 h-4 mb-1" />
                    <span>No Email</span>
                  </div>
                )}
              </div>

              {/* Detail Items */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 font-medium">Primary Contact</span>
                  <span className="font-bold text-slate-900">{lead.phone}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 font-medium">Desired Locality</span>
                  <span className="font-bold text-slate-900">{getLocationDisplayName(lead.interestedLocation)}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 font-medium">Lead Source</span>
                  <span className="font-bold text-slate-900 capitalize">{lead.source || 'Website'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 font-medium">Date Received</span>
                  <span className="font-bold text-slate-900">{formatDate(lead.createdAt).split(',')[0]}</span>
                </div>
              </div>

              {/* Status Update Trigger */}
              <button
                onClick={() => {
                  setUpdateStatus(lead.status || '');
                  setUpdateSubstatus(lead.substatus || '');
                  setUpdateNote('');
                  setUpdateError('');
                  setShowUpdateModal(true);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#D7242A] hover:bg-[#b81d22] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Update Status &amp; Add Note</span>
              </button>
            </div>

            {/* Conversation Notes & Scheduled Intel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Activity Timeline ({lead.notes?.length || 0})
                </h3>
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="text-xs font-bold text-[#D7242A] hover:text-[#b81d22] flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </div>

              {/* Next Scheduled Action Cards */}
              {lead.followUpDate && (
                <div className="p-3 bg-cyan-50/80 border border-cyan-200/80 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-cyan-900 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Next Scheduled Follow-up</span>
                  </div>
                  <div className="text-cyan-800 font-semibold pl-5">
                    {formatDate(lead.followUpDate)}
                  </div>
                </div>
              )}

              {lead.siteVisitDate && (
                <div className="p-3 bg-violet-50/80 border border-violet-200/80 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-violet-900 flex items-center space-x-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-violet-600" />
                    <span>Scheduled Site Tour</span>
                  </div>
                  <div className="text-violet-800 font-semibold pl-5">
                    {formatDate(lead.siteVisitDate)}
                  </div>
                </div>
              )}

              {/* Notes Log */}
              {lead.notes && lead.notes.length > 0 ? (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {lead.notes.slice().reverse().map((note, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <p className="text-slate-800 font-medium leading-relaxed">{note.content}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                        <span className="font-semibold text-slate-600">{note.addedBy || 'Advisor'}</span>
                        <span>{formatDate(note.addedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <span>No notes recorded yet.</span>
                </div>
              )}

              {/* Assignment Audit History */}
              {lead.assignmentHistory && lead.assignmentHistory.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <AssignmentHistory history={lead.assignmentHistory} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Inventory Suggestions for this Lead */}
          <div className="lg:col-span-2 space-y-6">
            {/* Match Telemetry */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="text-2xl font-black text-[#D7242A] tracking-tight">{relatedProperties.length}</div>
                <div className="text-xs font-semibold text-slate-600 mt-0.5">Exact Location Matches</div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="text-2xl font-black text-slate-900 tracking-tight">{nearbyProperties.length}</div>
                <div className="text-xs font-semibold text-slate-600 mt-0.5">Adjacent Locality Matches</div>
              </div>
            </div>

            {/* Inventory Matching Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recommended Inventory for {lead.name}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Pitch these curated properties matching the prospect&apos;s interested territory.
                  </p>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex space-x-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveTab('exact')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'exact'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Exact ({relatedProperties.length})
                </button>
                <button
                  onClick={() => setActiveTab('nearby')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'nearby'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Nearby Areas ({nearbyProperties.length})
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'search'
                      ? 'bg-white text-[#D7242A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Custom Filter ({searchResults.length})</span>
                </button>
              </div>

              {/* Exact Location Properties */}
              {activeTab === 'exact' && (
                <div>
                  {relatedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {relatedProperties.map((property) => (
                        <CRMPropertyCard key={property._id} property={property} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <Building2 className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-xs font-medium">
                        No active properties found in {getLocationDisplayName(lead.interestedLocation)}.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Nearby Location Properties */}
              {activeTab === 'nearby' && (
                <div>
                  {nearbyProperties.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {nearbyProperties.map((property) => (
                        <CRMPropertyCard key={property._id} property={property} isNearby={true} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <Building2 className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-xs font-medium">No properties found in nearby sectors.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Search Tab */}
              {activeTab === 'search' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Location</label>
                        <input
                          type="text"
                          value={searchFilters.location}
                          onChange={(e) => handleSearchInputChange('location', e.target.value)}
                          placeholder="e.g. Bandra West"
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-[#D7242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Configuration</label>
                        <select
                          value={searchFilters.bhk}
                          onChange={(e) => handleSearchInputChange('bhk', e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-[#D7242A]"
                        >
                          <option value="">Any BHK</option>
                          <option value="1bhk">1 BHK</option>
                          <option value="2bhk">2 BHK</option>
                          <option value="3bhk">3 BHK</option>
                          <option value="4bhk">4 BHK</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Max Price (₹)</label>
                        <input
                          type="number"
                          value={searchFilters.maxPrice}
                          onChange={(e) => handleSearchInputChange('maxPrice', e.target.value)}
                          placeholder="Max Price"
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-[#D7242A]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={searchProperties}
                        disabled={searchLoading}
                        className="px-4 py-2 bg-[#D7242A] hover:bg-[#b81d22] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        {searchLoading ? 'Searching...' : 'Search Inventory'}
                      </button>
                      <button
                        onClick={clearSearch}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {searchResults.map((property) => (
                        <CRMPropertyCard key={property._id} property={property} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No custom search results yet. Apply filters to search.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Update Status & Add Note Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-[#0B0F19]/75 backdrop-blur-xs z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-[#0B0F19] text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#D7242A] flex items-center justify-center text-white">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Update Lead Dossier</h3>
                  <p className="text-[11px] text-slate-400">{lead.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateError && (
              <div className="p-3 mx-5 mt-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {updateError}
              </div>
            )}

            <form onSubmit={handleUpdateLead} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pipeline Stage
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#D7242A]"
                >
                  <option value="">Select New Status</option>
                  {Object.keys(statusOptions).map((st) => (
                    <option key={st} value={st}>
                      {formatStatusText(st)}
                    </option>
                  ))}
                </select>
              </div>

              {updateStatus && availableSubstatuses.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Stage Detail / Substatus
                  </label>
                  <select
                    value={updateSubstatus}
                    onChange={(e) => setUpdateSubstatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#D7242A]"
                  >
                    <option value="">Select Substatus (Optional)</option>
                    {availableSubstatuses.map((sub) => (
                      <option key={sub} value={sub}>
                        {formatSubstatusText(sub)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {updateStatus === 'site_visit_scheduled' && (
                <div className="space-y-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 uppercase mb-1">
                      Site Visit Date &amp; Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={siteVisitDate}
                      onChange={(e) => setSiteVisitDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#D7242A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 uppercase mb-1">
                      Visit Requirement *
                    </label>
                    <textarea
                      value={visitReason}
                      onChange={(e) => setVisitReason(e.target.value)}
                      rows={2}
                      placeholder="e.g. Client requested 3 BHK tour at high floor..."
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#D7242A]"
                      required
                    />
                  </div>
                </div>
              )}

              {updateStatus === 'follow_up_scheduled' && (
                <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100">
                  <label className="block text-[11px] font-bold text-cyan-900 uppercase mb-1">
                    Follow-Up Date &amp; Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-cyan-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#D7242A]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Log Conversation Note
                </label>
                <textarea
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  rows={3}
                  placeholder="Record summary of call, client objections, or next steps..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#D7242A] focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-[#D7242A] hover:bg-[#b81d22] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isUpdating ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
