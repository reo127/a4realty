'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EditPropertyModal from '@/app/components/EditPropertyModal';

export default function AdminProperties() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
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
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProperties(data.data);
      } else {
        setError(data.message || 'Failed to fetch properties');
      }
    } catch (error) {
      setError('Error fetching properties');
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Property deleted successfully');
        setProperties(properties.filter(p => p._id !== propertyToDelete._id));
        setShowDeleteModal(false);
        setPropertyToDelete(null);
      } else {
        setError(data.message || 'Failed to delete property');
      }
    } catch (error) {
      setError('Error deleting property');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateProperty = (updatedProperty) => {
    setProperties(properties.map(p =>
      p._id === updatedProperty._id ? updatedProperty : p
    ));
    setSuccess('Property updated successfully');
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Property approved successfully');
        setProperties(properties.map(p =>
          p._id === propertyId ? { ...p, status: 'approved' } : p
        ));
      } else {
        setError(data.message || 'Failed to approve property');
      }
    } catch (error) {
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Property rejected');
        setProperties(properties.map(p =>
          p._id === propertyId ? { ...p, status: 'rejected' } : p
        ));
      } else {
        setError(data.message || 'Failed to reject property');
      }
    } catch (error) {
      setError('Error rejecting property');
    }
  };

  const filteredProperties = properties.filter(property => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return property.status === 'pending';
    if (statusFilter === 'approved') return property.status === 'approved';
    return true;
  });

  const pendingCount = properties.filter(p => p.status === 'pending').length;
  const approvedCount = properties.filter(p => p.status === 'approved').length;

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleExport = async () => {
    setExporting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/properties/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        setSuccess('Properties exported successfully');
      } else {
        const data = await response.json();
        setError(data.message || 'Export failed');
      }
    } catch (error) {
      setError('Error exporting properties');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
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
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setImportResults(data.results);
        setSuccess(data.message);
        fetchProperties();
        setShowImportModal(true);
      } else {
        setError(data.message || 'Import failed');
      }
    } catch (error) {
      setError('Error importing properties');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600 mt-2">Manage all properties in the system</p>
        </div>

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

        {/* Status Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setStatusFilter('all')}
              className={`${
                statusFilter === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              All Properties
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
                {properties.length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`${
                statusFilter === 'pending'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Pending Approval
              {pendingCount > 0 && (
                <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`${
                statusFilter === 'approved'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Approved
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {approvedCount}
              </span>
            </button>
          </nav>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-700 text-white py-4 px-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {statusFilter === 'all' && `All Properties (${filteredProperties.length})`}
              {statusFilter === 'pending' && `Pending Approval (${filteredProperties.length})`}
              {statusFilter === 'approved' && `Approved Properties (${filteredProperties.length})`}
            </h2>
            <div className="flex space-x-3">
              <a
                href="/api/properties/template"
                download="properties-template.csv"
                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Template
              </a>
               <a
                href="/list-property"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                List Properties
              </a>
              <button
                onClick={handleExport}
                disabled={exporting || properties.length === 0}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors cursor-pointer">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                {importing ? 'Importing...' : 'Import CSV'}
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  disabled={importing}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-lg">No properties found</p>
              <p className="text-sm mt-1">
                {statusFilter === 'pending' ? 'No pending properties' :
                 statusFilter === 'approved' ? 'No approved properties' :
                 'Properties will appear here once they are created'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {property.gallery && property.gallery[0] ? (
                              <img 
                                className="h-12 w-12 rounded-lg object-cover" 
                                src={property.gallery[0]} 
                                alt={property.title}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.bhk && property.bhk !== 'na' ? property.bhk.toUpperCase() : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{property.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{formatPrice(property.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                          {property.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                          {property.mode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          property.status === 'approved' ? 'bg-green-100 text-green-800' :
                          property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          property.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status || 'approved'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(property.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/property/${property._id}`}
                          target="_blank"
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Visit
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          {property.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(property._id)}
                                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(property._id)}
                                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEdit(property)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(property)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Property Modal */}
        {editingProperty && (
          <EditPropertyModal
            property={editingProperty}
            onClose={() => setEditingProperty(null)}
            onUpdate={handleUpdateProperty}
          />
        )}

        {/* Import Results Modal */}
        {showImportModal && importResults && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-lg max-w-2xl mx-auto p-6 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Import Results</h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportResults(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {importResults.success.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-green-800 mb-2">
                    Successfully Imported ({importResults.success.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto bg-green-50 p-2 rounded">
                    {importResults.success.map((item) => (
                      <div key={item.id} className="text-xs text-green-700 mb-1">
                        Row {item.row}: {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {importResults.errors.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    Errors ({importResults.errors.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto bg-red-50 p-2 rounded">
                    {importResults.errors.map((item, index) => (
                      <div key={index} className="text-xs text-red-700 mb-1">
                        Row {item.row}: {item.title} - {item.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportResults(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-lg max-w-md mx-auto p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete Property
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete "{propertyToDelete?.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setPropertyToDelete(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}