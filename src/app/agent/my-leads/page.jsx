'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getLocationDisplayName } from '@/utils/locations';

export default function AgentLeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [visitedLeads, setVisitedLeads] = useState(new Set());

  // Read all filter values from URL (source of truth)
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const searchTerm = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const statusFilter = searchParams.get('status') || 'all';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';

  // Helper function to update URL params
  const updateURLParams = (updates, addToHistory = false) => {
    const params = new URLSearchParams();

    const current = {
      page: currentPage.toString(),
      sortBy: sortBy,
      sortOrder: sortOrder,
      search: searchTerm,
      status: statusFilter,
      dateFrom: dateFrom,
      dateTo: dateTo,
    };

    const merged = { ...current, ...updates };

    if (merged.page && merged.page !== '1') params.set('page', merged.page);
    if (merged.sortBy && merged.sortBy !== 'createdAt') params.set('sortBy', merged.sortBy);
    if (merged.sortOrder && merged.sortOrder !== 'desc') params.set('sortOrder', merged.sortOrder);
    if (merged.search) params.set('search', merged.search);
    if (merged.status && merged.status !== 'all') params.set('status', merged.status);
    if (merged.dateFrom) params.set('dateFrom', merged.dateFrom);
    if (merged.dateTo) params.set('dateTo', merged.dateTo);

    if (addToHistory) {
      router.push(`/agent/my-leads?${params.toString()}`, { scroll: false });
    } else {
      router.replace(`/agent/my-leads?${params.toString()}`, { scroll: false });
    }
  };

  // Initialize searchInput from URL
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  // Load visited leads from session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVisited = sessionStorage.getItem('visitedLeads');
      if (savedVisited) {
        try {
          setVisitedLeads(new Set(JSON.parse(savedVisited)));
        } catch (e) {
          console.error('Error loading visited leads:', e);
        }
      }
    }
  }, []);

  // Load user and fetch leads
  useEffect(() => {
    const loadUserAndLeads = async () => {
      if (typeof window === 'undefined') return;

      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        router.push('/login');
        return;
      }

      const userData = JSON.parse(storedUser);

      if (userData.role !== 'agent') {
        router.push('/admin');
        return;
      }

      setUser(userData);

      // Only fetch if we have a valid agent ID
      if (!userData._id) {
        setError('Invalid user data. Please login again.');
        setLoading(false);
        return;
      }

      // Fetch leads
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '30',
          sortBy: sortBy,
          sortOrder: sortOrder,
          assignedTo: userData._id,
        });

        if (searchTerm) params.set('search', searchTerm);
        if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);

        const response = await fetch(`/api/leads?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setLeads(data.data);
          setTotalPages(data.totalPages);
          setTotalCount(data.totalCount);
          setError(null);

          if (data.totalPages > 0 && currentPage > data.totalPages) {
            updateURLParams({ page: data.totalPages.toString() }, false);
          }
        } else {
          throw new Error(data.message || 'Failed to fetch leads');
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndLeads();
  }, [currentPage, searchTerm, sortBy, sortOrder, statusFilter, dateFrom, dateTo, router]);

  const handleSearch = () => {
    updateURLParams({ search: searchInput, page: '1' });
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
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
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'not_connected': 'bg-yellow-100 text-yellow-800',
      'interested': 'bg-green-100 text-green-800',
      'follow_up': 'bg-cyan-100 text-cyan-800',
      'not_interested': 'bg-red-100 text-red-800',
      'call_disconnected': 'bg-orange-100 text-orange-800',
      'location_mismatch': 'bg-purple-100 text-purple-800',
      'budget_mismatch': 'bg-pink-100 text-pink-800',
      'possession_mismatch': 'bg-indigo-100 text-indigo-800',
      'do_not_disturb': 'bg-gray-100 text-gray-800',
      'site_visit_done': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  if (loading && leads.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Assigned Leads</h1>
          <p className="text-gray-600 mt-1">Manage and call your assigned leads</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name, phone, email, or location..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => updateURLParams({ status: e.target.value, page: '1' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="not_connected">Not Connected</option>
                  <option value="interested">Interested</option>
                  <option value="site_visit_scheduled">Site Visit Scheduled</option>
                  <option value="follow_up_scheduled">Follow-up Scheduled</option>
                  <option value="visit_rescheduled">Visit Rescheduled</option>
                  <option value="site_visit_done">Site Visit Done</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="call_disconnected">Call Disconnected</option>
                  <option value="location_mismatch">Location Mismatch</option>
                  <option value="budget_mismatch">Budget Mismatch</option>
                  <option value="possession_mismatch">Possession Mismatch</option>
                  <option value="do_not_disturb">Do Not Disturb</option>
                </select>
              </div>

              {/* Date From */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => updateURLParams({ dateFrom: e.target.value, page: '1' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                />
              </div>

              {/* Date To */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => updateURLParams({ dateTo: e.target.value, page: '1' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => updateURLParams({ sortBy: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  >
                    <option value="createdAt">Date Added</option>
                    <option value="name">Name</option>
                    <option value="interestedLocation">Location</option>
                  </select>
                  <button
                    onClick={() => updateURLParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' })}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>

              {(statusFilter !== 'all' || dateFrom || dateTo || searchTerm || searchInput) && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    router.replace('/agent/my-leads', { scroll: false });
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{leads.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalCount}</span> assigned leads
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </p>
            )}
          </div>
        </div>

        {/* Leads Table */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads assigned yet</h3>
            <p className="text-gray-500">Contact your admin to get leads assigned to you</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => {
                    const isVisited = visitedLeads.has(lead._id);
                    return (
                      <tr
                        key={lead._id}
                        onClick={() => {
                          // Mark lead as visited
                          const newVisited = new Set(visitedLeads);
                          newVisited.add(lead._id);
                          setVisitedLeads(newVisited);
                          sessionStorage.setItem('visitedLeads', JSON.stringify([...newVisited]));

                          // Build URL with current filter/sort params
                          const params = new URLSearchParams({
                            sortBy,
                            sortOrder,
                            page: currentPage.toString(),
                            ...(searchTerm && { search: searchTerm }),
                            ...(statusFilter !== 'all' && { status: statusFilter }),
                            ...(dateFrom && { dateFrom }),
                            ...(dateTo && { dateTo })
                          });
                          router.push(`/agent/my-leads/${lead._id}?${params.toString()}`);
                        }}
                        className={`hover:bg-indigo-50 transition-colors duration-200 cursor-pointer ${
                          isVisited ? 'bg-green-50 border-l-4 border-green-400' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">
                                  {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                              <div className="text-sm text-gray-500">{getLocationDisplayName(lead.interestedLocation || 'Unknown')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center mb-1">
                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:text-indigo-900 text-sm" onClick={(e) => e.stopPropagation()}>
                              {lead.phone}
                            </a>
                          </div>
                          {lead.email && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:text-indigo-900 text-sm" onClick={(e) => e.stopPropagation()}>
                                {lead.email}
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap relative">
                          <div className="group relative">
                            <div className="flex flex-col gap-1">
                              <span className={`justify-center inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(lead.status || 'new')}`}>
                                {getStatusDisplay(lead.status || 'new')}
                              </span>
                              {lead.substatus && (
                                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full max-w-fit">
                                  {formatSubstatusText(lead.substatus)}
                                </span>
                              )}
                              {lead.siteVisitDate && (
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full max-w-fit">
                                  Visit: {new Date(lead.siteVisitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                              {lead.followUpDate && (
                                <span className="text-xs text-cyan-600 bg-cyan-100 px-2 py-0.5 rounded-full max-w-fit">
                                  Follow-up: {new Date(lead.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            {lead.notes && lead.notes.length > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-xs bg-indigo-100 text-indigo-600 rounded-full cursor-pointer">
                                {lead.notes.length}
                              </span>
                            )}
                            {(lead.notes && lead.notes.length > 0) || lead.followUpDate || lead.siteVisitDate || (lead.followUpHistory && lead.followUpHistory.length > 0) || (lead.visitHistory && lead.visitHistory.length > 0) ? (
                              <div className="invisible group-hover:visible absolute z-50 left-0 top-8 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-64 overflow-y-auto">
                                {/* Current Follow-up */}
                                {lead.followUpDate && (
                                  <div className="mb-3 p-2 bg-cyan-50 border-l-2 border-cyan-400 rounded">
                                    <div className="text-xs font-semibold text-cyan-800">📅 Next Follow-up</div>
                                    <div className="text-sm text-cyan-700 mt-1">
                                      {new Date(lead.followUpDate).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Follow-up History */}
                                {lead.followUpHistory && lead.followUpHistory.length > 0 && (
                                  <div className="mb-3">
                                    <div className="text-xs font-semibold text-gray-600 mb-2">Follow-up History</div>
                                    <div className="space-y-2">
                                      {lead.followUpHistory.slice().reverse().slice(0, 3).map((followUp, index) => (
                                        <div key={index} className="text-xs p-2 bg-gray-50 border-l-2 border-gray-300 rounded">
                                          <div className="text-gray-700">
                                            {new Date(followUp.scheduledDate).toLocaleDateString('en-IN', {
                                              day: '2-digit',
                                              month: 'short',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </div>
                                          {followUp.notes && (
                                            <div className="text-gray-500 mt-1">{followUp.notes}</div>
                                          )}
                                          <div className="text-gray-400 mt-1">
                                            {followUp.completed ? '✓ Completed' : 'Scheduled'} • {formatDate(followUp.addedAt).split(',')[0]}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Current Site Visit */}
                                {lead.siteVisitDate && (
                                  <div className="mb-3 p-2 bg-blue-50 border-l-2 border-blue-400 rounded">
                                    <div className="text-xs font-semibold text-blue-800">🏠 Next Site Visit</div>
                                    <div className="text-sm text-blue-700 mt-1">
                                      {new Date(lead.siteVisitDate).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Visit History */}
                                {lead.visitHistory && lead.visitHistory.length > 0 && (
                                  <div className="mb-3">
                                    <div className="text-xs font-semibold text-gray-600 mb-2">Visit History</div>
                                    <div className="space-y-2">
                                      {lead.visitHistory.slice().reverse().slice(0, 3).map((visit, index) => (
                                        <div key={index} className="text-xs p-2 bg-gray-50 border-l-2 border-gray-300 rounded">
                                          <div className="text-gray-700">
                                            {new Date(visit.scheduledDate).toLocaleDateString('en-IN', {
                                              day: '2-digit',
                                              month: 'short',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </div>
                                          {visit.reason && (
                                            <div className="text-gray-500 mt-1">{visit.reason}</div>
                                          )}
                                          <div className="text-gray-400 mt-1">
                                            {visit.type === 'completed' ? '✓ Completed' : visit.type === 'rescheduled' ? '↻ Rescheduled' : 'Scheduled'}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Notes */}
                                {lead.notes && lead.notes.length > 0 && (
                                  <>
                                    <div className="text-sm font-semibold text-gray-900 mb-2">Notes ({lead.notes.length})</div>
                                    <div className="space-y-3">
                                      {lead.notes.slice().reverse().map((note, index) => (
                                        <div key={index} className="border-l-2 border-indigo-200 pl-3">
                                          <div className="text-sm text-gray-700">{note.content}</div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            {formatDate(note.addedAt)} • {note.addedBy}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.assignedAt ? formatDate(lead.assignedAt) : formatDate(lead.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/agent/my-leads/${lead._id}?page=${currentPage}&sortBy=${sortBy}&sortOrder=${sortOrder}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View & Call
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination with Ellipsis */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => updateURLParams({ page: Math.max(1, currentPage - 1).toString() }, true)}
                    disabled={currentPage === 1}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">
                    {(() => {
                      const pages = [];
                      const maxVisiblePages = 7;

                      if (totalPages <= maxVisiblePages) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        pages.push(1);

                        let startPage = Math.max(2, currentPage - 1);
                        let endPage = Math.min(totalPages - 1, currentPage + 1);

                        if (currentPage <= 3) {
                          startPage = 2;
                          endPage = 5;
                        }

                        if (currentPage >= totalPages - 2) {
                          startPage = totalPages - 4;
                          endPage = totalPages - 1;
                        }

                        if (startPage > 2) {
                          pages.push('...');
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(i);
                        }

                        if (endPage < totalPages - 1) {
                          pages.push('...');
                        }

                        pages.push(totalPages);
                      }

                      return pages.map((page, index) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                              ...
                            </span>
                          );
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => updateURLParams({ page: page.toString() }, true)}
                            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      });
                    })()}
                  </div>

                  <button
                    onClick={() => updateURLParams({ page: Math.min(totalPages, currentPage + 1).toString() }, true)}
                    disabled={currentPage === totalPages}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
