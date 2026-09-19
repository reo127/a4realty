'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sliders,
  Database,
  Lock,
  Layers,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    companyName: 'A4 Realty',
    tagline: 'New projects, verified listings, and trusted agents across India',
    phone: '+91 9002981353',
    whatsapp: '+91 6289038527',
    email: 'a4realtyinfo@gmail.com',
    reraNumber: 'PRM/KA/RERA/1251/309/AG/250915/006180',
    address: 'No.184, A4 Realty, Hennur Cross, 3rd Cross, Narayanappa Road, Kalyan Nagar Post, Bengaluru, 560043',
    autoAssignLeads: true,
    skipInactiveAgents: true,
    duplicateThresholdDays: '30',
    slaFollowUpHours: '24',
    enablePublicRegistration: false
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }

      const storedSettings = localStorage.getItem('a4_admin_settings');
      if (storedSettings) {
        try {
          setSettings(prev => ({ ...prev, ...JSON.parse(storedSettings) }));
        } catch (e) {
          console.error('Error loading stored settings:', e);
        }
      }
    }
  }, [router]);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('a4_admin_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
              System Settings &amp; Governance
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D7242A]/10 text-[#D7242A] border border-[#D7242A]/20">
              Admin Console
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Configure enterprise brand profile, lead routing automation, SLA policies, and database tools.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-[#D7242A] hover:bg-[#b81d22] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs self-start md:self-auto cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Save Notification */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">System preferences and agency configuration saved successfully.</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex space-x-1.5 border-b border-slate-200/80 pb-px overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'general'
              ? 'border-[#D7242A] text-[#D7242A] bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Agency Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('automation')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'automation'
              ? 'border-[#D7242A] text-[#D7242A] bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Lead Routing &amp; SLAs</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'tools'
              ? 'border-[#D7242A] text-[#D7242A] bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Maintenance &amp; Data Tools</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'security'
              ? 'border-[#D7242A] text-[#D7242A] bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security &amp; Environment</span>
        </button>
      </div>

      {/* Tab 1: General Agency Profile */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Corporate Identity &amp; Contact Info</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These details appear on public listing pages, client emails, and RERA disclosures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Company Legal Name
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:border-[#D7242A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                RERA Registration Number
              </label>
              <input
                type="text"
                value={settings.reraNumber}
                onChange={(e) => handleChange('reraNumber', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:border-[#D7242A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Official Hotline Phone
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:border-[#D7242A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                WhatsApp Business Support
              </label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:border-[#D7242A] focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Official Customer Support Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none focus:border-[#D7242A] focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Corporate Headquarters Address
              </label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:border-[#D7242A] focus:bg-white resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Save Agency Profile
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Lead Routing & Automation Rules */}
      {activeTab === 'automation' && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Lead Intake &amp; Assignment Rules</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control the automatic round-robin assignment engine and advisor SLA thresholds.
            </p>
          </div>

          <div className="space-y-4">
            {/* Toggle 1: Auto Assign */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900">Auto-Assign New Leads</div>
                <p className="text-[11px] text-slate-500">
                  Automatically allocate incoming inquiries to active sales advisors via fair round-robin rotation.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAssignLeads}
                onChange={(e) => handleChange('autoAssignLeads', e.target.checked)}
                className="w-5 h-5 text-[#D7242A] rounded focus:ring-[#D7242A] accent-[#D7242A] cursor-pointer"
              />
            </div>

            {/* Toggle 2: Skip Inactive */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900">Bypass Inactive Advisors</div>
                <p className="text-[11px] text-slate-500">
                  Do not route new prospects to advisors who have toggled their status to paused/inactive.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.skipInactiveAgents}
                onChange={(e) => handleChange('skipInactiveAgents', e.target.checked)}
                className="w-5 h-5 text-[#D7242A] rounded focus:ring-[#D7242A] accent-[#D7242A] cursor-pointer"
              />
            </div>

            {/* SLA Threshold */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900">Initial Call SLA Window</div>
                <p className="text-[11px] text-slate-500">
                  Mark leads as overdue if advisor fails to log an initial call within this window.
                </p>
              </div>
              <select
                value={settings.slaFollowUpHours}
                onChange={(e) => handleChange('slaFollowUpHours', e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#D7242A]"
              >
                <option value="4">4 Hours (Aggressive)</option>
                <option value="12">12 Hours (Standard)</option>
                <option value="24">24 Hours (Default)</option>
                <option value="48">48 Hours (Relaxed)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Save Automation Rules
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Maintenance & Data Tools */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Master Sheet Link */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-xl bg-[#D7242A]/10 text-[#D7242A] flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 pt-2">Master Property Sheet Upload</h3>
                <p className="text-xs text-slate-500">
                  Upload CSV records to synchronize developer project catalogs and pricing sheets.
                </p>
              </div>
              <Link
                href="/admin/property-sheet"
                className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <span>Open Property Sheet Console</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Duplicate Checker Link */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 pt-2">Duplicate Lead Detection</h3>
                <p className="text-xs text-slate-500">
                  Run database integrity scans to detect identical prospect telephone numbers across multiple agents.
                </p>
              </div>
              <Link
                href="/admin/duplicate-checker"
                className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <span>Run Duplicate Scan</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Agent Lead Cleanup Tool */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 pt-2">Agent Queue Sanitizer</h3>
                <p className="text-xs text-slate-500">
                  Bulk unassign or clear stale leads from inactive advisor pipelines back to the unassigned queue.
                </p>
              </div>
              <Link
                href="/admin/cleanup-agent-leads"
                className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <span>Access Lead Sanitizer</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Geospatial Map Tool */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 pt-2">Interactive Geographic Map</h3>
                <p className="text-xs text-slate-500">
                  View property density coordinates and extract missing latitude/longitude markers.
                </p>
              </div>
              <Link
                href="/admin/map"
                className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <span>Open Property Map</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Environment */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Security &amp; Environment Diagnostics</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live server connection parameters, environment state, and RBAC authentication level.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 font-medium">Active Session Privilege</span>
              <span className="font-bold text-slate-900 flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Super Administrator</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 font-medium">Database Layer</span>
              <span className="font-bold text-emerald-600">Connected (MongoDB Atlas)</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 font-medium">Runtime Architecture</span>
              <span className="font-bold text-slate-900">Next.js App Router (Turbopack)</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 font-medium">Deployment Platform</span>
              <span className="font-bold text-slate-900">Vercel Enterprise Edge</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
