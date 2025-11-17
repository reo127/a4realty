'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DuplicateCheckerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [selectedAgent, setSelectedAgent] = useState('all');

  useEffect(() => {
    // Check if user is admin
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== 'admin') {
        router.push('/admin');
        return;
      }
    } else {
      router.push('/login');
      return;
    }
  }, [router]);

  const handleDetectDuplicates = async () => {
    setDetecting(true);
    setMessage('');
    setReport(null);

    try {
      const response = await fetch('/api/debug/detect-duplicates');
      const data = await response.json();

      if (data.success) {
        setReport(data);
        if (data.summary.totalDuplicatesFound === 0 && data.summary.inconsistentLeadsFound === 0) {
          setMessage('✓ Great! No duplicates or inconsistencies found. Your database is clean!');
          setMessageType('success');
        } else {
          setMessage(`Found ${data.summary.totalDuplicatesFound} duplicates and ${data.summary.inconsistentLeadsFound} inconsistent records. Review details below.`);
          setMessageType('error');
        }
      } else {
        setMessage(data.message || 'Failed to detect duplicates');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error detecting duplicates:', error);
      setMessage('Failed to detect duplicates');
      setMessageType('error');
    } finally {
      setDetecting(false);
    }
  };

  const handleFixDuplicates = async (fixType) => {
    if (!confirm(`Are you sure you want to fix ${fixType === 'all' ? 'ALL' : fixType} issues? This action cannot be undone.`)) {
      return;
    }

    setFixing(true);
    setMessage('');

    try {
      const response = await fetch('/api/debug/remove-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgent !== 'all' ? selectedAgent : null,
          fixType: fixType
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setMessageType('success');

        // Refresh the report
        setTimeout(() => {
          handleDetectDuplicates();
        }, 1000);
      } else {
        setMessage(data.message || 'Failed to fix duplicates');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error fixing duplicates:', error);
      setMessage('Failed to fix duplicates');
      setMessageType('error');
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-4 text-sm">
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-500 hover:text-gray-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Admin
          </button>
          <span className="mx-2 text-gray-400">/</span>
          <button
            onClick={() => router.push('/admin/crm/leads')}
            className="text-gray-500 hover:text-gray-700"
          >
            CRM
          </button>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Duplicate Checker</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Duplicate Lead Checker</h1>
          <p className="text-gray-600">
            Detect and remove duplicate lead assignments and fix data inconsistencies
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">What This Tool Does</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Phone Duplicates:</strong> Finds when the same person (phone number) is assigned to the same agent multiple times</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Data Inconsistencies:</strong> Detects mismatched assignment fields (e.g., marked as assigned but no agent)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>One-Click Fix:</strong> Automatically removes duplicates (keeps most recent) and fixes data issues</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Safe Operation:</strong> Only affects duplicate assignments, doesn't delete leads or agents</span>
                </li>
              </ul>
              <div className="mt-3 text-sm text-blue-700">
                <strong>💡 Tip:</strong> Run this scan weekly or after bulk operations to keep your database clean.
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-start">
              {messageType === 'success' ? (
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Action Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan for Issues</h2>
          <p className="text-gray-600 mb-4">
            Click the button below to scan all agents and leads for duplicate assignments and data inconsistencies.
          </p>

          <button
            onClick={handleDetectDuplicates}
            disabled={detecting}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {detecting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scanning...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Scan for Duplicates & Issues
              </>
            )}
          </button>
        </div>

        {/* Report Display */}
        {report && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500 mb-1">Agents Checked</div>
                <div className="text-2xl font-bold text-gray-900">{report.summary.totalAgentsChecked}</div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500 mb-1">Agents with Issues</div>
                <div className={`text-2xl font-bold ${report.summary.agentsWithIssues > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {report.summary.agentsWithIssues}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500 mb-1">Total Duplicates</div>
                <div className={`text-2xl font-bold ${report.summary.totalDuplicatesFound > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {report.summary.totalDuplicatesFound}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500 mb-1">Inconsistent Records</div>
                <div className={`text-2xl font-bold ${report.summary.inconsistentLeadsFound > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {report.summary.inconsistentLeadsFound}
                </div>
              </div>
            </div>

            {/* Fix Actions */}
            {(report.summary.totalDuplicatesFound > 0 || report.summary.inconsistentLeadsFound > 0) && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Fix Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {report.summary.totalDuplicatesFound > 0 && (
                    <button
                      onClick={() => handleFixDuplicates('phone-duplicates')}
                      disabled={fixing}
                      className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Fix Phone Duplicates
                    </button>
                  )}

                  {report.summary.inconsistentLeadsFound > 0 && (
                    <button
                      onClick={() => handleFixDuplicates('inconsistent-data')}
                      disabled={fixing}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Fix Inconsistent Data
                    </button>
                  )}

                  {(report.summary.totalDuplicatesFound > 0 || report.summary.inconsistentLeadsFound > 0) && (
                    <button
                      onClick={() => handleFixDuplicates('all')}
                      disabled={fixing}
                      className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {fixing ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Fixing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Fix All Issues
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Detailed Report - Duplicates by Agent */}
            {report.duplicateReport && report.duplicateReport.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Agents with Duplicate Leads</h2>
                <div className="space-y-4">
                  {report.duplicateReport.map((agentReport, index) => (
                    <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50/50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{agentReport.agentName}</h3>
                          <p className="text-sm text-gray-600">{agentReport.agentEmail}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Total Assigned</div>
                          <div className="text-lg font-bold text-gray-900">{agentReport.totalAssignedLeads}</div>
                        </div>
                      </div>

                      {/* Phone Duplicates */}
                      {agentReport.duplicatesByPhone && agentReport.duplicatesByPhone.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-semibold text-red-800 mb-2">
                            📱 Duplicate Phone Numbers ({agentReport.duplicatesByPhone.length})
                          </div>
                          <div className="space-y-2">
                            {agentReport.duplicatesByPhone.map((dup, idx) => (
                              <div key={idx} className="bg-white rounded p-3 border border-red-200">
                                <div className="font-medium text-gray-900">Phone: {dup.phone}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {dup.count} leads with same phone number:
                                </div>
                                <ul className="mt-2 space-y-1">
                                  {dup.leads.map((lead, leadIdx) => (
                                    <li key={leadIdx} className="text-sm text-gray-700">
                                      • {lead.name} (ID: {lead.leadId.toString().slice(-6)})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* History Duplicates */}
                      {agentReport.historyDuplicates && agentReport.historyDuplicates.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold text-orange-800 mb-2">
                            📋 Leads Assigned Multiple Times ({agentReport.historyDuplicates.length})
                          </div>
                          <div className="space-y-2">
                            {agentReport.historyDuplicates.map((dup, idx) => (
                              <div key={idx} className="bg-white rounded p-3 border border-orange-200">
                                <div className="font-medium text-gray-900">{dup.name}</div>
                                <div className="text-sm text-gray-600">
                                  Phone: {dup.phone} • Assigned {dup.timesAssigned} times
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inconsistent Data */}
            {report.inconsistentLeads && report.inconsistentLeads.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Inconsistent Lead Data</h2>
                <div className="space-y-2">
                  {report.inconsistentLeads.map((lead, index) => (
                    <div key={index} className="border border-yellow-200 rounded-lg p-3 bg-yellow-50/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-600">
                            Phone: {lead.phone} • ID: {lead.leadId.toString().slice(-8)}
                          </div>
                        </div>
                        <div className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded">
                          {lead.issue}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.push('/admin/crm/leads')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to CRM
          </button>
        </div>
      </div>
    </div>
  );
}
