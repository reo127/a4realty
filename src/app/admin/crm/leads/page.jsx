'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getLocationDisplayName } from '@/utils/locations';
import BulkLeadUpload from '@/components/BulkLeadUpload';

export default function CRMLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingLead, setAddingLead] = useState(false);
  const [addError, setAddError] = useState('');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    interestedLocation: ''
  });

  // Track previous filter values to prevent unnecessary page resets
  const prevFiltersRef = useRef({ searchTerm, statusFilter, dateFrom, dateTo });

  // Fetch leads whenever dependencies change
  useEffect(() => {
    const fetchLeadsData = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '30',
          sortBy,
          sortOrder,
          ...(searchTerm && { search: searchTerm }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo })
        });

        const response = await fetch(`/api/leads?${params}`);
        const data = await response.json();

        if (data.success) {
          setLeads(data.data);
          setTotalPages(data.totalPages);
          setTotalCount(data.totalCount);
          setError(null);

          // If current page exceeds total pages, reset to last valid page
          if (data.totalPages > 0 && currentPage > data.totalPages) {
            setCurrentPage(data.totalPages);
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

    fetchLeadsData();
  }, [currentPage, searchTerm, sortBy, sortOrder, statusFilter, dateFrom, dateTo]);

  const handleAddLead = async (e) => {
    e.preventDefault();
    setAddingLead(true);
    setAddError('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLead)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add lead');
      }

      // Reset to page 1 (this will trigger useEffect to fetch)
      setCurrentPage(1);

      // Reset form and close modal
      setNewLead({
        name: '',
        phone: '',
        email: '',
        interestedLocation: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding lead:', error);
      setAddError(error.message);
    } finally {
      setAddingLead(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For phone number, only allow digits and limit to 10
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setNewLead(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setNewLead(prev => ({ ...prev, [name]: value }));
    }
  };

  // Reset to page 1 when filters change (but not sort order which should preserve page)
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const filtersChanged =
      prevFilters.searchTerm !== searchTerm ||
      prevFilters.statusFilter !== statusFilter ||
      prevFilters.dateFrom !== dateFrom ||
      prevFilters.dateTo !== dateTo;

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
    }

    // Update ref with current filter values
    prevFiltersRef.current = { searchTerm, statusFilter, dateFrom, dateTo };
  }, [searchTerm, statusFilter, dateFrom, dateTo, currentPage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const formatStatusText = (status) => {
    const statusDisplayNames = {
      'new': 'New',
      'not_connected': 'Not Connected',
      'interested': 'Interested',
      'follow_up': 'Follow Up',
      'not_interested': 'Not Interested',
      'call_disconnected': 'Call Disconnected',
      'location_mismatch': 'Location Mismatch',
      'budget_mismatch': 'Budget Mismatch',
      'possession_mismatch': 'Possession Mismatch',
      'do_not_disturb': 'Do Not Disturb',
      'site_visit_done': 'Site Visit Done'
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

  const handleBulkUploadComplete = (results) => {
    // Reset to page 1 (this will trigger useEffect to fetch)
    if (results.createdCount > 0) {
      setCurrentPage(1);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/leads/template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lead_upload_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      // Fallback to client-side generation
      const csvContent = 'name,phonenumber,location,email\nJohn Doe,9876543210,Koramangala,john@example.com\nJane Smith,9876543211,BTM Layout,jane@example.com\nSample Lead,9876543212,Electronic City,sample@example.com';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lead_upload_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      setDownloading(true);
      const params = new URLSearchParams({
        format: 'csv',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await fetch(`/api/leads/export?${params}`);
      if (!response.ok) throw new Error('Failed to download CSV');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      const params = new URLSearchParams({
        format: 'excel',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await fetch(`/api/leads/export?${params}`);
      if (!response.ok) throw new Error('Failed to download Excel');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Failed to download Excel. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Leads</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchLeads}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRM - Sales Leads</h1>
              <p className="text-gray-600 mt-1">Manage and track your sales leads</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {totalCount} Total Leads
              </span>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Lead</span>
              </button>
              <button
                onClick={downloadTemplate}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Template</span>
              </button>
              <button
                onClick={() => setShowBulkUpload(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Bulk Upload</span>
              </button>
              <button
                onClick={handleDownloadCSV}
                disabled={downloading || totalCount === 0}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>CSV</span>
              </button>
              <button
                onClick={handleDownloadExcel}
                disabled={downloading || totalCount === 0}
                className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Excel</span>
              </button>
              <Link
                href="/admin"
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 py-6 text-black">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, phone, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Status Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="not_connected">Not Connected</option>
                  <option value="interested">Interested</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="call_disconnected">Call Disconnected</option>
                  <option value="location_mismatch">Location Mismatch</option>
                  <option value="budget_mismatch">Budget Mismatch</option>
                  <option value="possession_mismatch">Possession Mismatch</option>
                  <option value="do_not_disturb">Do Not Disturb</option>
                  <option value="site_visit_done">Site Visit Done</option>
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
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Sort By */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="createdAt">Date Added</option>
                    <option value="name">Name</option>
                    <option value="interestedLocation">Location</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(statusFilter !== 'all' || dateFrom || dateTo || searchTerm) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setDateFrom('');
                    setDateTo('');
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pagination Info */}
        {totalCount > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {((currentPage - 1) * 30) + 1} to {Math.min(currentPage * 30, totalCount)} of {totalCount} leads
              </span>
            </div>
          </div>
        )}

        {/* Leads Table */}
        {leads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria.' : 'No leads have been captured yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div>
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interested Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Added
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr
                      key={lead._id}
                      onClick={() => window.location.href = `/admin/crm/leads/${lead._id}`}
                      className="hover:bg-indigo-50 transition-colors duration-200 cursor-pointer"
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
                            <div className="text-sm text-gray-500">ID: {lead._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:text-indigo-900">
                              {lead.phone}
                            </a>
                          </div>
                          {lead.email && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:text-indigo-900 text-sm">
                                {lead.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {getLocationDisplayName(lead.interestedLocation || 'Unknown')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <div className="group relative">
                          <div className="flex flex-col gap-1">
                            <span className={`justify-center inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(lead.status || 'new')}`}>
                              {formatStatusText(lead.status || 'new')}
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
                          {lead.notes && lead.notes.length > 0 && (
                             <div className="invisible group-hover:visible absolute z-50 left-0 top-8 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-64 overflow-y-auto">
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
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">
                    {(() => {
                      const pages = [];
                      const maxVisiblePages = 7;

                      if (totalPages <= maxVisiblePages) {
                        // Show all pages if total is less than max
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Show first page
                        pages.push(1);

                        // Calculate range around current page
                        let startPage = Math.max(2, currentPage - 1);
                        let endPage = Math.min(totalPages - 1, currentPage + 1);

                        // Adjust if we're near the start
                        if (currentPage <= 3) {
                          startPage = 2;
                          endPage = 5;
                        }

                        // Adjust if we're near the end
                        if (currentPage >= totalPages - 2) {
                          startPage = totalPages - 4;
                          endPage = totalPages - 1;
                        }

                        // Add ellipsis after first page if needed
                        if (startPage > 2) {
                          pages.push('...');
                        }

                        // Add middle pages
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(i);
                        }

                        // Add ellipsis before last page if needed
                        if (endPage < totalPages - 1) {
                          pages.push('...');
                        }

                        // Show last page
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
                            onClick={() => setCurrentPage(page)}
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

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

      {/* Add New Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="bg-green-600 text-white py-4 px-6 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Add New Lead
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {addError && (
                <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {addError}
                  </div>
                </div>
              )}

              <form onSubmit={handleAddLead} className="p-6 space-y-4 text-black">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newLead.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
                    placeholder="Enter lead's full name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={newLead.phone}
                    onChange={handleInputChange}
                    required
                    maxLength="10"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
                    placeholder="10-digit phone number"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newLead.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
                    placeholder="Enter email address (optional)"
                  />
                </div>

                <div>
                  <label htmlFor="interestedLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Interested Location*
                  </label>
                  <input
                    type="text"
                    id="interestedLocation"
                    name="interestedLocation"
                    value={newLead.interestedLocation}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
                    placeholder="e.g. Koramangala, BTM Layout, Electronic City"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={addingLead}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingLead || !newLead.name || !newLead.phone || !newLead.interestedLocation}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {addingLead ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Lead</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkLeadUpload
          onUploadComplete={handleBulkUploadComplete}
          onClose={() => setShowBulkUpload(false)}
        />
      )}
    </div>
  );
}