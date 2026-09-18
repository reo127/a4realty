'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  IndianRupee,
  FileSpreadsheet,
  AlertCircle,
  X,
  Sparkles,
  Layers,
  ChevronRight,
  Eye
} from 'lucide-react';
import EditPropertyModal from '@/app/components/EditPropertyModal';
import { generatePropertyUrl } from '@/utils/slugify';
import { formatPrice } from '@/utils/formatPrice';

export default function AdminProperties() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProperty, setEditingProperty] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/properties', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      const data = await response.json();

      if (response.ok) {
        setProperties(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch properties');
      }
    } catch (err) {
      setError('Error connecting to property portfolio database');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setError('');
    setSuccess('');
  };

  const handleDelete = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    setDeleting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/properties/${propertyToDelete._id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Property removed from portfolio successfully');
        setProperties(properties.filter(p => p._id !== propertyToDelete._id));
        setShowDeleteModal(false);
        setPropertyToDelete(null);
      } else {
        setError(data.message || 'Failed to delete property');
      }
    } catch (err) {
      setError('Error deleting property');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateProperty = (updatedProperty) => {
    setProperties(properties.map(p =>
      p._id === updatedProperty._id ? updatedProperty : p
    ));
    setSuccess('Property listing updated successfully');
    setEditingProperty(null);
  };

  const handleApprove = async (propertyId) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ status: 'approved' })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Property approved and published live');
        setProperties(properties.map(p =>
          p._id === propertyId ? { ...p, status: 'approved' } : p
        ));
      } else {
        setError(data.message || 'Failed to approve property');
      }
    } catch (err) {
      setError('Error approving property');
    }
  };

  const handleReject = async (propertyId) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Property marked as rejected');
        setProperties(properties.map(p =>
          p._id === propertyId ? { ...p, status: 'rejected' } : p
        ));
      } else {
        setError(data.message || 'Failed to reject property');
      }
    } catch (err) {
      setError('Error rejecting property');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/properties/export', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `properties-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess('Properties exported to CSV successfully');
      } else {
        const data = await response.json();
        setError(data.message || 'Export failed');
      }
    } catch (err) {
      setError('Error exporting property data');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a valid .csv file');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/properties/import', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setImportResults(data.results);
        setSuccess(data.message || 'CSV imported successfully');
        fetchProperties();
        setShowImportModal(true);
      } else {
        setError(data.message || 'Import failed');
      }
    } catch (err) {
      setError('Error importing properties CSV');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesStatus =
      statusFilter === 'all' ? true : property.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = properties.filter(p => p.status === 'pending').length;
  const approvedCount = properties.filter(p => p.status === 'approved' || !p.status).length;
  const rejectedCount = properties.filter(p => p.status === 'rejected').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl border-2 border-t-[#D7242A] border-r-transparent border-b-[#D7242A] border-l-transparent animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-700">Loading Property Portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Executive Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
              Property Portfolio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D7242A]/10 text-[#D7242A] border border-[#D7242A]/20">
              {properties.length} Listings
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Curate luxury residences, commercial suites, and direct owner listings across Mumbai & NCR.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/api/properties/template"
            download="properties-template.csv"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV Template</span>
          </a>

          <label className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>{importing ? 'Importing...' : 'Import CSV'}</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExport}
            disabled={exporting || properties.length === 0}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <Link
            href="/list-property"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#D7242A] hover:bg-[#b81d22] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="p-1 text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
          <button onClick={() => setError('')} className="p-1 text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Status Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            All Listings ({properties.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Pending Approval ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Approved &amp; Live ({approvedCount})
          </button>
          {rejectedCount > 0 && (
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or locality..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#D7242A] focus:bg-white transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Properties Table */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No properties matched criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? 'Try searching with a different locality or property name.'
              : 'Add your first property listing to begin curating the portfolio.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-700">
                  <th className="py-3.5 px-5">Property Title &amp; Details</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Price / Rent</th>
                  <th className="py-3.5 px-4">Type / Mode</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Listed Date</th>
                  <th className="py-3.5 px-5 text-right">Portfolio Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProperties.map((property) => (
                  <tr
                    key={property._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Thumbnail & Title */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3.5">
                        <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          {property.gallery && property.gallery[0] ? (
                            <img
                              src={property.gallery[0]}
                              alt={property.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-[#D7242A] transition-colors truncate max-w-xs">
                            {property.title}
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-600">
                            {property.bhk && property.bhk !== 'na' && (
                              <span className="font-semibold text-slate-700">
                                {property.bhk.toUpperCase()}
                              </span>
                            )}
                            {property.furnishingStatus && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{property.furnishingStatus.replace('-', ' ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{property.location}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-black text-slate-900">
                        ₹{formatPrice(property.price)}
                      </div>
                      {property.mode === 'rent' && (
                        <div className="text-[10px] text-slate-600 font-semibold">per month</div>
                      )}
                    </td>

                    {/* Type & Mode */}
                    <td className="py-3.5 px-4 whitespace-nowrap space-y-1">
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 uppercase tracking-wider">
                          {property.type}
                        </span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          property.mode === 'rent'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          For {property.mode}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getStatusBadge(property.status || 'approved')}`}>
                        {property.status || 'approved'}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {new Date(property.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Link
                          href={generatePropertyUrl(property)}
                          target="_blank"
                          title="View Live Listing"
                          className="p-1.5 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {property.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(property._id)}
                              title="Approve Property"
                              className="p-1.5 text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 rounded-lg transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReject(property._id)}
                              title="Reject Property"
                              className="p-1.5 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleEdit(property)}
                          title="Edit Listing Specs"
                          className="p-1.5 text-slate-600 hover:text-white bg-slate-100 hover:bg-slate-900 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(property)}
                          title="Delete Property"
                          className="p-1.5 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Property Modal Component */}
      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onUpdate={handleUpdateProperty}
        />
      )}

      {/* Import CSV Results Modal */}
      {showImportModal && importResults && (
        <div className="fixed inset-0 bg-[#0B0F19]/75 backdrop-blur-xs z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">CSV Import Summary</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportResults(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importResults.success?.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-800">
                  Imported Successfully ({importResults.success.length})
                </div>
                <div className="max-h-36 overflow-y-auto bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-800 space-y-1">
                  {importResults.success.map((item) => (
                    <div key={item.id} className="font-medium">
                      Row {item.row}: {item.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResults.errors?.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-rose-800">
                  Parsing Errors ({importResults.errors.length})
                </div>
                <div className="max-h-36 overflow-y-auto bg-rose-50/60 p-3 rounded-xl border border-rose-100 text-xs text-rose-800 space-y-1">
                  {importResults.errors.map((item, index) => (
                    <div key={index}>
                      Row {item.row}: {item.title || 'Unknown'} — {item.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportResults(null);
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#0B0F19]/75 backdrop-blur-xs z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Listing</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete &quot;{propertyToDelete?.title}&quot;? This action cannot be reversed.
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPropertyToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2 bg-[#D7242A] hover:bg-[#b81d22] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}