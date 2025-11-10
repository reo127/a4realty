'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PropertySheetUpload() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [clearExisting, setClearExisting] = useState(true);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Check if user is admin
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role !== 'admin') {
        router.push('/admin');
        return;
      }
    }
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/property-sheet/upload');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setMessage({ type: '', text: '' });
    } else {
      setMessage({ type: 'error', text: 'Please select a valid CSV file' });
      setFile(null);
    }
  };

  const parseCSV = (text) => {
    // Proper CSV parser that handles multi-line fields
    const result = [];
    let row = [];
    let cell = '';
    let insideQuotes = false;

    // Parse character by character
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          cell += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of cell
        row.push(cell.trim());
        cell = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        // End of row
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n in \r\n
        }
        if (cell || row.length > 0) {
          row.push(cell.trim());
          if (row.some(c => c.length > 0)) { // Only add non-empty rows
            result.push(row);
          }
          row = [];
          cell = '';
        }
      } else {
        // Regular character
        cell += char;
      }
    }

    // Add last cell and row if exists
    if (cell || row.length > 0) {
      row.push(cell.trim());
      if (row.some(c => c.length > 0)) {
        result.push(row);
      }
    }

    if (result.length === 0) {
      return [];
    }

    // First row is headers
    const headers = result[0].map(h => h.trim());

    // Convert remaining rows to objects
    const data = [];
    for (let i = 1; i < result.length; i++) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = result[i][index] || '';
      });
      data.push(row);
    }

    return data;
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const text = await file.text();
      const csvData = parseCSV(text);

      const response = await fetch('/api/property-sheet/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData,
          clearExisting
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Successfully uploaded ${data.count} properties!`
        });
        setFile(null);
        fetchStats();
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Upload failed'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to upload file. Please check the file format.'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 text-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Sheet Upload</h1>
          <p className="text-gray-600 mt-2">Upload CSV file to update property database</p>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Database Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalProperties}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Last Upload</p>
                <p className="text-lg font-semibold text-green-600">
                  {stats.lastUploadDate
                    ? new Date(stats.lastUploadDate).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New CSV File</h2>

          {/* Messages */}
          {message.text && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            {file && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Clear Existing Checkbox */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Clear existing data before upload (recommended)
              </span>
            </label>
            <p className="ml-6 text-xs text-gray-500 mt-1">
              This will delete all existing properties and replace with new data
            </p>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Instructions:</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• File must be in CSV format (.csv)</li>
              <li>• First row must contain column headers</li>
              <li>• Required columns: BUILDER NAME, PROJECT NAME, LOCATION</li>
              <li>• Optional columns: All other fields from the template</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
