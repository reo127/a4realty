'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CleanupAgentLeadsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

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

    fetchAgents();
  }, [router]);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents?includeStats=true');
      const data = await response.json();

      if (data.success) {
        setAgents(data.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleUnassignAll = async () => {
    if (!selectedAgent) {
      setMessage('Please select an agent');
      setMessageType('error');
      return;
    }

    if (!confirm(`Are you sure you want to UNASSIGN ALL leads from ${selectedAgent.name}? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/leads/unassign-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: selectedAgent._id
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setMessageType('success');
        // Refresh agents list
        fetchAgents();
        setSelectedAgent(null);
      } else {
        setMessage(data.message || 'Failed to unassign leads');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error unassigning leads:', error);
      setMessage('Failed to unassign leads');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async (count) => {
    if (!selectedAgent) {
      setMessage('Please select an agent');
      setMessageType('error');
      return;
    }

    if (!confirm(`Assign ${count} new leads to ${selectedAgent.name}?`)) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch('/api/leads/bulk-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count: count,
          agentId: selectedAgent._id,
          assignedBy: adminUser._id || null,
          status: null,
          location: null
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setMessageType('success');
        // Refresh agents list
        fetchAgents();
      } else {
        setMessage(data.message || 'Failed to assign leads');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error assigning leads:', error);
      setMessage('Failed to assign leads');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Agent Lead Cleanup Tool</h1>
          <p className="text-gray-600 mt-2">Unassign all leads from an agent and optionally reassign fresh ones</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Agent Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Agent</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <div
                key={agent._id}
                onClick={() => setSelectedAgent(agent)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedAgent?._id === agent._id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-600">{agent.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">
                      {agent.currentAssignedCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">leads</div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    agent.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {selectedAgent && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Actions for {selectedAgent.name}
            </h2>

            <div className="space-y-4">
              {/* Current Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800">Currently Assigned Leads</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedAgent.currentAssignedCount || 0}</p>
                  </div>
                  <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>

              {/* Step 1: Unassign All */}
              <div className="border-2 border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Step 1: Remove All Leads
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  This will unassign ALL {selectedAgent.currentAssignedCount || 0} leads from {selectedAgent.name}.
                  The leads will become available for reassignment.
                </p>
                <button
                  onClick={handleUnassignAll}
                  disabled={loading || (selectedAgent.currentAssignedCount || 0) === 0}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Unassign All Leads
                    </>
                  )}
                </button>
              </div>

              {/* Step 2: Reassign Fresh Leads */}
              <div className="border-2 border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Step 2: Assign Fresh Leads (Optional)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  After removing duplicates, assign fresh leads to {selectedAgent.name}.
                  System will avoid duplicates automatically.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleReassign(50)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Assign 50 Leads
                  </button>
                  <button
                    onClick={() => handleReassign(100)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Assign 100 Leads
                  </button>
                  <button
                    onClick={() => handleReassign(150)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Assign 150 Leads
                  </button>
                  <button
                    onClick={() => handleReassign(200)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Assign 200 Leads
                  </button>
                </div>
              </div>
            </div>
          </div>
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
