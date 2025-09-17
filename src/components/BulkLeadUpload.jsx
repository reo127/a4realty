'use client';

import { useState } from 'react';

export default function BulkLeadUpload({ onUploadComplete, onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile) => {
    setError('');
    setUploadResults(null);

    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await fetch('/api/leads/bulk', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setUploadResults(data.results);
        if (onUploadComplete) {
          onUploadComplete(data.results);
        }
      } else {
        setError(data.message || 'Upload failed');
        if (data.results) {
          setUploadResults(data.results);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Network error occurred during upload');
    } finally {
      setUploading(false);
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

  const resetUpload = () => {
    setFile(null);
    setUploadResults(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-blue-600 text-white py-4 px-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Bulk Upload Leads
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {!uploadResults ? (
              <div className="space-y-6">
                {/* CSV Format Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">CSV Format Requirements</h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p><strong>Required columns:</strong> name, phonenumber, location</p>
                    <p><strong>Optional columns:</strong> email</p>
                    <p><strong>Phone format:</strong> 10-digit numbers only (e.g., 9876543210)</p>
                    <p className="text-blue-900 font-medium">💡 All new leads will be created with status "New"</p>
                    <p><strong>Sample format:</strong></p>
                    <div className="bg-white p-2 rounded border mt-2 font-mono text-xs">
                      name,phonenumber,location,email<br/>
                      John Doe,9876543210,Koramangala,john@example.com<br/>
                      Jane Smith,9876543211,BTM Layout,jane@example.com<br/>
                      Sample Lead,9876543212,Electronic City,sample@example.com
                    </div>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download Template</span>
                  </button>
                </div>

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>

                    {file ? (
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-green-700">Selected file:</p>
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-green-700 font-medium">{file.name}</span>
                          <span className="text-gray-500 text-sm">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          onClick={resetUpload}
                          className="text-sm text-gray-600 hover:text-gray-800 underline"
                        >
                          Choose different file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-lg text-gray-600">
                          Drag and drop your CSV file here, or{' '}
                          <label className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                            browse
                            <input
                              type="file"
                              accept=".csv"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        </p>
                        <p className="text-sm text-gray-500">Maximum file size: 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    disabled={uploading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Upload Leads</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Upload Results */
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Upload Complete
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">{uploadResults.totalRows}</div>
                      <div className="text-sm text-gray-600">Total Rows</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">{uploadResults.createdCount || 0}</div>
                      <div className="text-sm text-gray-600">Created</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-600">{uploadResults.existingInDatabase}</div>
                      <div className="text-sm text-gray-600">Already Exists</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-red-600">{uploadResults.invalidRows}</div>
                      <div className="text-sm text-gray-600">Invalid</div>
                    </div>
                  </div>
                </div>

                {/* Validation Errors */}
                {uploadResults.validationResults && uploadResults.validationResults.some(r => r.errors.length > 0) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-red-900 mb-3">Validation Errors</h4>
                    <div className="max-h-40 overflow-y-auto">
                      <div className="space-y-2">
                        {uploadResults.validationResults
                          .filter(result => result.errors.length > 0)
                          .map((result, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium text-red-800">Row {result.rowNumber}:</span>
                              <span className="text-red-700 ml-2">{result.errors.join(', ')}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing Leads */}
                {uploadResults.existingLeads && uploadResults.existingLeads.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-yellow-900 mb-3">Leads Already in Database</h4>
                    <div className="max-h-40 overflow-y-auto">
                      <div className="space-y-1">
                        {uploadResults.existingLeads.map((lead, index) => (
                          <div key={index} className="text-sm text-yellow-800">
                            {lead.name} ({lead.phone})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={resetUpload}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Upload Another File
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}